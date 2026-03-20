import { Injectable } from "@nestjs/common";
import {
  ChipCode,
  ChipPlayStatus,
  MatchStatus,
} from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";

const getChipShortCode = (chipCode: ChipCode) => {
  switch (chipCode) {
    case ChipCode.DOUBLE_TEAM:
      return "DT";
    case ChipCode.COMEBACK_KID:
      return "CK";
    default:
      return chipCode;
  }
};

const DROP_COUNT = parseInt(process.env.BEST_N_DROP_COUNT ?? "0", 10);

const calcFinalPoints = (playedPoints: number[]): number => {
  if (playedPoints.length === 0) return 0;
  if (playedPoints.length <= DROP_COUNT) return playedPoints.reduce((sum, p) => sum + p, 0);
  const keep = playedPoints.length - DROP_COUNT;
  return [...playedPoints]
    .sort((a, b) => b - a)
    .slice(0, keep)
    .reduce((sum, p) => sum + p, 0);
};

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

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

        const recentForm = playedHistory
          .slice(Math.max(playedHistory.length - 5, 0))
          .reverse()
          .map((point) => ({
            matchId: point.matchId,
            matchNo: point.matchNo,
            rank: point.rank ?? 0,
            chipCode: point.chipCode,
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
