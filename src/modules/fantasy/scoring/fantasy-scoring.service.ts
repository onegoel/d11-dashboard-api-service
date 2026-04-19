import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service.js";
import { WisdenService } from "../../wisden/wisden.service.js";
import { ScoreService } from "../../score/score.service.js";
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
      stats.batted = ballsFaced > 0;
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

function computePoints(s: PlayerStats): {
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
  if (s.batted && s.gotOut && s.runs === 0) {
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

    const [scorecard, commentary] = await Promise.all([
      this.wisden.getScorecard(match.wisdenMatchGid),
      this.wisden.getCommentaryBasic(match.wisdenMatchGid),
    ]);

    return this.scoreWisdenMatch(matchId, commentary, scorecard);
  }

  async scoreWisdenMatch(
    matchId: string,
    commentary: WisdenCommentaryResponse,
    scorecard: WisdenScorecardResponse,
  ): Promise<{ scored: number; ranked: number }> {
    const scored = await this.computeAndPersistWisdenScores(
      matchId,
      commentary,
      scorecard,
      true,
    );
    const ranked = await this.finalizeContestAndPublishRanks(matchId);

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
  ): Promise<number> {
    const statsMap = accumulateWisdenCommentary(commentary, scorecard);

    const matchPlayers = await this.prisma.client.fantasyMatchPlayer.findMany({
      where: { matchId, wisdenPlayerId: { not: null } },
      select: {
        fantasyPlayerId: true,
        wisdenPlayerId: true,
        wisdenMatchGid: true,
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
      const { points, breakdown } = computePoints(stats);

      await this.prisma.client.fantasyPlayerScore.upsert({
        where: {
          fantasyPlayerId_matchId: {
            fantasyPlayerId: matchPlayer.fantasyPlayerId,
            matchId,
          },
        },
        update: {
          points,
          breakdown: breakdown as never,
          isFinalized,
          wisdenPlayerId: matchPlayer.wisdenPlayerId,
          wisdenMatchGid: matchPlayer.wisdenMatchGid,
        },
        create: {
          fantasyPlayerId: matchPlayer.fantasyPlayerId,
          matchId,
          points,
          breakdown: breakdown as never,
          isFinalized,
          wisdenPlayerId: matchPlayer.wisdenPlayerId,
          wisdenMatchGid: matchPlayer.wisdenMatchGid,
        },
      });

      upserted++;
    }

    this.logger.log(
      `[scoring] Upserted ${upserted} Wisden player scores for matchId=${matchId}`,
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

    const entryTotals: { id: string; totalPoints: number }[] = [];

    // ── Anchor Player chip pre-computation ───────────────────────────────
    // Always query chip plays directly — entry.chipCode may be null if the
    // team was submitted before the chip was activated.
    const anchorGrantedUserIds = new Set<number>(); // qualify for 1.1x
    const anchorActiveUserIds = new Set<number>(); // have an AP chip for this match

    const anchorChipPlays = await this.prisma.client.chipPlay.findMany({
      where: {
        startMatchId: matchId,
        status: ChipPlayStatus.SCHEDULED,
        chipType: { code: ChipCode.ANCHOR_PLAYER },
      },
      select: {
        extraInfo: true,
        seasonUser: { select: { userId: true } },
      },
    });

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

      // Backfill entry.chipCode for entries whose chip was activated after
      // team submission (so the pill shows correctly in the leaderboard).
      await Promise.all(
        contest.entries
          .filter(
            (e) =>
              e.chipCode !== ChipCode.ANCHOR_PLAYER &&
              anchorActiveUserIds.has(e.userId),
          )
          .map((e) =>
            this.prisma.client.fantasyContestEntry.update({
              where: { id: e.id },
              data: { chipCode: ChipCode.ANCHOR_PLAYER },
            }),
          ),
      );
    }
    // ─────────────────────────────────────────────────────────────────────

    for (const entry of contest.entries) {
      const starters = entry.players.filter((p) => !p.isBench);
      const bench = entry.players
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
        if (pts === 0 && availableBench.length > 0) {
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
    await Promise.all(
      entryTotals.map((e) =>
        this.prisma.client.fantasyContestEntry.update({
          where: { id: e.id },
          data: { totalPoints: e.totalPoints, rank: rank++ },
        }),
      ),
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
        },
      });

      const rankedEntries = entries.filter((e) => e.rank != null);
      if (rankedEntries.length === 0) return ranked;

      // Resolve SeasonUser.id for each userId in this season
      const uniqueUserIds = [...new Set(rankedEntries.map((e) => e.userId))];
      const seasonUsers = await this.prisma.client.seasonUser.findMany({
        where: { seasonId: match.seasonId, userId: { in: uniqueUserIds } },
        select: { id: true, userId: true },
      });
      const seasonUserIdByUserId = new Map(
        seasonUsers.map((su) => [su.userId, su.id]),
      );

      // One entry per user — keep their best (lowest) rank across both teams
      const bestRankBySeasonUserId = new Map<string, number>();
      for (const e of rankedEntries) {
        const seasonUserId = seasonUserIdByUserId.get(e.userId);
        if (!seasonUserId) continue;
        const current = bestRankBySeasonUserId.get(seasonUserId) ?? Infinity;
        if (e.rank! < current)
          bestRankBySeasonUserId.set(seasonUserId, e.rank!);
      }

      const seasonScores = [...bestRankBySeasonUserId.entries()].map(
        ([seasonUserId, rank]) => ({ seasonUserId, rank }),
      );

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
}
