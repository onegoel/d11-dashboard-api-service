import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service.js";
import { WisdenService } from "../../wisden/wisden.service.js";
import {
  FANTASY_T20_POINT_SYSTEM,
  MY11_T20_CAPTAIN_MULTIPLIER,
  MY11_T20_VICE_CAPTAIN_MULTIPLIER,
} from "../../../common/constants/fantasy-point-rule.constants.js";
import { FantasyContestStatus } from "../../../../generated/prisma/client.js";
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

function parseWisdenBallParticipants(summary: string | undefined): {
  bowlerName: string | null;
  batterName: string | null;
} {
  if (!summary) {
    return { bowlerName: null, batterName: null };
  }

  const [bowlerName, batterName] = summary.split(" to ");
  return {
    bowlerName: bowlerName?.trim() || null,
    batterName: batterName?.trim() || null,
  };
}

function parseNamedFielders(raw: string): string[] {
  return raw
    .split(/\s*\/\s*|\s*&\s*|\s*,\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function parseWisdenRunOutFielders(message: string): string[] {
  const runOutBy = message.match(/run out(?: by)? ([^.]+?)(?:\.|,|$)/i);
  if (runOutBy?.[1]) {
    return parseNamedFielders(runOutBy[1]);
  }

  const caughtBy = message.match(/caught by ([^.]+?)(?:\.|,|$)/i);
  if (caughtBy?.[1] && /run out/i.test(message)) {
    return parseNamedFielders(caughtBy[1]);
  }

  return [];
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

  for (const innings of commentary.innings ?? []) {
    const battingTeamId = String(innings.batting_team_id);
    const bowlingTeamId =
      battingTeamId === team1WisdenId ? team2WisdenId : team1WisdenId;

    for (const over of innings.bbb ?? []) {
      let overBowlerId: string | null = null;
      let overLegalBalls = 0;
      let overRunsConceded = 0;

      for (const ball of over.balls ?? []) {
        const message = ball.commentary?.message ?? "";
        const lowerMessage = message.toLowerCase();
        const participants = parseWisdenBallParticipants(
          ball.commentary?.ball_summary_text,
        );
        const batter = resolveWisdenPlayer(
          playerIndex,
          participants.batterName,
          battingTeamId,
        );
        const bowler = resolveWisdenPlayer(
          playerIndex,
          participants.bowlerName,
          bowlingTeamId,
        );
        const recordedRuns = Number(ball.runs ?? 0);
        const isWide = /\bwides?\b/.test(lowerMessage);
        const isNoBall = /\bno[- ]balls?\b/.test(lowerMessage);
        const isLegBye = /\bleg byes?\b/.test(lowerMessage);
        const isBye = !isLegBye && /\bbyes?\b/.test(lowerMessage);
        const isWicket = ball.scoring === "W" || lowerMessage.includes("out!");
        const legalDelivery = !isWide && !isNoBall;

        let batterRuns = recordedRuns;
        let bowlerRunsConceded = recordedRuns;

        if (isWide) {
          batterRuns = 0;
        } else if (isLegBye || isBye) {
          batterRuns = 0;
          bowlerRunsConceded = 0;
        } else if (isNoBall) {
          batterRuns = Math.max(recordedRuns - 1, 0);
        }

        if (batter) {
          const batterStats = getOrCreateWisdenStats(
            statsMap,
            batter.wisdenPlayerId,
          );
          batterStats.played = true;
          batterStats.batted = true;
          if (!isWide) batterStats.ballsFaced += 1;
          batterStats.runs += batterRuns;
          if (batterRuns === 4) batterStats.fours += 1;
          if (batterRuns === 6) batterStats.sixes += 1;
          if (isWicket) batterStats.gotOut = true;
        }

        if (bowler) {
          overBowlerId = bowler.wisdenPlayerId;
          const bowlerStats = getOrCreateWisdenStats(
            statsMap,
            bowler.wisdenPlayerId,
          );
          bowlerStats.played = true;
          bowlerStats.runsConceded += bowlerRunsConceded;
          overRunsConceded += bowlerRunsConceded;
          if (legalDelivery) {
            bowlerStats.ballsBowled += 1;
            overLegalBalls += 1;
            if (bowlerRunsConceded === 0 && !isBye && !isLegBye) {
              bowlerStats.dotBalls += 1;
            }
          }

          if (isWicket && !/run out/i.test(lowerMessage)) {
            bowlerStats.wickets += 1;
            if (/\blbw\b/i.test(message)) bowlerStats.lbwWickets += 1;
            if (/\bbowled\b/i.test(message)) bowlerStats.bowledWickets += 1;
          }
        }

        if (isWicket) {
          const caughtBy = message.match(/caught by ([^.]+?)(?:\.|,|$)/i);
          const stumpedBy = message.match(/stumped by ([^.]+?)(?:\.|,|$)/i);

          if (stumpedBy?.[1]) {
            const wicketKeeper = resolveWisdenPlayer(
              playerIndex,
              stumpedBy[1],
              bowlingTeamId,
            );
            if (wicketKeeper) {
              getOrCreateWisdenStats(
                statsMap,
                wicketKeeper.wisdenPlayerId,
              ).stumpings += 1;
            }
          } else if (caughtBy?.[1]) {
            const catcher = resolveWisdenPlayer(
              playerIndex,
              caughtBy[1],
              bowlingTeamId,
            );
            if (catcher) {
              getOrCreateWisdenStats(
                statsMap,
                catcher.wisdenPlayerId,
              ).catches += 1;
            }
          } else if (/run out/i.test(lowerMessage)) {
            const fielders = parseWisdenRunOutFielders(message);
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
        }
      }

      if (overBowlerId && overLegalBalls >= 6 && overRunsConceded === 0) {
        getOrCreateWisdenStats(statsMap, overBowlerId).maidens += 1;
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
    const ranked = await this.finalizeContest(matchId);

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
}
