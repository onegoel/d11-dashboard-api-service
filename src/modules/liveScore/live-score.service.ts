import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { AxiosError } from "axios";
import type {
  WisdenCommentaryResponse,
  WisdenScorecardResponse,
  WisdenScorecardBattingEntry,
  WisdenScorecardBowlingEntry,
  WisdenWinVizResponse,
  WisdenManhattanResponse,
  WisdenWagonWheelResponse,
} from "../../common/types/wisden.types.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { WisdenService } from "../wisden/wisden.service.js";
import { MatchResult, MatchStatus } from "../../../generated/prisma/client.js";
import { FantasyScoringService } from "../fantasy/scoring/fantasy-scoring.service.js";
import { FantasySquadsService } from "../fantasy/squads/fantasy-squads.service.js";
import { withDerivedMatchResult } from "./wisden-match-result.util.js";
import {
  computeScoringBreakdown,
  type ScoringBreakdownResponse,
} from "./scoring-breakdown.util.js";

interface CacheEntry {
  data: unknown;
  setAt: number;
}

// TTL for on-demand cache hits; poller refreshes more frequently
const ON_DEMAND_TTL_MS = 90_000;
const IMPACT_RETRY_LOOKBACK_HOURS = 72;
const IMPACT_RETRY_BATCH_SIZE = 25;

@Injectable()
export class LiveScoreService {
  private readonly logger = new Logger(LiveScoreService.name);

