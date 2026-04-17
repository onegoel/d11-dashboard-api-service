import { Injectable, Logger } from "@nestjs/common";
import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service.js";
import { LiveScoreService } from "./live-score.service.js";
import { FantasyScoringService } from "../fantasy/scoring/fantasy-scoring.service.js";
import { MatchResult, MatchStatus } from "../../../generated/prisma/client.js";
import { withDerivedMatchResult } from "./wisden-match-result.util.js";
import type {
  WisdenCommentaryResponse,
  WisdenScorecardInnings,
  WisdenScorecardResponse,
} from "../../common/types/wisden.types.js";

const POLL_INTERVAL_MS = 30_000;
const PRE_START_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const HISTORICAL_ONE_SHOT_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours past start

function isWisdenMatchComplete(
  scorecard: WisdenScorecardResponse | null,
): boolean {
  return (scorecard?.match_status ?? "").toLowerCase() === "complete";
}

function hasWisdenPlayStarted(
  scorecard: WisdenScorecardResponse | null,
  commentary: WisdenCommentaryResponse | null,
): boolean {
  const hasCommentary =
    commentary?.innings?.some((innings) => (innings.bbb?.length ?? 0) > 0) ??
    false;
  const hasScorecardBalls =
    scorecard?.innings?.some(
      (innings) => (innings.total_ball_count ?? 0) > 0,
    ) ?? false;

  return hasCommentary || hasScorecardBalls;
}

function formatWisdenInningsSnapshot(innings: WisdenScorecardInnings): string {
  return `Inn${innings.innings_number ?? "?"}: ${innings.runs ?? 0}/${innings.wickets ?? 0} (${innings.overs ?? "0"})`;
}

function scoreSnapshot(scorecard: WisdenScorecardResponse | null): string {
  try {
    if (!scorecard) return "(no scorecard data)";

    const home = scorecard.team1?.abbreviation ?? "HM";
    const away = scorecard.team2?.abbreviation ?? "AW";
    const parts = (scorecard.innings ?? []).map(formatWisdenInningsSnapshot);
    const status = scorecard.match_status ?? "unknown";

    return `${home} vs ${away} | ${parts.join(" — ") || "pre-toss"} | ${status}`;
  } catch {
    return "(parse error)";
  }
}

