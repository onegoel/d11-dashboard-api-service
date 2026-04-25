import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service.js";
import { WisdenService } from "../../wisden/wisden.service.js";
import { ScoreService } from "../../score/score.service.js";
import { FantasyLineupService } from "../lineup/fantasy-lineup.service.js";
import {
  FANTASY_T20_POINT_SYSTEM,
  MY11_T20_CAPTAIN_MULTIPLIER,
  MY11_T20_VICE_CAPTAIN_MULTIPLIER,
} from "../../../common/constants/fantasy-point-rule.constants.js";
import {
  FantasyContestStatus,
  ChipCode,
  ChipPlayStatus,
} from "../../../../generated/prisma/client.js";
import { withDerivedMatchResult } from "../../liveScore/wisden-match-result.util.js";
import type {
  WisdenCommentaryResponse,
  WisdenScorecardResponse,
  WisdenScorecardTeamPlayer,
  WisdenWagonWheelResponse,
} from "../../../common/types/wisden.types.js";

const LINK_ALIAS: Record<string, string> = {
  sooryavanshi: "suryavanshi",
  nitish: "nithish",
};

function normForLink(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => LINK_ALIAS[t] ?? t)
    .join(" ");
}

interface PlayerStats {
  runs: number;
  fours: number;
  sixes: number;
  ballsFaced: number;
  batted: boolean;
  gotOut: boolean;
  wickets: number;
  lbwWickets: number;
  bowledWickets: number;
  maidens: number;
  dotBalls: number;
  ballsBowled: number;
  runsConceded: number;
  catches: number;
  stumpings: number;
  runOutDirect: number;
  runOutThrower: number;
  runOutCatcher: number;
  motm: boolean;
  played: boolean;
}

function emptyStats(): PlayerStats {
  return {
    runs: 0,
    fours: 0,
    sixes: 0,
    ballsFaced: 0,
    batted: false,
    gotOut: false,
    wickets: 0,
    lbwWickets: 0,
    bowledWickets: 0,
    maidens: 0,
    dotBalls: 0,
    ballsBowled: 0,
    runsConceded: 0,
    catches: 0,
    stumpings: 0,
    runOutDirect: 0,
    runOutThrower: 0,
    runOutCatcher: 0,
    motm: false,
    played: false,
  };
}

type WisdenPlayerRef = {
  wisdenPlayerId: string;
  teamWisdenId: string;
  isUnused: boolean;
};

type WisdenPlayerIndex = {
  byName: Map<string, WisdenPlayerRef[]>;
  byId: Map<string, WisdenPlayerRef>;
};

function addWisdenVariant(
  index: Map<string, WisdenPlayerRef[]>,
  variant: string,
  ref: WisdenPlayerRef,
): void {
  const normalized = normForLink(variant);
  if (!normalized) return;
  const existing = index.get(normalized) ?? [];
  existing.push(ref);
  index.set(normalized, existing);
}

function mapWisdenPlayerType(player: WisdenScorecardTeamPlayer): boolean {
  return (player.type ?? "") === "unused";
}

function buildWisdenPlayerIndex(
  scorecard: WisdenScorecardResponse,
): WisdenPlayerIndex {
  const byName = new Map<string, WisdenPlayerRef[]>();
  const byId = new Map<string, WisdenPlayerRef>();

  for (const team of [scorecard.team1, scorecard.team2]) {
    const teamWisdenId = String(team?.id ?? "");
    for (const player of team?.players ?? []) {
      const ref: WisdenPlayerRef = {
        wisdenPlayerId: String(player.player_id),
        teamWisdenId,
        isUnused: mapWisdenPlayerType(player),
      };

      byId.set(ref.wisdenPlayerId, ref);
      addWisdenVariant(byName, player.player_known_as, ref);
      addWisdenVariant(byName, player.player_name, ref);
    }
  }

  return { byName, byId };
}

function resolveWisdenPlayer(
  index: WisdenPlayerIndex,
  rawName: string | null,
  teamWisdenId: string | null,
): WisdenPlayerRef | null {
  if (!rawName) return null;

  const candidates = index.byName.get(normForLink(rawName)) ?? [];
  if (candidates.length === 0) return null;
  if (!teamWisdenId) return candidates[0] ?? null;

  return (
    candidates.find((candidate) => candidate.teamWisdenId === teamWisdenId) ??
    candidates[0] ??
    null
  );
}

function getOrCreateWisdenStats(
  acc: Map<string, PlayerStats>,
  wisdenPlayerId: string,
): PlayerStats {
  if (!acc.has(wisdenPlayerId)) acc.set(wisdenPlayerId, emptyStats());
  return acc.get(wisdenPlayerId)!;
}

