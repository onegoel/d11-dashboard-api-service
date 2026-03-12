import { prisma } from "../../prisma/client.js";

const getSeasonLeaderboard = async (seasonId: number) => {
  const leaderboard = await prisma.seasonUser.findMany({
    where: { seasonId },
    include: {
      user: true,
      scores: true,
    },
  });

  return leaderboard
    .map((player) => ({
      name: player.user.user_name,
      team: player.teamName,
      points: player.scores.reduce((sum, s) => sum + s.points, 0),
    }))
    .sort((a, b) => b.points - a.points);
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