  private readonly scorecardCache = new Map<string, CacheEntry>();
  private readonly commentaryCache = new Map<string, CacheEntry>();
  private readonly winvizCache = new Map<string, CacheEntry>();
  private readonly manhattanCache = new Map<string, CacheEntry>();
  private readonly wagonCache = new Map<string, CacheEntry>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly wisden: WisdenService,
    private readonly scoringService: FantasyScoringService,
    private readonly squadsService: FantasySquadsService,
  ) {}

  @Cron("17 */6 * * *", { timeZone: "Asia/Kolkata" })
  async scheduledDelayedImpactBackfill() {
    await this.backfillDelayedImpactScores(
      IMPACT_RETRY_LOOKBACK_HOURS,
      IMPACT_RETRY_BATCH_SIZE,
    );
  }

  // ── Public read APIs ──────────────────────────────────────────────────────

  async getWisdenScorecard(matchId: string): Promise<unknown> {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        wisdenMatchGid: true,
        wisdenScore: true,
        status: true,
        wisdenStatus: true,
        matchResult: true,
        matchResultText: true,
        wisdenScoringFinalizedAt: true,
      },
    });

    if (!match) return null;

    const storedScorecard = match.wisdenScore ?? null;
    const wisdenMatchGid = match.wisdenMatchGid;

    const scorecardWithPersistedResult =
      storedScorecard !== null
        ? ({
            ...(storedScorecard as WisdenScorecardResponse),
            ...(match.matchResultText
              ? { match_result: match.matchResultText }
              : {}),
          } as WisdenScorecardResponse)
        : null;

    if (match.status === MatchStatus.COMPLETED && storedScorecard !== null) {
      const derived = withDerivedMatchResult(
        storedScorecard as WisdenScorecardResponse,
      );
      const resultText = derived.scorecard.match_result ?? null;
      const shouldUpdateResultText =
        resultText !== null && resultText !== match.matchResultText;
      const shouldUpdateOutcome =
        match.matchResult === MatchResult.PENDING &&
        derived.outcome !== MatchResult.PENDING;
      const shouldUpdateStatus = match.wisdenStatus === null;

      if (shouldUpdateResultText || shouldUpdateOutcome || shouldUpdateStatus) {
        await this.prisma.client.match.update({
          where: { id: match.id },
          data: {
            ...(shouldUpdateResultText ? { matchResultText: resultText } : {}),
            ...(shouldUpdateStatus
              ? {
                  wisdenStatus:
                    match.wisdenStatus ??
                    derived.scorecard.match_status ??
                    "complete",
                  wisdenLastSyncedAt: new Date(),
                }
              : {}),
            ...(shouldUpdateOutcome ? { matchResult: derived.outcome } : {}),
          },
        });
      }

      const base = {
        ...(storedScorecard as WisdenScorecardResponse),
        ...(resultText ? { match_result: resultText } : {}),
      };

      // If scoring has been finalized, enrich innings rows with advanced metrics from DB
      if (match.wisdenScoringFinalizedAt) {
        return this.enrichScorecardFromDb(matchId, base);
      }
      return base;
    }

    // Match GID is now managed via fixture-seed ingestion; no runtime lookup needed.
    if (!wisdenMatchGid) {
      if (scorecardWithPersistedResult !== null) {
        this.logger.warn(
          `Serving stored scorecard snapshot for matchId=${matchId} because wisdenMatchGid is missing`,
        );
        return scorecardWithPersistedResult;
      }
      return null;
    }

    const key = `wisden:scorecard:${wisdenMatchGid}`;
    const cached = this.getIfFresh(this.scorecardCache, key);
    if (cached !== undefined) return cached;

    const stale = this.getAny(this.scorecardCache, key);
    try {
      // Use the advanced scorecard for live matches to get impact metrics
      const data = await this.wisden.getAdvancedScorecard(wisdenMatchGid);
      this.setCache(this.scorecardCache, key, data);
      return data;
    } catch (error) {
      if (stale !== undefined && this.isThrottleOrUpstreamUnavailable(error)) {
        this.logger.warn(
          `Serving stale scorecard cache for ${wisdenMatchGid} due to upstream throttle/unavailability`,
        );
        return stale;
      }
      throw error;
    }
  }

  /**
   * Overlays advanced metrics (impact, dot%, boundary%) from FantasyPlayerMatchStats
   * onto the stored basic scorecard blob for completed, finalized matches.
   */
  private async enrichScorecardFromDb(
    matchId: string,
    scorecard: WisdenScorecardResponse,
  ): Promise<WisdenScorecardResponse> {
    const matchPlayers = await this.prisma.client.fantasyMatchPlayer.findMany({
      where: { matchId, wisdenPlayerId: { not: null } },
      select: { wisdenPlayerId: true, fantasyPlayerId: true },
    });

    if (matchPlayers.length === 0) return scorecard;

    const fantasyPlayerIds = matchPlayers.map((mp) => mp.fantasyPlayerId);
    const statsRows = await this.prisma.client.fantasyPlayerMatchStats.findMany(
      {
        where: { matchId, fantasyPlayerId: { in: fantasyPlayerIds } },
        select: {
          fantasyPlayerId: true,
          battingImpact: true,
          boundaryScoredPct: true,
          dotsPlayedPct: true,
          bowlingImpact: true,
          dotBalls: true,
          ballsBowled: true,
        },
      },
    );

    const fpIdToStats = new Map(statsRows.map((s) => [s.fantasyPlayerId, s]));
    const wisdenIdToStats = new Map<string, (typeof statsRows)[number]>();
    for (const mp of matchPlayers) {
      if (!mp.wisdenPlayerId) continue;
      const stats = fpIdToStats.get(mp.fantasyPlayerId);
      if (stats) wisdenIdToStats.set(mp.wisdenPlayerId, stats);
    }

    if (wisdenIdToStats.size === 0) return scorecard;

    const enrichedInnings = (scorecard.innings ?? []).map((innings) => ({
      ...innings,
      batting: (innings.batting ?? []).map((batter) => {
        const stats = wisdenIdToStats.get(String(batter.player_id));
        if (!stats) return batter;
        return {
          ...batter,
          dot_ball_percentage:
            stats.dotsPlayedPct ?? batter.dot_ball_percentage ?? null,
          boundary_percentage:
            stats.boundaryScoredPct ?? batter.boundary_percentage ?? null,
          impact: stats.battingImpact ?? batter.impact ?? null,
        } satisfies WisdenScorecardBattingEntry;
      }),
      bowling: (innings.bowling ?? []).map((bowler) => {
        const bowlerId = String(
          (bowler as { bowler_id?: number }).bowler_id ??
            bowler.player_id ??
            "",
        );
        const stats = wisdenIdToStats.get(bowlerId);
        if (!stats) return bowler;
        const dotPct =
          stats.ballsBowled > 0
            ? Math.round((stats.dotBalls / stats.ballsBowled) * 1000) / 10
            : null;
        return {
          ...bowler,
          impact: stats.bowlingImpact ?? bowler.impact ?? null,
          dot_ball_percentage: dotPct ?? bowler.dot_ball_percentage ?? null,
        } satisfies WisdenScorecardBowlingEntry;
      }),
    }));

    return { ...scorecard, innings: enrichedInnings };
  }

  async getWisdenCommentary(matchId: string): Promise<unknown> {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { wisdenMatchGid: true, wisdenCommentary: true, status: true },
    });

    if (!match) return null;

    if (
      match.status === MatchStatus.COMPLETED &&
      match.wisdenCommentary !== null
    ) {
      return match.wisdenCommentary;
    }

    const wisdenMatchGid = match.wisdenMatchGid ?? null;
    if (!wisdenMatchGid) return null;

    const key = `wisden:commentary:${wisdenMatchGid}`;
    const cached = this.getIfFresh(this.commentaryCache, key);
    if (cached !== undefined) return cached;

    const stale = this.getAny(this.commentaryCache, key);
    try {
      const data = await this.wisden.getCommentaryBasic(wisdenMatchGid);
      this.setCache(this.commentaryCache, key, data);
      return data;
    } catch (error) {
      if (stale !== undefined && this.isThrottleOrUpstreamUnavailable(error)) {
        this.logger.warn(
          `Serving stale commentary cache for ${wisdenMatchGid} due to upstream throttle/unavailability`,
        );
        return stale;
      }
      throw error;
    }
  }

  async getScoringBreakdown(
    matchId: string,
  ): Promise<ScoringBreakdownResponse | null> {
    const [scorecard, commentary] = await Promise.all([
      this.getWisdenScorecard(
        matchId,
      ) as Promise<WisdenScorecardResponse | null>,
      this.getWisdenCommentary(
        matchId,
      ) as Promise<WisdenCommentaryResponse | null>,
    ]);

    if (!scorecard) return null;
    return computeScoringBreakdown(scorecard, commentary);
  }

  async getWinViz(matchId: string): Promise<WisdenWinVizResponse | null> {
    return this.fetchWisdenAuxiliary<WisdenWinVizResponse>({
      matchId,
      cache: this.winvizCache,
      keyPrefix: "wisden:winviz",
      label: "winviz",
      fetcher: (gid) => this.wisden.getWinVizHistory(gid),
    });
  }

  async getManhattan(matchId: string): Promise<WisdenManhattanResponse | null> {
    return this.fetchWisdenAuxiliary<WisdenManhattanResponse>({
      matchId,
      cache: this.manhattanCache,
      keyPrefix: "wisden:manhattan",
      label: "manhattan",
      fetcher: (gid) => this.wisden.getManhattan(gid),
    });
  }

  async getWagonWheel(
    matchId: string,
  ): Promise<WisdenWagonWheelResponse | null> {
    return this.fetchWisdenAuxiliary<WisdenWagonWheelResponse>({
      matchId,
      cache: this.wagonCache,
      keyPrefix: "wisden:wagon",
      label: "wagon",
      fetcher: (gid) => this.wisden.getWagonWheel(gid),
    });
  }

  private async fetchWisdenAuxiliary<T>({
    matchId,
    cache,
    keyPrefix,
    label,
    fetcher,
  }: {
    matchId: string;
    cache: Map<string, CacheEntry>;
    keyPrefix: string;
    label: string;
    fetcher: (matchGid: string) => Promise<T>;
  }): Promise<T | null> {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { wisdenMatchGid: true },
    });
    const wisdenMatchGid = match?.wisdenMatchGid ?? null;
    if (!wisdenMatchGid) return null;

    const key = `${keyPrefix}:${wisdenMatchGid}`;
    const cached = this.getIfFresh(cache, key);
    if (cached !== undefined) return cached as T;

    const stale = this.getAny(cache, key);
    try {
      const data = await fetcher(wisdenMatchGid);
      this.setCache(cache, key, data);
      return data;
    } catch (error) {
      if (stale !== undefined && this.isThrottleOrUpstreamUnavailable(error)) {
        this.logger.warn(
          `Serving stale ${label} cache for ${wisdenMatchGid} due to upstream throttle/unavailability`,
        );
        return stale as T;
      }
      throw error;
    }
  }

  async backfillHistoricalMatches(): Promise<{
    processed: number;
    skipped: number;
    errors: number;
  }> {
    const matches = await this.prisma.client.match.findMany({
      where: {
        status: MatchStatus.COMPLETED,
        wisdenMatchGid: { not: null },
      },
      orderBy: { matchDate: "asc" },
      select: {
        id: true,
        wisdenMatchGid: true,
        wisdenScore: true,
        wisdenCommentary: true,
      },
    });

    this.logger.log(
      `[AUDIT] backfillHistoricalMatches START total=${matches.length}`,
    );
    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const match of matches) {
      const gid = match.wisdenMatchGid!;
      this.logger.log(
        `[AUDIT] backfillHistoricalMatches processing matchId=${match.id} gid=${gid}`,
      );
      try {
        let scorecard = (match.wisdenScore ??
          null) as WisdenScorecardResponse | null;
        let commentary = (match.wisdenCommentary ??
          null) as WisdenCommentaryResponse | null;

        if (match.wisdenScore === null || match.wisdenCommentary === null) {
          const fetched = await Promise.all([
            this.wisden.getScorecard(gid),
            this.wisden.getCommentaryBasic(gid),
          ]);
          scorecard = fetched[0];
          commentary = fetched[1];
          await this.prisma.client.match.update({
            where: { id: match.id },
            data: {
              wisdenScore: scorecard as any,
              wisdenCommentary: commentary as any,
            },
          });
        }

        if (!scorecard || !commentary) {
          skipped++;
          this.logger.warn(
            `Backfill skipped scoring for matchId=${match.id} gid=${gid}: missing scorecard/commentary snapshot`,
          );
          continue;
        }

        const mappedPlayers = await this.prisma.client.fantasyMatchPlayer.count(
          {
            where: {
              matchId: match.id,
              wisdenPlayerId: { not: null },
            },
          },
        );

        if (mappedPlayers === 0) {
          await this.squadsService.getMatchSquad(match.id);
        }

        try {
          await this.scoringService.scoreWisdenMatch(
            match.id,
            commentary,
            scorecard,
          );
        } catch (scoreErr) {
          const scoreMsg =
            scoreErr instanceof Error ? scoreErr.message : String(scoreErr);
          this.logger.warn(
            `Backfill scoring failed for matchId=${match.id} gid=${gid}: ${scoreMsg}`,
          );
        }

        processed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Backfill failed for matchId=${match.id} gid=${gid}: ${msg}`,
        );
        errors++;
      }
      // Brief pause to avoid Wisden rate limits
      await new Promise((r) => setTimeout(r, 300));
    }

    this.logger.log(
      `[AUDIT] backfillHistoricalMatches END processed=${processed} skipped=${skipped} errors=${errors} total=${matches.length}`,
    );
    return { processed, skipped, errors };
  }

  async backfillMatchStats(): Promise<{
    processed: number;
    errors: number;
  }> {
    const matches = await this.prisma.client.match.findMany({
      where: {
        status: MatchStatus.COMPLETED,
        wisdenMatchGid: { not: null },
      },
      orderBy: { matchDate: "asc" },
      select: { id: true, wisdenMatchGid: true },
    });

    let processed = 0;
    let errors = 0;

    for (const match of matches) {
      try {
        await this.scoringService.scoreMatchStatsOnly(match.id);
        processed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `backfillMatchStats failed for matchId=${match.id}: ${msg}`,
        );
        errors++;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    this.logger.log(
      `backfillMatchStats complete: processed=${processed}, errors=${errors}, total=${matches.length}`,
    );
    return { processed, errors };
  }

  async backfillDelayedImpactScores(
    lookbackHours = IMPACT_RETRY_LOOKBACK_HOURS,
    maxMatches = IMPACT_RETRY_BATCH_SIZE,
  ): Promise<{
    candidates: number;
    processed: number;
    skipped: number;
    errors: number;
  }> {
    const now = new Date();
    const lookbackFrom = new Date(
      now.getTime() - lookbackHours * 60 * 60 * 1000,
    );

    const matches = await this.prisma.client.match.findMany({
      where: {
        status: MatchStatus.COMPLETED,
        wisdenMatchGid: { not: null },
        matchDate: { gte: lookbackFrom, lte: now },
      },
      orderBy: { matchDate: "asc" },
      take: maxMatches,
      select: { id: true, wisdenMatchGid: true, matchDate: true },
    });

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const match of matches) {
      const hasAnyImpact =
        await this.prisma.client.fantasyPlayerMatchStats.findFirst({
          where: {
            matchId: match.id,
            OR: [
              { battingImpact: { not: null } },
              { bowlingImpact: { not: null } },
            ],
          },
          select: { fantasyPlayerId: true },
        });

      if (hasAnyImpact) {
        skipped++;
        continue;
      }

      try {
        await this.scoringService.scoreMatchStatsOnly(match.id);
        processed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `backfillDelayedImpactScores failed for matchId=${match.id}: ${msg}`,
        );
        errors++;
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    this.logger.log(
      `backfillDelayedImpactScores complete: candidates=${matches.length}, processed=${processed}, skipped=${skipped}, errors=${errors}, lookbackHours=${lookbackHours}`,
    );

    return {
      candidates: matches.length,
      processed,
      skipped,
      errors,
    };
  }

  async backfillRecalculateFantasyPoints(): Promise<{
    processed: number;
    errors: number;
  }> {
    const matches = await this.prisma.client.match.findMany({
      where: {
        status: MatchStatus.COMPLETED,
        wisdenMatchGid: { not: null },
      },
      orderBy: { matchDate: "asc" },
      select: { id: true, wisdenMatchGid: true },
    });

    this.logger.log(
      `[AUDIT] backfillRecalculateFantasyPoints START total=${matches.length}`,
    );
    let processed = 0;
    let errors = 0;

    for (const match of matches) {
      this.logger.log(
        `[AUDIT] backfillRecalculateFantasyPoints processing matchId=${match.id}`,
      );
      try {
        await this.scoringService.scoreMatch(match.id);
        processed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `backfillRecalculateFantasyPoints failed for matchId=${match.id}: ${msg}`,
        );
        errors++;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    this.logger.log(
      `[AUDIT] backfillRecalculateFantasyPoints END processed=${processed} errors=${errors} total=${matches.length}`,
    );
    return { processed, errors };
  }

  async pollAndCacheWisdenMatch(matchGid: string): Promise<{
    scorecard: WisdenScorecardResponse | null;
    commentary: WisdenCommentaryResponse | null;
  }> {
    const [scorecard, commentary] = await Promise.allSettled([
      this.fetchAndCacheWisdenScorecard(matchGid),
      this.fetchAndCacheWisdenCommentary(matchGid),
    ]);

    return {
      scorecard: scorecard.status === "fulfilled" ? scorecard.value : null,
      commentary: commentary.status === "fulfilled" ? commentary.value : null,
    };
  }

  evictWisdenMatch(matchGid: string): void {
    this.scorecardCache.delete(`wisden:scorecard:${matchGid}`);
    this.commentaryCache.delete(`wisden:commentary:${matchGid}`);
  }

  private async fetchAndCacheWisdenScorecard(
    matchGid: string,
  ): Promise<WisdenScorecardResponse> {
    try {
      const data = await this.wisden.getScorecard(matchGid);
      this.setCache(this.scorecardCache, `wisden:scorecard:${matchGid}`, data);
      return data;
    } catch (err) {
      const msg = err instanceof AxiosError ? err.message : String(err);
      this.logger.error(
        `Wisden scorecard fetch failed for ${matchGid}: ${msg}`,
      );
      throw err;
    }
  }

  private async fetchAndCacheWisdenCommentary(
    matchGid: string,
  ): Promise<WisdenCommentaryResponse> {
    try {
      const data = await this.wisden.getCommentaryBasic(matchGid);
      this.setCache(
        this.commentaryCache,
        `wisden:commentary:${matchGid}`,
        data,
      );
      return data;
    } catch (err) {
      const msg = err instanceof AxiosError ? err.message : String(err);
      this.logger.error(
        `Wisden commentary fetch failed for ${matchGid}: ${msg}`,
      );
      throw err;
    }
  }

  private getIfFresh(
    cache: Map<string, CacheEntry>,
    key: string,
  ): unknown | undefined {
    const cached = cache.get(key);
    if (!cached) return undefined;
    if (Date.now() - cached.setAt >= ON_DEMAND_TTL_MS) return undefined;
    return cached.data;
  }

  private getAny(
    cache: Map<string, CacheEntry>,
    key: string,
  ): unknown | undefined {
    return cache.get(key)?.data;
  }

  private setCache(
    cache: Map<string, CacheEntry>,
    key: string,
    data: unknown,
  ): void {
    cache.set(key, { data, setAt: Date.now() });
  }

  private isThrottleOrUpstreamUnavailable(error: unknown): boolean {
    if (error instanceof HttpException) {
      const status = error.getStatus();
      return status === 429 || status === 503;
    }

    if (error instanceof AxiosError) {
      const status = error.response?.status;
      return status === 429 || status === 503;
    }

    return false;
  }
}