function parseNamedFielders(raw: string): string[] {
  return raw
    .split(/\s*\/\s*|\s*&\s*|\s*,\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function hasScoringToken(
  scoring: string | undefined,
  token: "wd" | "nb" | "lb" | "b",
): boolean {
  if (!scoring) return false;

  const normalized = scoring
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (token === "wd") return normalized.includes("wd");
  if (token === "nb") return normalized.includes("nb");
  if (token === "lb") return normalized.includes("lb");
  return /(^|[^a-z])b([^a-z]|$)/.test(normalized);
}

function isDotBallDelivery(params: {
  legalDelivery: boolean;
  isBye: boolean;
  isLegBye: boolean;
  recordedRuns: number;
}): boolean {
  if (!params.legalDelivery) return false;
  if (params.isBye || params.isLegBye) return true;
  return params.recordedRuns === 0;
}

function parseOversToBalls(overs: string | number | undefined): number {
  if (overs == null) return 0;

  const raw = String(overs).trim();
  if (!raw) return 0;

  const [completedOvers, ballsInCurrentOver] = raw.split(".");
  const fullOvers = Number.parseInt(completedOvers ?? "0", 10);
  const balls = Number.parseInt(ballsInCurrentOver ?? "0", 10);

  const safeFullOvers = Number.isFinite(fullOvers) ? fullOvers : 0;
  const safeBalls = Number.isFinite(balls)
    ? Math.max(0, Math.min(5, balls))
    : 0;

  return safeFullOvers * 6 + safeBalls;
}

function cleanDismissalName(raw: string): string {
  return raw.replace(/†/g, "").trim();
}

function isNotOutDismissal(raw: string): boolean {
  return /^not out$/i.test(raw.trim());
}

function accumulateWisdenCommentary(
  commentary: WisdenCommentaryResponse,
  scorecard: WisdenScorecardResponse,
): Map<string, PlayerStats> {
  const statsMap = new Map<string, PlayerStats>();
  const playerIndex = buildWisdenPlayerIndex(scorecard);
  const team1WisdenId = scorecard.team1 ? String(scorecard.team1.id) : null;
  const team2WisdenId = scorecard.team2 ? String(scorecard.team2.id) : null;

  for (const player of playerIndex.byId.values()) {
    if (player.isUnused) continue;
    getOrCreateWisdenStats(statsMap, player.wisdenPlayerId).played = true;
  }

  for (const innings of scorecard.innings ?? []) {
    const battingTeamId = String(innings.batting_team_id);
    const bowlingTeamId =
      battingTeamId === team1WisdenId ? team2WisdenId : team1WisdenId;

    for (const batter of innings.batting ?? []) {
      const batterRef = playerIndex.byId.get(String(batter.player_id));
      if (!batterRef) continue;

      const stats = getOrCreateWisdenStats(statsMap, batterRef.wisdenPlayerId);
      const runs = Number(batter.runs ?? 0);
      const ballsFaced = Number(
        (batter as { balls_faced?: number }).balls_faced ?? 0,
      );
      const fours = Number(batter.fours ?? 0);
      const sixes = Number(batter.sixes ?? 0);
      const dismissalStr = (batter.dismissal_str ?? "").trim();
      const isOut =
        typeof (batter as { is_out?: number }).is_out === "number"
          ? (batter as { is_out?: number }).is_out === 1
          : Boolean(dismissalStr) && !isNotOutDismissal(dismissalStr);
      stats.played = true;
      stats.batted = batter.batted === "yes";
      stats.runs += runs;
      stats.ballsFaced += ballsFaced;
      stats.fours += fours;
      stats.sixes += sixes;
      stats.gotOut = stats.gotOut || isOut;

      if (!dismissalStr || isNotOutDismissal(dismissalStr)) {
        continue;
      }

      const caught = dismissalStr.match(/^c\s+(.+?)\s+b\s+(.+)$/i);
      const stumped = dismissalStr.match(/^st\s+(.+?)\s+b\s+(.+)$/i);
      const runOut = dismissalStr.match(/^run out\s*\(([^)]+)\)$/i);
      const lbw = dismissalStr.match(/^lbw\s+b\s+(.+)$/i);
      const bowled = dismissalStr.match(/^b\s+(.+)$/i);

      if (caught?.[1] && caught?.[2]) {
        const catcher = resolveWisdenPlayer(
          playerIndex,
          cleanDismissalName(caught[1]),
          bowlingTeamId,
        );
        if (catcher) {
          getOrCreateWisdenStats(statsMap, catcher.wisdenPlayerId).catches += 1;
        }
      }

      if (stumped?.[1] && stumped?.[2]) {
        const wicketKeeper = resolveWisdenPlayer(
          playerIndex,
          cleanDismissalName(stumped[1]),
          bowlingTeamId,
        );
        if (wicketKeeper) {
          getOrCreateWisdenStats(
            statsMap,
            wicketKeeper.wisdenPlayerId,
          ).stumpings += 1;
        }
      }

      if (runOut?.[1]) {
        const fielders = parseNamedFielders(runOut[1]).map(cleanDismissalName);
        if (fielders.length === 1) {
          const fielder = resolveWisdenPlayer(
            playerIndex,
            fielders[0] ?? null,
            bowlingTeamId,
          );
          if (fielder) {
            getOrCreateWisdenStats(
              statsMap,
              fielder.wisdenPlayerId,
            ).runOutDirect += 1;
          }
        }

        if (fielders.length >= 2) {
          const thrower = resolveWisdenPlayer(
            playerIndex,
            fielders[0] ?? null,
            bowlingTeamId,
          );
          const catcher = resolveWisdenPlayer(
            playerIndex,
            fielders[1] ?? null,
            bowlingTeamId,
          );

          if (thrower) {
            getOrCreateWisdenStats(
              statsMap,
              thrower.wisdenPlayerId,
            ).runOutThrower += 1;
          }
          if (catcher) {
            getOrCreateWisdenStats(
              statsMap,
              catcher.wisdenPlayerId,
            ).runOutCatcher += 1;
          }
        }
      }

      if (lbw?.[1]) {
        const bowler = resolveWisdenPlayer(
          playerIndex,
          cleanDismissalName(lbw[1]),
          bowlingTeamId,
        );
        if (bowler) {
          getOrCreateWisdenStats(statsMap, bowler.wisdenPlayerId).lbwWickets +=
            1;
        }
      } else if (bowled?.[1]) {
        const bowler = resolveWisdenPlayer(
          playerIndex,
          cleanDismissalName(bowled[1]),
          bowlingTeamId,
        );
        if (bowler) {
          getOrCreateWisdenStats(
            statsMap,
            bowler.wisdenPlayerId,
          ).bowledWickets += 1;
        }
      }
    }

    for (const bowler of innings.bowling ?? []) {
      const bowlerId = String(
        (bowler as { bowler_id?: number; player_id?: number }).bowler_id ??
          (bowler as { bowler_id?: number; player_id?: number }).player_id ??
          "",
      );
      const bowlerRef = playerIndex.byId.get(bowlerId);
      if (!bowlerRef) continue;

      const stats = getOrCreateWisdenStats(statsMap, bowlerRef.wisdenPlayerId);
      const wickets = Number(bowler.wickets ?? 0);
      const maidens = Number(bowler.maidens ?? 0);
      const runsConceded = Number(
        (bowler as { runs_conceded?: number; runs?: number }).runs_conceded ??
          (bowler as { runs_conceded?: number; runs?: number }).runs ??
          0,
      );

      stats.played = true;
      stats.wickets += wickets;
      stats.maidens += maidens;
      stats.runsConceded += runsConceded;
      stats.ballsBowled += parseOversToBalls(bowler.overs);
    }
  }

  for (const innings of commentary.innings ?? []) {
    const battingTeamId = String(innings.batting_team_id);
    const bowlingTeamId =
      battingTeamId === team1WisdenId ? team2WisdenId : team1WisdenId;

    for (const over of innings.bbb ?? []) {
      const bowler = resolveWisdenPlayer(
        playerIndex,
        over.bowling_player_name,
        bowlingTeamId,
      );
      if (!bowler) continue;

      const bowlerStats = getOrCreateWisdenStats(
        statsMap,
        bowler.wisdenPlayerId,
      );
      bowlerStats.played = true;

      for (const ball of over.balls ?? []) {
        const recordedRuns = Number(ball.runs ?? 0);
        const isWide = hasScoringToken(ball.scoring, "wd");
        const isNoBall = hasScoringToken(ball.scoring, "nb");
        const isLegBye = hasScoringToken(ball.scoring, "lb");
        const isBye = !isLegBye && hasScoringToken(ball.scoring, "b");
        const legalDelivery = !isWide && !isNoBall;
        if (
          isDotBallDelivery({
            legalDelivery,
            isBye,
            isLegBye,
            recordedRuns,
          })
        ) {
          bowlerStats.dotBalls += 1;
        }
      }
    }
  }

  return statsMap;
}

function computePoints(
  s: PlayerStats,
  role?: string,
): {
  points: number;
  breakdown: Record<string, number>;
} {
  const b: Record<string, number> = {};
  let pts = 0;

  const add = (key: string, val: number) => {
    if (val !== 0) b[key] = (b[key] ?? 0) + val;
    pts += val;
  };

  if (s.played) {
    add("playing", FANTASY_T20_POINT_SYSTEM.other.playing_11_bonus);
  }
  add("runs", s.runs * FANTASY_T20_POINT_SYSTEM.batting.runs);
  add("fourBonus", s.fours * FANTASY_T20_POINT_SYSTEM.batting.four_bonus);
  add("sixBonus", s.sixes * FANTASY_T20_POINT_SYSTEM.batting.six_bonus);
  if (s.runs >= 100) {
    add("centuryBonus", FANTASY_T20_POINT_SYSTEM.batting["100_runs_bonus"]);
  } else if (s.runs >= 75) {
    add("seventyFiveBonus", FANTASY_T20_POINT_SYSTEM.batting["75_runs_bonus"]);
  } else if (s.runs >= 50) {
    add("fiftyBonus", FANTASY_T20_POINT_SYSTEM.batting["50_runs_bonus"]);
  } else if (s.runs >= 25) {
    add("twentyFiveBonus", FANTASY_T20_POINT_SYSTEM.batting["25_runs_bonus"]);
  }
  if (s.batted && s.gotOut && s.runs === 0 && role !== "BOWLER") {
    add("duckPenalty", FANTASY_T20_POINT_SYSTEM.batting.duck_penalty);
  }

  if (s.batted && s.ballsFaced >= 10) {
    const strikeRate = (s.runs * 100) / s.ballsFaced;
    if (strikeRate < 50) {
      add(
        "strikeRate",
        FANTASY_T20_POINT_SYSTEM.batting.strike_rate.less_than_50,
      );
    } else if (strikeRate < 60) {
      add(
        "strikeRate",
        FANTASY_T20_POINT_SYSTEM.batting.strike_rate["50_to_59.99"],
      );
    } else if (strikeRate < 70) {
      add(
        "strikeRate",
        FANTASY_T20_POINT_SYSTEM.batting.strike_rate["60_to_69.99"],
      );
    } else if (strikeRate < 130) {
      add(
        "strikeRate",
        FANTASY_T20_POINT_SYSTEM.batting.strike_rate["70_to_129.99"],
      );
    } else if (strikeRate < 150) {
      add(
        "strikeRate",
        FANTASY_T20_POINT_SYSTEM.batting.strike_rate["130_to_149.99"],
      );
    } else if (strikeRate < 170) {
      add(
        "strikeRate",
        FANTASY_T20_POINT_SYSTEM.batting.strike_rate["150_to_169.99"],
      );
    } else {
      add(
        "strikeRate",
        FANTASY_T20_POINT_SYSTEM.batting.strike_rate["170_and_above"],
      );
    }
  }

  add("wickets", s.wickets * FANTASY_T20_POINT_SYSTEM.bowling.wicket_bonus);
  add(
    "lbwBowledBonus",
    (s.lbwWickets + s.bowledWickets) *
      FANTASY_T20_POINT_SYSTEM.bowling.lbw_bowled_bonus,
  );
  add(
    "maidenOverBonus",
    s.maidens * FANTASY_T20_POINT_SYSTEM.bowling.maiden_over_bonus,
  );
  add(
    "dotBallBonus",
    s.dotBalls * FANTASY_T20_POINT_SYSTEM.bowling.dot_ball_bonus,
  );
  if (s.wickets >= 5) {
    add(
      "fiveWicketHaulBonus",
      FANTASY_T20_POINT_SYSTEM.bowling.five_wicket_haul_bonus,
    );
  } else if (s.wickets >= 4) {
    add(
      "fourWicketHaulBonus",
      FANTASY_T20_POINT_SYSTEM.bowling.four_wicket_haul_bonus,
    );
  } else if (s.wickets >= 3) {
    add(
      "threeWicketHaulBonus",
      FANTASY_T20_POINT_SYSTEM.bowling.three_wicket_haul_bonus,
    );
  }

  if (s.ballsBowled >= 12) {
    const economy = (s.runsConceded * 6) / s.ballsBowled;
    if (economy < 5) {
      add(
        "economyRate",
        FANTASY_T20_POINT_SYSTEM.bowling.economy_rate.less_than_5,
      );
    } else if (economy < 6) {
      add(
        "economyRate",
        FANTASY_T20_POINT_SYSTEM.bowling.economy_rate["5_to_5.99"],
      );
    } else if (economy < 7) {
      add(
        "economyRate",
        FANTASY_T20_POINT_SYSTEM.bowling.economy_rate["6_to_6.99"],
      );
    } else if (economy < 10) {
      add(
        "economyRate",
        FANTASY_T20_POINT_SYSTEM.bowling.economy_rate["7_to_9.99"],
      );
    } else if (economy < 11) {
      add(
        "economyRate",
        FANTASY_T20_POINT_SYSTEM.bowling.economy_rate["10_to_10.99"],
      );
    } else if (economy < 12) {
      add(
        "economyRate",
        FANTASY_T20_POINT_SYSTEM.bowling.economy_rate["11_to_11.99"],
      );
    } else {
      add(
        "economyRate",
        FANTASY_T20_POINT_SYSTEM.bowling.economy_rate["12_and_above"],
      );
    }
  }

  add("catches", s.catches * FANTASY_T20_POINT_SYSTEM.fielding.catch);
  add("stumpings", s.stumpings * FANTASY_T20_POINT_SYSTEM.fielding.stumping);
  add(
    "runOutDirect",
    s.runOutDirect * FANTASY_T20_POINT_SYSTEM.fielding.run_out_direct,
  );
  add(
    "runOutAssists",
    (s.runOutThrower + s.runOutCatcher) *
      FANTASY_T20_POINT_SYSTEM.fielding.run_out_multiple,
  );
  if (s.catches >= 3) {
    add("catchBonus", FANTASY_T20_POINT_SYSTEM.fielding.catch_bonus);
  }

  return { points: pts, breakdown: b };
}

@Injectable()
export class FantasyScoringService {
  private readonly logger = new Logger(FantasyScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wisden: WisdenService,
    private readonly scoreService: ScoreService,
    private readonly lineup: FantasyLineupService,
  ) {}

  async scoreMatch(
    matchId: string,
  ): Promise<{ scored: number; ranked: number }> {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true, wisdenMatchGid: true },
    });

    if (!match) throw new NotFoundException(`Match ${matchId} not found`);
    if (!match.wisdenMatchGid) {
      throw new NotFoundException(`Match ${matchId} has no wisdenMatchGid`);
    }

    const [scorecard, commentary, wagonWheel] = await Promise.all([
      this.wisden.getAdvancedScorecard(match.wisdenMatchGid),
      this.wisden.getCommentaryBasic(match.wisdenMatchGid),
      this.wisden.getWagonWheel(match.wisdenMatchGid).catch((err) => {
        this.logger.warn(
          `[scoreMatch] wagon wheel unavailable for ${match.wisdenMatchGid}: ${String(err)}`,
        );
        return null;
      }),
    ]);

    return this.scoreWisdenMatch(matchId, commentary, scorecard, wagonWheel);
  }

  async scoreMatchStatsOnly(matchId: string): Promise<{ upserted: number }> {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true, wisdenMatchGid: true },
    });

    if (!match) throw new NotFoundException(`Match ${matchId} not found`);
    if (!match.wisdenMatchGid) {
      throw new NotFoundException(`Match ${matchId} has no wisdenMatchGid`);
    }

    const [scorecard, commentary, wagonWheel] = await Promise.all([
      this.wisden.getAdvancedScorecard(match.wisdenMatchGid),
      this.wisden.getCommentaryBasic(match.wisdenMatchGid),
      this.wisden.getWagonWheel(match.wisdenMatchGid).catch((err) => {
        this.logger.warn(
          `[scoreMatchStatsOnly] wagon wheel unavailable for ${match.wisdenMatchGid}: ${String(err)}`,
        );
        return null;
      }),
    ]);

    const upserted = await this.computeAndPersistWisdenScores(
      matchId,
      commentary,
      scorecard,
      true,
      wagonWheel,
      false,
    );

    await this.refreshPlayerSeasonStats(matchId);

    this.logger.log(
      `[scoreMatchStatsOnly] matchId=${matchId} upserted=${upserted}`,
    );
    return { upserted };
  }

  async scoreWisdenMatch(
    matchId: string,
    commentary: WisdenCommentaryResponse,
    scorecard: WisdenScorecardResponse,
    wagonWheel?: WisdenWagonWheelResponse | null,
  ): Promise<{ scored: number; ranked: number }> {
    const scored = await this.computeAndPersistWisdenScores(
      matchId,
      commentary,
      scorecard,
      true,
      wagonWheel,
    );
    const ranked = await this.finalizeContestAndPublishRanks(matchId);

    // Mark blobs as pruneable and refresh season stats in parallel (non-fatal)
    await Promise.allSettled([
      this.prisma.client.match.update({
        where: { id: matchId },
        data: { wisdenScoringFinalizedAt: new Date() },
      }),
      this.refreshPlayerSeasonStats(matchId),
    ]);

    this.logger.log(
      `[scoreWisdenMatch] matchId=${matchId} scored=${scored} ranked=${ranked}`,
    );
    return { scored, ranked };
  }

  async scoreWisdenLive(
    matchId: string,
    commentary: WisdenCommentaryResponse,
    scorecard: WisdenScorecardResponse,
  ): Promise<number> {
    const scored = await this.computeAndPersistWisdenScores(
      matchId,
      commentary,
      scorecard,
      false,
    );
    this.logger.debug(`[scoreWisdenLive] matchId=${matchId} scored=${scored}`);
    return scored;
  }

  async refreshLiveContest(matchId: string): Promise<number> {
    const updated = await this.recomputeContestEntries(matchId, false);
    this.logger.debug(
      `[refreshLiveContest] matchId=${matchId} updated=${updated}`,
    );
    return updated;
  }

  private async computeAndPersistWisdenScores(
    matchId: string,
    commentary: WisdenCommentaryResponse,
    scorecard: WisdenScorecardResponse,
    isFinalized = true,
    wagonWheel?: WisdenWagonWheelResponse | null,
    persistFantasyPoints = true,
  ): Promise<number> {
    const statsMap = accumulateWisdenCommentary(commentary, scorecard);

    // ── Advanced metrics from scorecard ──────────────────────────────────
    type AdvancedMetrics = {
      battingPosition?: number;
      dotsPlayedPct?: number;
      boundaryScoredPct?: number;
      battingImpact?: number;
      bowlingImpact?: number;
    };
    const advancedMap = new Map<string, AdvancedMetrics>();

    for (const innings of scorecard.innings ?? []) {
      for (const batter of innings.batting ?? []) {
        const id = String(batter.player_id);
        const m = advancedMap.get(id) ?? {};
        if (batter.batting_position != null) {
          m.battingPosition = Number(batter.batting_position);
        }
        const dotsRaw = Number(batter.dot_ball_percentage);
        if (!Number.isNaN(dotsRaw)) m.dotsPlayedPct = dotsRaw;
        const boundaryRaw = Number(batter.boundary_percentage);
        if (!Number.isNaN(boundaryRaw)) m.boundaryScoredPct = boundaryRaw;
        if (batter.impact != null) {
          const impactRaw = Number(batter.impact);
          if (!Number.isNaN(impactRaw)) m.battingImpact = impactRaw;
        }
        advancedMap.set(id, m);
      }
      for (const bowler of innings.bowling ?? []) {
        const id = String(
          (bowler as { bowler_id?: number }).bowler_id ??
            bowler.player_id ??
            "",
        );
        const m = advancedMap.get(id) ?? {};
        if (bowler.impact != null) {
          const impactRaw = Number(bowler.impact);
          if (!Number.isNaN(impactRaw)) m.bowlingImpact = impactRaw;
        }
        advancedMap.set(id, m);
      }
    }

    // ── Wagon wheel aggregation ───────────────────────────────────────────
    type ShotAgg = {
      paceRuns: number;
      paceBalls: number;
      paceBoundaries: number;
      spinRuns: number;
      spinBalls: number;
      spinBoundaries: number;
      zones: Record<number, { balls: number; runs: number }>;
      caughtVsPace: number;
      caughtVsSpin: number;
      caughtZones: Record<number, number>;
    };
    const shotMap = new Map<string, ShotAgg>();

    const initShot = (): ShotAgg => ({
      paceRuns: 0,
      paceBalls: 0,
      paceBoundaries: 0,
      spinRuns: 0,
      spinBalls: 0,
      spinBoundaries: 0,
      zones: {},
      caughtVsPace: 0,
      caughtVsSpin: 0,
      caughtZones: {},
    });

    if (wagonWheel) {
      for (const ball of wagonWheel.spider_data ?? []) {
        const id = String(ball.batting_player_id);
        if (!shotMap.has(id)) shotMap.set(id, initShot());
        const agg = shotMap.get(id)!;
        const rob = Number(ball.runs_off_bat ?? 0);
        const isBoundary = rob >= 4;
        if (ball.bowling_type_simple === "pace") {
          agg.paceBalls++;
          agg.paceRuns += rob;
          if (isBoundary) agg.paceBoundaries++;
        } else {
          agg.spinBalls++;
          agg.spinRuns += rob;
          if (isBoundary) agg.spinBoundaries++;
        }
        const zone = ball.field_zone;
        if (zone >= 1 && zone <= 8) {
          agg.zones[zone] ??= { balls: 0, runs: 0 };
          agg.zones[zone].balls++;
          agg.zones[zone].runs += rob;
        }
      }

      for (const ball of wagonWheel.catch_map ?? []) {
        const id = String(ball.batting_player_id);
        if (!shotMap.has(id)) shotMap.set(id, initShot());
        const agg = shotMap.get(id)!;
        if (ball.bowling_type_simple === "pace") agg.caughtVsPace++;
        else agg.caughtVsSpin++;
        const zone = ball.field_zone;
        if (zone >= 1 && zone <= 8) {
          agg.caughtZones[zone] = (agg.caughtZones[zone] ?? 0) + 1;
        }
      }
    }

    const matchPlayers = await this.prisma.client.fantasyMatchPlayer.findMany({
      where: { matchId, wisdenPlayerId: { not: null } },
      select: {
        fantasyPlayerId: true,
        wisdenPlayerId: true,
        wisdenMatchGid: true,
        fantasyPlayer: { select: { role: true } },
      },
    });

    if (matchPlayers.length === 0) {
      this.logger.warn(
        `[scoreWisdenMatch] No Wisden-linked match players found for matchId=${matchId}`,
      );
      return 0;
    }

    let upserted = 0;

    for (const matchPlayer of matchPlayers) {
      if (!matchPlayer.wisdenPlayerId) continue;

      const stats = statsMap.get(matchPlayer.wisdenPlayerId) ?? emptyStats();
      const fantasyScore = persistFantasyPoints
        ? computePoints(stats, matchPlayer.fantasyPlayer?.role)
        : null;
      const advanced = advancedMap.get(matchPlayer.wisdenPlayerId) ?? {};

      const matchStatsPayload = {
        runs: stats.runs,
        ballsFaced: stats.ballsFaced,
        fours: stats.fours,
        sixes: stats.sixes,
        battingPosition: advanced.battingPosition ?? null,
        wickets: stats.wickets,
        ballsBowled: stats.ballsBowled,
        runsConceded: stats.runsConceded,
        maidens: stats.maidens,
        dotBalls: stats.dotBalls,
        catches: stats.catches,
        stumpings: stats.stumpings,
        runOutDirect: stats.runOutDirect,
        runOutAssist: stats.runOutThrower + stats.runOutCatcher,
        battingImpact: advanced.battingImpact ?? null,
        boundaryScoredPct: advanced.boundaryScoredPct ?? null,
        dotsPlayedPct: advanced.dotsPlayedPct ?? null,
        bowlingImpact: advanced.bowlingImpact ?? null,
        played: stats.played,
      };

      // Build FantasyPlayerShotData payload from wagon wheel aggregation
      const rawShot = shotMap.get(matchPlayer.wisdenPlayerId);
      const shot = rawShot
        ? {
            paceRuns: rawShot.paceRuns,
            paceBalls: rawShot.paceBalls,
            paceBoundaries: rawShot.paceBoundaries,
            spinRuns: rawShot.spinRuns,
            spinBalls: rawShot.spinBalls,
            spinBoundaries: rawShot.spinBoundaries,
            zone1Balls: rawShot.zones[1]?.balls ?? 0,
            zone1Runs: rawShot.zones[1]?.runs ?? 0,
            zone2Balls: rawShot.zones[2]?.balls ?? 0,
            zone2Runs: rawShot.zones[2]?.runs ?? 0,
            zone3Balls: rawShot.zones[3]?.balls ?? 0,
            zone3Runs: rawShot.zones[3]?.runs ?? 0,
            zone4Balls: rawShot.zones[4]?.balls ?? 0,
            zone4Runs: rawShot.zones[4]?.runs ?? 0,
            zone5Balls: rawShot.zones[5]?.balls ?? 0,
            zone5Runs: rawShot.zones[5]?.runs ?? 0,
            zone6Balls: rawShot.zones[6]?.balls ?? 0,
            zone6Runs: rawShot.zones[6]?.runs ?? 0,
            zone7Balls: rawShot.zones[7]?.balls ?? 0,
            zone7Runs: rawShot.zones[7]?.runs ?? 0,
            zone8Balls: rawShot.zones[8]?.balls ?? 0,
            zone8Runs: rawShot.zones[8]?.runs ?? 0,
            caughtVsPaceCount: rawShot.caughtVsPace,
            caughtVsSpinCount: rawShot.caughtVsSpin,
            caughtZone1Count: rawShot.caughtZones[1] ?? 0,
            caughtZone2Count: rawShot.caughtZones[2] ?? 0,
            caughtZone3Count: rawShot.caughtZones[3] ?? 0,
            caughtZone4Count: rawShot.caughtZones[4] ?? 0,
            caughtZone5Count: rawShot.caughtZones[5] ?? 0,
            caughtZone6Count: rawShot.caughtZones[6] ?? 0,
            caughtZone7Count: rawShot.caughtZones[7] ?? 0,
            caughtZone8Count: rawShot.caughtZones[8] ?? 0,
          }
        : null;

      await Promise.all([
        ...(persistFantasyPoints && fantasyScore
          ? [
              this.prisma.client.fantasyPlayerScore.upsert({
                where: {
                  fantasyPlayerId_matchId: {
                    fantasyPlayerId: matchPlayer.fantasyPlayerId,
                    matchId,
                  },
                },
                update: {
                  points: fantasyScore.points,
                  breakdown: fantasyScore.breakdown as never,
                  isFinalized,
                  wisdenPlayerId: matchPlayer.wisdenPlayerId,
                  wisdenMatchGid: matchPlayer.wisdenMatchGid,
                },
                create: {
                  fantasyPlayerId: matchPlayer.fantasyPlayerId,
                  matchId,
                  points: fantasyScore.points,
                  breakdown: fantasyScore.breakdown as never,
                  isFinalized,
                  wisdenPlayerId: matchPlayer.wisdenPlayerId,
                  wisdenMatchGid: matchPlayer.wisdenMatchGid,
                },
              }),
            ]
          : []),

        this.prisma.client.fantasyPlayerMatchStats.upsert({
          where: {
            fantasyPlayerId_matchId: {
              fantasyPlayerId: matchPlayer.fantasyPlayerId,
              matchId,
            },
          },
          update: matchStatsPayload,
          create: {
            fantasyPlayerId: matchPlayer.fantasyPlayerId,
            matchId,
            ...matchStatsPayload,
          },
        }),

        ...(shot
          ? [
              this.prisma.client.fantasyPlayerShotData.upsert({
                where: {
                  fantasyPlayerId_matchId: {
                    fantasyPlayerId: matchPlayer.fantasyPlayerId,
                    matchId,
                  },
                },
                update: shot,
                create: {
                  fantasyPlayerId: matchPlayer.fantasyPlayerId,
                  matchId,
                  ...shot,
                },
              }),
            ]
          : []),

        ...(advanced.battingPosition != null
          ? [
              this.prisma.client.fantasyMatchPlayer.update({
                where: {
                  matchId_fantasyPlayerId: {
                    matchId,
                    fantasyPlayerId: matchPlayer.fantasyPlayerId,
                  },
                },
                data: { battingPosition: advanced.battingPosition },
              }),
            ]
          : []),
      ]);

      upserted++;
    }

    // Mark isStatsAvailable=true for all players who had stats upserted in this match
    if (upserted > 0) {
      const playedPlayerIds = matchPlayers
        .filter((mp) => {
          if (!mp.wisdenPlayerId) return false;
          const stats = statsMap.get(mp.wisdenPlayerId);
          return stats?.played === true;
        })
        .map((mp) => mp.fantasyPlayerId);

      if (playedPlayerIds.length > 0) {
        await this.prisma.client.fantasyPlayer
          .updateMany({
            where: { id: { in: playedPlayerIds } },
            data: { isStatsAvailable: true },
          })
          .catch((err: unknown) => {
            this.logger.warn(
              `[scoring] Failed to update isStatsAvailable for matchId=${matchId}: ${String(err)}`,
            );
          });
      }
    }

    this.logger.log(
      persistFantasyPoints
        ? `[scoring] Upserted ${upserted} Wisden player scores + match stats for matchId=${matchId}`
        : `[scoring] Upserted ${upserted} Wisden player match stats for matchId=${matchId}`,
    );
    return upserted;
  }

  private async recomputeContestEntries(
    matchId: string,
    markCompleted: boolean,
  ): Promise<number> {
    const contest = await this.prisma.client.fantasyContest.findUnique({
      where: { matchId },
      include: {
        entries: {
          include: { players: true },
        },
      },
    });

    if (!contest || contest.entries.length === 0) {
      this.logger.log(
        `[scoring] No contest entries found for matchId=${matchId}`,
      );
      return 0;
    }

    const scores = await this.prisma.client.fantasyPlayerScore.findMany({
      where: { matchId },
      select: { fantasyPlayerId: true, points: true },
    });
    const scoreMap = new Map(scores.map((s) => [s.fantasyPlayerId, s.points]));

    const allEntryPlayerIds = Array.from(
      new Set(
        contest.entries.flatMap((entry) =>
          entry.players.map((p) => p.fantasyPlayerId),
        ),
      ),
    );

    const matchPlayers = await this.prisma.client.fantasyMatchPlayer.findMany({
      where: {
        matchId,
        fantasyPlayerId: { in: allEntryPlayerIds },
      },
      select: {
        fantasyPlayerId: true,
        teamWisdenId: true,
        isInPlayingXI: true,
        fantasyPlayer: {
          select: {
            teamId: true,
          },
        },
      },
    });

    const teamKeyByPlayerId = new Map(
      matchPlayers.map((item) => [
        item.fantasyPlayerId,
        item.teamWisdenId ?? item.fantasyPlayer.teamId,
      ]),
    );

    // A player is eligible for auto-substitution only if they did not play
    // (isInPlayingXI === false). Players who played but scored 0 should NOT
    // be substituted out.
    const playingXIByPlayerId = new Map(
      matchPlayers.map((item) => [item.fantasyPlayerId, item.isInPlayingXI]),
    );

    const entryTotals: { id: string; totalPoints: number }[] = [];

    // ── Chip pre-computation ──────────────────────────────────────────────
    // Always query chip plays directly — entry.chipCode may be null if the
    // team was submitted before the chip was activated.
    const anchorGrantedUserIds = new Set<number>(); // qualify for 1.1x
    const anchorActiveUserIds = new Set<number>(); // have an AP chip for this match
    const chipCodeByUserId = new Map<number, ChipCode>();
    const chipPlaysByUserId = new Map<number, (typeof chipPlays)[number][]>();

    const chipPlays = await this.prisma.client.chipPlay.findMany({
      where: {
        startMatchId: matchId,
        status: ChipPlayStatus.SCHEDULED,
      },
      select: {
        chipType: { select: { code: true } },
        extraInfo: true,
        seasonUser: { select: { userId: true } },
      },
    });

    for (const play of chipPlays) {
      chipCodeByUserId.set(play.seasonUser.userId, play.chipType.code);
      const existing = chipPlaysByUserId.get(play.seasonUser.userId) ?? [];
      existing.push(play);
      chipPlaysByUserId.set(play.seasonUser.userId, existing);
    }

    const anchorChipPlays = chipPlays.filter(
      (play) => play.chipType.code === ChipCode.ANCHOR_PLAYER,
    );

    if (anchorChipPlays.length > 0) {
      for (const play of anchorChipPlays) {
        anchorActiveUserIds.add(play.seasonUser.userId);
      }

      for (const play of anchorChipPlays) {
        const ei = play.extraInfo as Record<string, unknown> | null;
        const anchorFpId =
          typeof ei?.anchorFantasyPlayerId === "string"
            ? ei.anchorFantasyPlayerId
            : null;
        if (!anchorFpId) {
          this.logger.warn(
            `[anchor] chipPlay has no anchorFantasyPlayerId in extraInfo — userId=${play.seasonUser.userId}`,
          );
          continue;
        }
        const pts = scoreMap.get(anchorFpId) ?? 0;
        this.logger.log(
          `[anchor] fantasyPlayerId=${anchorFpId} pts=${pts} userId=${play.seasonUser.userId}`,
        );
        if (pts >= 50) {
          anchorGrantedUserIds.add(play.seasonUser.userId);
        }
      }
    }
    // Backfill entry.chipCode for entries whose chip was activated after
    // team submission (so the pill shows correctly in the leaderboard).
    await Promise.all(
      contest.entries
        .map((entry) => ({
          entry,
          chipCode: chipCodeByUserId.get(entry.userId) ?? null,
        }))
        .filter(
          (
            item,
          ): item is {
            entry: (typeof contest.entries)[number];
            chipCode: ChipCode;
          } => item.chipCode !== null && item.entry.chipCode !== item.chipCode,
        )
        .map(({ entry, chipCode }) =>
          this.prisma.client.fantasyContestEntry.update({
            where: { id: entry.id },
            data: { chipCode },
          }),
        ),
    );
    // ─────────────────────────────────────────────────────────────────────

    for (const entry of contest.entries) {
      const effectivePlayers = this.lineup.buildEffectivePlayers(
        entry.players,
        entry.teamNo,
        chipPlaysByUserId.get(entry.userId) ?? [],
      );

      const starters = effectivePlayers.filter((p) => !p.isBench);
      const bench = effectivePlayers
        .filter((p) => p.isBench)
        .sort((a, b) => (a.benchPriority ?? 99) - (b.benchPriority ?? 99));

      const activePlayers = new Map(
        starters.map((p) => [p.fantasyPlayerId, { ...p, subbed: false }]),
      );

      const availableBench = bench.filter(
        (p) => (scoreMap.get(p.fantasyPlayerId) ?? 0) > 0,
      );

      const activeTeamCounts = new Map<string, number>();
      for (const starter of starters) {
        const teamKey = teamKeyByPlayerId.get(starter.fantasyPlayerId);
        if (!teamKey) continue;
        activeTeamCounts.set(teamKey, (activeTeamCounts.get(teamKey) ?? 0) + 1);
      }

      for (const [fpId, sp] of activePlayers) {
        const pts = scoreMap.get(fpId) ?? 0;
        // Only auto-sub if the player didn't play (not in playing XI).
        // A player who played but scored 0 legitimately should not be replaced.
        const didNotPlay = !(playingXIByPlayerId.get(fpId) ?? false);
        if (pts === 0 && didNotPlay && availableBench.length > 0) {
          const outgoingTeam = teamKeyByPlayerId.get(sp.fantasyPlayerId);

          const subIdx = availableBench.findIndex((sub) => {
            const subTeam = teamKeyByPlayerId.get(sub.fantasyPlayerId);
            if (!subTeam) return false;
            if (subTeam === outgoingTeam) return true;

            const currentCount = activeTeamCounts.get(subTeam) ?? 0;
            return currentCount + 1 <= 8;
          });

          if (subIdx >= 0) {
            const sub = availableBench.splice(subIdx, 1)[0]!;
            const incomingTeam = teamKeyByPlayerId.get(sub.fantasyPlayerId);

            if (outgoingTeam && incomingTeam && outgoingTeam !== incomingTeam) {
              activeTeamCounts.set(
                outgoingTeam,
                Math.max(0, (activeTeamCounts.get(outgoingTeam) ?? 0) - 1),
              );
              activeTeamCounts.set(
                incomingTeam,
                (activeTeamCounts.get(incomingTeam) ?? 0) + 1,
              );
            }

            activePlayers.set(fpId, {
              ...sp,
              fantasyPlayerId: sub.fantasyPlayerId,
              subbed: true,
            });
          }
        }
      }

      let total = 0;
      for (const sp of activePlayers.values()) {
        const raw = scoreMap.get(sp.fantasyPlayerId) ?? 0;
        const mult = sp.isCaptain
          ? MY11_T20_CAPTAIN_MULTIPLIER
          : sp.isViceCaptain
            ? MY11_T20_VICE_CAPTAIN_MULTIPLIER
            : 1;
        total += raw * mult;
      }

      // Apply Anchor Player 1.1x if the player's anchor scored ≥ 50
      if (
        anchorActiveUserIds.has(entry.userId) &&
        anchorGrantedUserIds.has(entry.userId)
      ) {
        total = Math.round(total * 1.1 * 10) / 10;
      }

      entryTotals.push({ id: entry.id, totalPoints: total });
    }

    entryTotals.sort((a, b) => b.totalPoints - a.totalPoints);

    let rank = 1;
    let prevPoints: number | null = null;
    let processed = 0;
    await Promise.all(
      entryTotals.map((e) => {
        if (prevPoints == null || e.totalPoints !== prevPoints) {
          rank = processed + 1;
          prevPoints = e.totalPoints;
        }
        processed += 1;

        return this.prisma.client.fantasyContestEntry.update({
          where: { id: e.id },
          data: { totalPoints: e.totalPoints, rank },
        });
      }),
    );

    await this.prisma.client.fantasyContest.update({
      where: { id: contest.id },
      data: {
        status: markCompleted
          ? FantasyContestStatus.COMPLETED
          : FantasyContestStatus.LIVE,
      },
    });

    this.logger.log(
      markCompleted
        ? `[scoring] Finalized ${entryTotals.length} entries for contestId=${contest.id}`
        : `[scoring] Live-updated ${entryTotals.length} entries for contestId=${contest.id}`,
    );
    return entryTotals.length;
  }

  private async finalizeContest(matchId: string): Promise<number> {
    return this.recomputeContestEntries(matchId, true);
  }

  private async finalizeContestAndPublishRanks(
    matchId: string,
  ): Promise<number> {
    const ranked = await this.recomputeContestEntries(matchId, true);

    // Auto-derive match result from Wisden and publish rankings to score system
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        wisdenScore: true,
        status: true,
        matchResult: true,
        seasonId: true,
      },
    });

    if (
      !match ||
      match.status !== "COMPLETED" ||
      !match.wisdenScore ||
      match.seasonId == null
    ) {
      return ranked;
    }

    try {
      // Determine match result from Wisden scorecard
      const derived = withDerivedMatchResult(
        match.wisdenScore as WisdenScorecardResponse,
      );
      const matchResult = derived.outcome;

      // Get contest leaderboard positions to publish as season scores
      const entries = await this.prisma.client.fantasyContestEntry.findMany({
        where: { contest: { matchId } },
        select: {
          rank: true,
          userId: true,
          teamNo: true,
          totalPoints: true,
        },
      });

      const rankedEntries = entries.filter((e) => e.rank != null);
      if (rankedEntries.length === 0) return ranked;

      const dtSeasonUserIds = new Set(
        (
          await this.prisma.client.chipPlay.findMany({
            where: {
              startMatchId: matchId,
              status: ChipPlayStatus.SCHEDULED,
              chipType: { code: ChipCode.DOUBLE_TEAM },
            },
            select: {
              seasonUserId: true,
            },
          })
        ).map((play) => play.seasonUserId),
      );

      // Resolve SeasonUser.id for each userId in this season
      const uniqueUserIds = [...new Set(rankedEntries.map((e) => e.userId))];
      const seasonUsers = await this.prisma.client.seasonUser.findMany({
        where: { seasonId: match.seasonId, userId: { in: uniqueUserIds } },
        select: { id: true, userId: true },
      });
      const seasonUserIdByUserId = new Map(
        seasonUsers.map((su) => [su.userId, su.id]),
      );

      const entryScoresBySeasonUserId = new Map<
        string,
        { team1: number; team2: number }
      >();

      for (const entry of entries) {
        const seasonUserId = seasonUserIdByUserId.get(entry.userId);
        if (!seasonUserId) continue;

        const existing = entryScoresBySeasonUserId.get(seasonUserId) ?? {
          team1: 0,
          team2: 0,
        };
        if (entry.teamNo === 1) {
          existing.team1 = entry.totalPoints ?? 0;
        }
        if (entry.teamNo === 2) {
          existing.team2 = entry.totalPoints ?? 0;
        }
        entryScoresBySeasonUserId.set(seasonUserId, existing);
      }

      const rankedByEffectiveScore = [...entryScoresBySeasonUserId.entries()]
        .map(([seasonUserId, teamScores]) => {
          const hasDoubleTeam = dtSeasonUserIds.has(seasonUserId);
          const effectiveScore = hasDoubleTeam
            ? Math.max(teamScores.team1, teamScores.team2)
            : teamScores.team1;

          return {
            seasonUserId,
            rawScore: teamScores.team1,
            secondaryRawScore: hasDoubleTeam ? teamScores.team2 : null,
            effectiveScore,
          };
        })
        .sort((a, b) => {
          if (b.effectiveScore !== a.effectiveScore) {
            return b.effectiveScore - a.effectiveScore;
          }
          return a.seasonUserId.localeCompare(b.seasonUserId);
        });

      const seasonScores: Array<{
        seasonUserId: string;
        rank: number;
        rawScore: number;
        secondaryRawScore: number | null;
        effectiveScore: number;
      }> = [];

      let seasonRank = 1;
      let prevEffectiveScore: number | null = null;
      let processedSeason = 0;

      for (const entry of rankedByEffectiveScore) {
        if (
          prevEffectiveScore == null ||
          entry.effectiveScore !== prevEffectiveScore
        ) {
          seasonRank = processedSeason + 1;
          prevEffectiveScore = entry.effectiveScore;
        }
        processedSeason += 1;

        seasonScores.push({
          seasonUserId: entry.seasonUserId,
          rank: seasonRank,
          rawScore: entry.rawScore,
          secondaryRawScore: entry.secondaryRawScore,
          effectiveScore: entry.effectiveScore,
        });
      }

      if (seasonScores.length > 0) {
        await this.scoreService.submitMatchScoresBulk(
          matchId,
          seasonScores,
          matchResult,
        );
        this.logger.log(
          `[finalizeContest] Auto-published ${seasonScores.length} ranks for matchId=${matchId} with result=${matchResult}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[finalizeContest] Failed to auto-publish ranks for ${matchId}: ${String(error)}`,
      );
      // Non-fatal; don't throw since we already successfully ranked contest
    }

    return ranked;
  }

  /**
   * Recomputes FantasyPlayerSeasonStats for all players who appeared in a match.
   * Called after finalizing scoring. Safe to re-run at any time.
   */
  private async refreshPlayerSeasonStats(matchId: string): Promise<void> {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { seasonId: true },
    });
    if (!match?.seasonId) return;
    const seasonId = match.seasonId;

    // Gather all players who appeared in this match
    const matchStats =
      await this.prisma.client.fantasyPlayerMatchStats.findMany({
        where: { matchId, played: true },
        select: { fantasyPlayerId: true },
      });
    if (matchStats.length === 0) return;

    const playerIds = matchStats.map((m) => m.fantasyPlayerId);

    // Resolve all match IDs in this season upfront (FantasyPlayerMatchStats has no Match relation)
    const seasonMatches = await this.prisma.client.match.findMany({
      where: { seasonId },
      select: { id: true },
    });
    const seasonMatchIds = seasonMatches.map((m) => m.id);

    // Aggregate per-player across all matches in this season
    const allSeasonStats =
      await this.prisma.client.fantasyPlayerMatchStats.findMany({
        where: {
          fantasyPlayerId: { in: playerIds },
          matchId: { in: seasonMatchIds },
          played: true,
        },
        select: {
          fantasyPlayerId: true,
          runs: true,
          ballsFaced: true,
          fours: true,
          sixes: true,
          wickets: true,
          ballsBowled: true,
          runsConceded: true,
          maidens: true,
          dotBalls: true,
          catches: true,
          stumpings: true,
          runOutDirect: true,
          runOutAssist: true,
        },
      });

    const fantasyScores = await this.prisma.client.fantasyPlayerScore.findMany({
      where: {
        fantasyPlayerId: { in: playerIds },
        match: { is: { seasonId } },
      },
      select: { fantasyPlayerId: true, points: true },
    });

    // Group by player
    type Agg = {
      matchesPlayed: number;
      runsTotal: number;
      ballsFacedTotal: number;
      foursTotal: number;
      sixesTotal: number;
      highScore: number;
      thirtiesTotal: number;
      fiftiesTotal: number;
      centuriesTotal: number;
      wicketsTotal: number;
      ballsBowledTotal: number;
      runsConcededTotal: number;
      maidensTotal: number;
      dotBallsTotal: number;
      bestBowlingWickets: number;
      bestBowlingRuns: number;
      catchesTotal: number;
      stumpingsTotal: number;
      runOutsTotal: number;
      fantasyPointsTotal: number;
      fantasyPointsBest: number;
    };

    const agg = new Map<string, Agg>();
    const init = (): Agg => ({
      matchesPlayed: 0,
      runsTotal: 0,
      ballsFacedTotal: 0,
      foursTotal: 0,
      sixesTotal: 0,
      highScore: 0,
      thirtiesTotal: 0,
      fiftiesTotal: 0,
      centuriesTotal: 0,
      wicketsTotal: 0,
      ballsBowledTotal: 0,
      runsConcededTotal: 0,
      maidensTotal: 0,
      dotBallsTotal: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
      catchesTotal: 0,
      stumpingsTotal: 0,
      runOutsTotal: 0,
      fantasyPointsTotal: 0,
      fantasyPointsBest: 0,
    });

    for (const s of allSeasonStats) {
      const a = agg.get(s.fantasyPlayerId) ?? init();
      a.matchesPlayed++;
      a.runsTotal += s.runs;
      a.ballsFacedTotal += s.ballsFaced;
      a.foursTotal += s.fours;
      a.sixesTotal += s.sixes;
      if (s.runs > a.highScore) a.highScore = s.runs;
      if (s.runs >= 100) a.centuriesTotal++;
      else if (s.runs >= 50) a.fiftiesTotal++;
      else if (s.runs >= 30) a.thirtiesTotal++;
      a.wicketsTotal += s.wickets;
      a.ballsBowledTotal += s.ballsBowled;
      a.runsConcededTotal += s.runsConceded;
      a.maidensTotal += s.maidens;
      a.dotBallsTotal += s.dotBalls;
      // Best bowling: most wickets, fewest runs as tiebreaker
      if (
        s.wickets > a.bestBowlingWickets ||
        (s.wickets === a.bestBowlingWickets &&
          s.runsConceded < a.bestBowlingRuns)
      ) {
        a.bestBowlingWickets = s.wickets;
        a.bestBowlingRuns = s.runsConceded;
      }
      a.catchesTotal += s.catches;
      a.stumpingsTotal += s.stumpings;
      a.runOutsTotal += s.runOutDirect + s.runOutAssist;
      agg.set(s.fantasyPlayerId, a);
    }

    for (const fp of fantasyScores) {
      const a = agg.get(fp.fantasyPlayerId);
      if (!a) continue;
      a.fantasyPointsTotal += fp.points;
      if (fp.points > a.fantasyPointsBest) a.fantasyPointsBest = fp.points;
    }

    await Promise.all(
      [...agg.entries()].map(([fantasyPlayerId, a]) => {
        const fantasyPointsAvg =
          a.matchesPlayed > 0
            ? Math.round((a.fantasyPointsTotal / a.matchesPlayed) * 10) / 10
            : 0;
        const data = { ...a, fantasyPointsAvg };
        return this.prisma.client.fantasyPlayerSeasonStats.upsert({
          where: { fantasyPlayerId_seasonId: { fantasyPlayerId, seasonId } },
          update: data,
          create: { fantasyPlayerId, seasonId, ...data },
        });
      }),
    );

    this.logger.log(
      `[refreshPlayerSeasonStats] Updated ${agg.size} player season stats for seasonId=${seasonId}`,
    );
  }
}