@Injectable()
export class MatchPollerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MatchPollerService.name);

  /** matchId → active polling interval handle */
  private readonly activePolls = new Map<
    string,
    ReturnType<typeof setInterval>
  >();
  /** matchId → pre-start schedule timer */
  private readonly pendingTimers = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  constructor(
    private readonly liveScoreService: LiveScoreService,
    private readonly prisma: PrismaService,
    private readonly scoringService: FantasyScoringService,
  ) {}

  async onModuleInit() {
    this.logger.log("Match poller initializing");
    // Schedule polling for all upcoming matches that have a CA fixture ID
    await this.scheduleUpcomingMatches();
  }

  onModuleDestroy() {
    for (const t of this.activePolls.values()) clearInterval(t);
    for (const t of this.pendingTimers.values()) clearTimeout(t);
    this.activePolls.clear();
    this.pendingTimers.clear();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Called externally (e.g. after match ingestion) to register a new match.
   * Safe to call multiple times for the same ID (idempotent).
   */
  scheduleMatch(matchId: string, matchDate: Date): void {
    if (this.activePolls.has(matchId) || this.pendingTimers.has(matchId)) {
      this.logger.log(`[${matchId}] Poll already registered, skipping`);
      return;
    }

    const msUntilPollStart =
      matchDate.getTime() - Date.now() - PRE_START_WINDOW_MS;

    this.logger.log(
      `[${matchId}] schedule request: match=${matchDate.toISOString()} pollStart=${new Date(matchDate.getTime() - PRE_START_WINDOW_MS).toISOString()} in=${Math.round(msUntilPollStart / 1000)}s`,
    );

    if (msUntilPollStart <= 0) {
      // Already within or past the 30-min pre-start window
      const ageMs = Date.now() - matchDate.getTime();
      if (ageMs > HISTORICAL_ONE_SHOT_AGE_MS) {
        this.logger.log(
          `[${matchId}] Match start is stale (${Math.round(ageMs / 60_000)}m old); running one-shot historical sync instead of interval polling`,
        );
        void this.runHistoricalOneShotSync(matchId);
        return;
      }

      this.logger.log(
        `[${matchId}] Starting immediately (already within pre-start window)`,
      );
      void this.startPolling(matchId);
      return;
    }

    // Clear any stale pending timer first
    const existing = this.pendingTimers.get(matchId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.logger.log(`[${matchId}] Pre-start timer fired; beginning poll`);
      void this.startPolling(matchId);
    }, msUntilPollStart);
    this.pendingTimers.set(matchId, timer);
    this.logger.log(
      `[${matchId}] Scheduled poll in ${Math.round(msUntilPollStart / 60_000)}m`,
    );
  }

  stopPolling(matchId: string): void {
    const interval = this.activePolls.get(matchId);
    if (interval) {
      clearInterval(interval);
      this.activePolls.delete(matchId);
      this.logger.log(
        `[${matchId}] Stopped polling (active=${this.activePolls.size}, pending=${this.pendingTimers.size})`,
      );
    }

    const timer = this.pendingTimers.get(matchId);
    if (timer) {
      clearTimeout(timer);
      this.pendingTimers.delete(matchId);
    }
  }

  getPollingStatus(): { active: string[]; pending: string[] } {
    return {
      active: Array.from(this.activePolls.keys()),
      pending: Array.from(this.pendingTimers.keys()),
    };
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async startPolling(matchId: string): Promise<void> {
    if (this.activePolls.has(matchId)) {
      this.logger.log(`[${matchId}] startPolling called but already active`);
      return;
    }

    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true, wisdenMatchGid: true },
    });

    if (!match?.wisdenMatchGid) {
      this.logger.warn(
        `[${matchId}] Missing wisdenMatchGid; skipping poll start`,
      );
      return;
    }
    const wisdenMatchGid = match.wisdenMatchGid;

    this.logger.log(`[${matchId}] Starting Wisden live poll`);
    this.pendingTimers.delete(matchId);

    const poll = async () => {
      try {
        this.logger.log(`[${matchId}] Poll tick`);
        const data =
          await this.liveScoreService.pollAndCacheWisdenMatch(wisdenMatchGid);
        this.logger.log(`[${matchId}] Score: ${scoreSnapshot(data.scorecard)}`);

        if (!data.scorecard) {
          this.logger.warn(`[${matchId}] Poll tick missing scorecard`);
          return;
        }

        const playStarted = hasWisdenPlayStarted(
          data.scorecard,
          data.commentary,
        );

        if (playStarted) {
          await this.prisma.client.match.update({
            where: { id: matchId },
            data: {
              status: MatchStatus.LIVE,
              wisdenStatus: data.scorecard.match_status ?? "live",
              wisdenLastSyncedAt: new Date(),
            },
          });
        }

        if (isWisdenMatchComplete(data.scorecard)) {
          this.logger.log(
            `[${matchId}] Match completion detected; persisting final Wisden snapshots`,
          );
          await this.persistFinalScorecard(
            matchId,
            data.scorecard,
            data.commentary,
          );
          this.stopPolling(matchId);
          this.liveScoreService.evictWisdenMatch(wisdenMatchGid);
          this.logger.log(`[${matchId}] Match complete — poll stopped`);
          return;
        }

        if (playStarted && data.commentary) {
          try {
            await this.scoringService.scoreWisdenLive(
              matchId,
              data.commentary,
              data.scorecard,
            );
            await this.scoringService.refreshLiveContest(matchId);
          } catch (liveErr) {
            this.logger.warn(
              `[${matchId}] Live scoring error (non-fatal): ${String(liveErr)}`,
            );
          }
        }

        this.logger.log(`[${matchId}] Poll tick complete (match still live)`);
      } catch (err) {
        this.logger.warn(`[${matchId}] Poll error: ${String(err)}`);
      }
    };

    // First fetch immediately, then on interval
    void poll();
    const interval = setInterval(() => void poll(), POLL_INTERVAL_MS);
    this.activePolls.set(matchId, interval);
    this.logger.log(
      `[${matchId}] Poll interval registered (${POLL_INTERVAL_MS / 1000}s)`,
    );
  }

  private async runHistoricalOneShotSync(matchId: string): Promise<void> {
    try {
      const match = await this.prisma.client.match.findUnique({
        where: { id: matchId },
        select: { id: true, wisdenMatchGid: true },
      });

      if (!match?.wisdenMatchGid) {
        this.logger.warn(
          `[${matchId}] One-shot sync skipped: missing wisdenMatchGid`,
        );
        return;
      }

      const data = await this.liveScoreService.pollAndCacheWisdenMatch(
        match.wisdenMatchGid,
      );
      this.logger.log(
        `[${matchId}] One-shot sync score: ${scoreSnapshot(data.scorecard)}`,
      );

      if (!data.scorecard) {
        this.logger.warn(`[${matchId}] One-shot sync missing scorecard`);
        return;
      }

      if (isWisdenMatchComplete(data.scorecard)) {
        await this.persistFinalScorecard(
          matchId,
          data.scorecard,
          data.commentary,
        );
        this.liveScoreService.evictWisdenMatch(match.wisdenMatchGid);
        this.logger.log(
          `[${matchId}] One-shot sync persisted completed historical match`,
        );
        return;
      }

      this.logger.log(
        `[${matchId}] One-shot sync found non-complete status; skipping interval polling`,
      );
    } catch (err) {
      this.logger.warn(`[${matchId}] One-shot sync error: ${String(err)}`);
    }
  }

  private async persistFinalScorecard(
    matchId: string,
    scorecardData: WisdenScorecardResponse,
    commentaryData: WisdenCommentaryResponse | null,
  ): Promise<void> {
    try {
      const match = await this.prisma.client.match.findUnique({
        where: { id: matchId },
        select: {
          id: true,
          wisdenMatchGid: true,
          matchResult: true,
          matchResultText: true,
        },
      });

      if (!match) {
        this.logger.warn(
          `[${matchId}] Match not found in DB; skipping persist`,
        );
        return;
      }

      const status = scorecardData.match_status ?? "complete";
      const derived = withDerivedMatchResult(scorecardData);
      const persistedScorecard = derived.scorecard;

      await this.prisma.client.match.update({
        where: { id: match.id },
        data: {
          status: MatchStatus.COMPLETED,
          ...(persistedScorecard.match_result
            ? { matchResultText: persistedScorecard.match_result }
            : {}),
          ...(derived.outcome !== MatchResult.PENDING &&
          match.matchResult === MatchResult.PENDING
            ? { matchResult: derived.outcome }
            : {}),
          wisdenScore: persistedScorecard as any,
          wisdenCommentary: commentaryData as any,
          wisdenStatus: status,
          wisdenLastSyncedAt: new Date(),
        },
      });

      this.logger.log(
        `[${matchId}] Final scorecard persisted to DB (status: ${status})`,
      );

      if (commentaryData) {
        try {
          const result = await this.scoringService.scoreWisdenMatch(
            match.id,
            commentaryData,
            scorecardData,
          );
          this.logger.log(
            `[${matchId}] Fantasy scoring complete: scored=${result.scored} ranked=${result.ranked}`,
          );
        } catch (scoringErr) {
          this.logger.warn(
            `[${matchId}] Fantasy scoring failed (non-fatal): ${String(scoringErr)}`,
          );
        }
      }
    } catch (err) {
      this.logger.error(
        `[${matchId}] Failed to persist final scorecard: ${String(err)}`,
      );
    }
  }

  private async scheduleUpcomingMatches(): Promise<void> {
    const now = new Date();
    // Look back up to 4h (for in-progress matches) and forward 24h
    const from = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const matches = await this.prisma.client.match.findMany({
      where: {
        wisdenMatchGid: { not: null },
        status: { not: "COMPLETED" },
        matchDate: { gte: from, lte: to },
      },
      select: { id: true, matchDate: true },
    });

    if (matches.length === 0) {
      this.logger.log("No upcoming matches to schedule");
      return;
    }

    this.logger.log(
      `Scheduling ${matches.length} upcoming match(es) in window ${from.toISOString()} -> ${to.toISOString()}`,
    );

    for (const m of matches) this.scheduleMatch(m.id, m.matchDate);

    this.logger.log(`Registered ${matches.length} match(es) for polling`);
  }
}
