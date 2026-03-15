import { prisma } from "../../prisma/client.js";
import { MatchStatus } from "../../generated/prisma/client.js";

const getSeasonLeaderboard = async (seasonId: number) => {
  const leaderboard = await prisma.seasonUser.findMany({
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
          match: {
            select: {
              id: true,
              matchNo: true,
              matchDate: true,
            },
          },
        },
      },
    },
  });

  return leaderboard
    .map((player) => {
      const completedScores = [...player.scores].sort(
        (a, b) =>
          new Date(b.match.matchDate).getTime() -
          new Date(a.match.matchDate).getTime(),
      );

      const fullName = `${player.user.first_name} ${player.user.last_name}`;

      return {
        id: player.id,
        name: fullName,
        userName: player.user.user_name,
        fullName,
        teamName: player.teamName,
        team: player.teamName,
        points: player.scores.reduce((sum, score) => sum + score.points, 0),
        played: player.scores.length,
        wins: player.scores.filter((score) => score.rank === 1).length,
        recentForm: completedScores.slice(0, 5).map((score) => ({
          matchId: score.matchId,
          matchNo: score.match.matchNo,
          rank: score.rank,
        })),
      };
    })
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return a.fullName.localeCompare(b.fullName);
    });
};

const getMatchLeaderboard = async (matchId: string) => {
  const matchLeaderboard = await prisma.score.findMany({
    where: { matchId },
    include: {
      seasonUser: {
        include: { user: true },
      },
    },
    orderBy: { rank: "asc" },
  });

  return matchLeaderboard.map((player) => ({
    name: player.seasonUser.user.user_name,
    teamName: player.seasonUser.teamName,
    points: player.points,
    rank: player.rank,
  }));
};

export const leaderboardService = {
  getSeasonLeaderboard,
  getMatchLeaderboard,
};
