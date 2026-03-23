import { Injectable } from "@nestjs/common";
import {
  ChipCode,
  ChipPlayStatus,
  MatchResult,
  MatchStatus,
} from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { RANK_POINTS } from "../score/points-system.js";

const getChipShortCode = (chipCode: ChipCode) => {
  switch (chipCode) {
    case ChipCode.DOUBLE_TEAM:
      return "DT";
    case ChipCode.TEAM_FORM:
      return "TF";
    case ChipCode.SWAPPER:
      return "SW";
    case ChipCode.ANCHOR_PLAYER:
      return "AP";
    default:
      return chipCode;
  }
};

const DROP_COUNT = parseInt(process.env.BEST_N_DROP_COUNT ?? "0", 10);
const POWER_RANKING_WINDOW_SIZE = 5;
const POWER_MISSED_MATCH_PENALTY = 4;
const POWER_WIN_BONUS = 2;
const POWER_PODIUM_BONUS = 1;

const calcFinalPoints = (playedPoints: number[]): number => {
  if (playedPoints.length === 0) return 0;
  if (playedPoints.length <= DROP_COUNT) return playedPoints.reduce((sum, p) => sum + p, 0);
  const keep = playedPoints.length - DROP_COUNT;
  return [...playedPoints]
    .sort((a, b) => b - a)
    .slice(0, keep)
    .reduce((sum, p) => sum + p, 0);
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const roundToTwo = (value: number): number => Math.round(value * 100) / 100;

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSeasonPowerRankings(seasonId: number) {
    const [completedMatches, seasonUsers] = await Promise.all([
      this.prisma.client.match.findMany({
        where: {
          seasonId,
          status: MatchStatus.COMPLETED,
          matchResult: {
            not: MatchResult.ABANDONED,
          },
        },
        select: {
          id: true,
          matchNo: true,
          matchDate: true,
          homeTeam: {
            select: {
              shortCode: true,
            },
          },
          awayTeam: {
            select: {
              shortCode: true,
            },
          },
        },
        orderBy: [{ matchDate: "asc" }, { matchNo: "asc" }],
      }),
      this.prisma.client.seasonUser.findMany({
        where: { seasonId },
        include: {
          user: {
            select: {
              id: true,
              user_name: true,
              display_name: true,
              photo_url: true,
            },
          },
          scores: {
            where: {
              match: {
                status: MatchStatus.COMPLETED,
                matchResult: {
                  not: MatchResult.ABANDONED,
                },
              },
            },
            select: {
              matchId: true,
              rank: true,
              points: true,
            },
          },
        },
      }),
    ]);

    const recentMatches = completedMatches.slice(
      Math.max(completedMatches.length - POWER_RANKING_WINDOW_SIZE, 0),
    );
    const weights = recentMatches.map((_, index) => index + 1);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const maxPossiblePoints = Math.max(...Object.values(RANK_POINTS), 1);

    const serializedMatches = recentMatches.map((match) => ({
      id: match.id,
      matchNo: match.matchNo,
      matchDate: match.matchDate.toISOString(),
      matchLabel: `${match.homeTeam.shortCode} vs ${match.awayTeam.shortCode}`,
    }));

    const rankings = seasonUsers
      .map((seasonUser) => {
        const scoreByMatchId = new Map(
          seasonUser.scores.map((score) => [score.matchId, score]),
        );

        let weightedPointsSum = 0;
        let playedMatches = 0;
        let winCount = 0;
        let podiumCount = 0;

        const recentWindow = recentMatches.map((match, index) => {
          const score = scoreByMatchId.get(match.id);
          const points = score?.points ?? 0;
          const rank = score?.rank ?? null;
          const didPlay = score !== undefined;
          const weight = weights[index] ?? 1;

          weightedPointsSum += points * weight;

          if (didPlay) {
            playedMatches += 1;
          }

          if (rank === 1) {
            winCount += 1;
          }

          if (rank !== null && rank <= 3) {
            podiumCount += 1;
          }

          return {
            matchId: match.id,
            matchNo: match.matchNo,
            matchDate: match.matchDate.toISOString(),
            matchLabel: `${match.homeTeam.shortCode} vs ${match.awayTeam.shortCode}`,
            didPlay,
            rank,
            points,
            weight,
            weightedContribution: roundToTwo(points * weight),
          };
        });

        const weightedAveragePoints =
          totalWeight === 0 ? 0 : weightedPointsSum / totalWeight;
        const baseScore =
          maxPossiblePoints === 0
            ? 0
            : (weightedAveragePoints / maxPossiblePoints) * 100;

        const missedMatches = Math.max(recentMatches.length - playedMatches, 0);
        const participationPenalty = missedMatches * POWER_MISSED_MATCH_PENALTY;

        const winBonus = winCount * POWER_WIN_BONUS;
        const podiumBonus =
          Math.max(podiumCount - winCount, 0) * POWER_PODIUM_BONUS;

        const firstSlice = recentWindow.slice(0, Math.min(2, recentWindow.length));
        const lastSlice = recentWindow.slice(Math.max(recentWindow.length - 2, 0));

        const firstSliceAverage =
          firstSlice.length === 0
            ? 0
            : firstSlice.reduce((sum, row) => sum + row.points, 0) /
              firstSlice.length;
        const lastSliceAverage =
          lastSlice.length === 0
            ? 0
            : lastSlice.reduce((sum, row) => sum + row.points, 0) /
              lastSlice.length;
        const trendBonus = clamp(
          (lastSliceAverage - firstSliceAverage) * 2,
          -8,
          8,
        );

        const powerScoreRaw =
          baseScore - participationPenalty + winBonus + podiumBonus + trendBonus;
        const powerScore = roundToTwo(clamp(powerScoreRaw, 0, 100));

        return {
          seasonUserId: seasonUser.id,
          userId: seasonUser.user.id,
          userName: seasonUser.user.user_name,
          displayName: seasonUser.user.display_name,
          photoUrl: seasonUser.user.photo_url,
          teamName: seasonUser.teamName,
          powerScore,
          components: {
            weightedAveragePoints: roundToTwo(weightedAveragePoints),
            baseScore: roundToTwo(baseScore),
            playedMatches,
            missedMatches,
            participationPenalty: roundToTwo(participationPenalty),
            wins: winCount,
            podiums: podiumCount,
            winBonus: roundToTwo(winBonus),
            podiumBonus: roundToTwo(podiumBonus),
            trendBonus: roundToTwo(trendBonus),
          },
          recentWindow,
        };
      })
      .sort((a, b) => {
        if (b.powerScore !== a.powerScore) {
          return b.powerScore - a.powerScore;
        }

        if (b.components.baseScore !== a.components.baseScore) {
          return b.components.baseScore - a.components.baseScore;
        }

        return a.displayName.localeCompare(b.displayName);
      })
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    return {
      seasonId,
      windowSize: recentMatches.length,
      weights,
      recentMatches: serializedMatches,
      rankings,
    };
  }

  async getSeasonLeaderboard(seasonId: number) {
    const [seasonUsers, completedMatches, chipTypes] = await Promise.all([
      this.prisma.client.seasonUser.findMany({
        where: { seasonId },
        include: {
          user: true,
          scores: {
            where: {
              match: {
                status: MatchStatus.COMPLETED,
                matchResult: {
                  not: MatchResult.ABANDONED,
                },
              },
            },
            include: {
              chipPlay: {
                select: {
                  chipType: {
                    select: {
                      code: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          chipPlays: {
            where: {
              status: {
                not: ChipPlayStatus.CANCELLED,
              },
            },
            include: {
              chipType: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  maxUsesPerSeason: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.client.match.findMany({
        where: {
          seasonId,
          status: MatchStatus.COMPLETED,
          matchResult: {
            not: MatchResult.ABANDONED,
          },
        },
        select: {
          id: true,
          matchNo: true,
          matchDate: true,
          homeTeam: {
            select: {
              shortCode: true,
            },
          },
          awayTeam: {
            select: {
              shortCode: true,
            },
          },
        },
        orderBy: [{ matchDate: "asc" }, { matchNo: "asc" }],
      }),
      this.prisma.client.chipType.findMany({
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          code: true,
          name: true,
          maxUsesPerSeason: true,
        },
      }),
    ]);

    const serializedMatches = completedMatches.map((match) => ({
      id: match.id,
      matchNo: match.matchNo,
      matchDate: match.matchDate.toISOString(),
      matchLabel: `${match.homeTeam.shortCode} vs ${match.awayTeam.shortCode}`,
    }));

    const leaderboard = seasonUsers
      .map((player) => {
        const scoresByMatchId = new Map(
          player.scores.map((score) => [score.matchId, score]),
        );
        let cumulativePoints = 0;

        const history = completedMatches.map((match) => {
          const score = scoresByMatchId.get(match.id);
          const points = score?.points ?? 0;

          cumulativePoints += points;

          return {
            matchId: match.id,
            matchNo: match.matchNo,
            matchDate: match.matchDate.toISOString(),
            matchLabel: `${match.homeTeam.shortCode} vs ${match.awayTeam.shortCode}`,
            points,
            rank: score?.rank ?? null,
            chipCode: score?.chipPlay?.chipType.code ?? null,
            chipName: score?.chipPlay?.chipType.name ?? null,
            cumulativePoints,
            didPlay: score !== undefined,
          };
        });

        const playedHistory = history.filter((point) => point.didPlay);
        const averageRank = playedHistory.length > 0
          ? playedHistory.reduce((total, point) => total + (point.rank ?? 0), 0) /
            playedHistory.length
          : null;

        const recentForm = history
          .slice(Math.max(history.length - 5, 0))
          .reverse()
          .map((point) => ({
            matchId: point.matchId,
            matchNo: point.matchNo,
            rank: point.rank ?? 0,
            chipCode: point.chipCode,
            didPlay: point.didPlay,
          }));

        const powerups = chipTypes.map((chipType) => {
          const usedCount = player.chipPlays.filter(
            (chipPlay) => chipPlay.chipTypeId === chipType.id,
          ).length;

          return {
            chipCode: chipType.code,
            chipShortCode: getChipShortCode(chipType.code),
            chipName: chipType.name,
            usedCount,
            maxUsesPerSeason: chipType.maxUsesPerSeason,
            remainingCount: Math.max(chipType.maxUsesPerSeason - usedCount, 0),
          };
        });

        const displayName = player.user.display_name;
        const totalPoints =
          history.length > 0 ? history[history.length - 1]!.cumulativePoints : 0;
        const finalPoints = calcFinalPoints(playedHistory.map((point) => point.points));

        return {
          id: player.id,
          name: displayName,
          displayName,
          userName: player.user.user_name,
          photoUrl: player.user.photo_url,
          fullName: displayName,
          teamName: player.teamName,
          team: player.teamName,
          points: totalPoints,
          gamesDropCount: DROP_COUNT,
          finalPoints,
          played: playedHistory.length,
          wins: playedHistory.filter((point) => point.rank === 1).length,
          averageRank,
          recentForm,
          history,
          powerups,
        };
      })
      .sort((a, b) => {
        if (b.finalPoints !== a.finalPoints) {
          return b.finalPoints - a.finalPoints;
        }

        const aAverageRank = a.averageRank ?? Number.POSITIVE_INFINITY;
        const bAverageRank = b.averageRank ?? Number.POSITIVE_INFINITY;

        if (aAverageRank !== bAverageRank) {
          return aAverageRank - bAverageRank;
        }

        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }

        return a.displayName.localeCompare(b.displayName);
      });

    return {
      seasonId,
      completedMatches: serializedMatches,
      leaderboard,
    };
  }

  async getMatchLeaderboard(matchId: string) {
    const matchLeaderboard = await this.prisma.client.score.findMany({
      where: { matchId },
      include: {
        seasonUser: {
          include: { user: true },
        },
        chipPlay: {
          select: {
            chipType: {
              select: {
                code: true,
              },
            },
          },
        },
      },
      orderBy: { rank: "asc" },
    });

    return matchLeaderboard.map((player) => ({
      name: player.seasonUser.user.display_name,
      teamName: player.seasonUser.teamName,
      points: player.points,
      rank: player.rank,
      chipCode: player.chipPlay?.chipType.code ?? null,
    }));
  }
}
