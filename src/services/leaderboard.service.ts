import { prisma } from "../../prisma/client.js";
import { MatchStatus } from "../../generated/prisma/client.js";

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

const getSeasonLeaderboard = async (seasonId: number) => {
  const [seasonUsers, completedMatches] = await Promise.all([
    prisma.seasonUser.findMany({
      where: { seasonId },
      include: {
        user: true,
        scores: {
          where: {
            match: {
              status: MatchStatus.COMPLETED,
            },
          },
        },
      },
    }),
    prisma.match.findMany({
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
          cumulativePoints,
          didPlay: score !== undefined,
        };
      });

      const playedHistory = history.filter((point) => point.didPlay);
      const recentForm = playedHistory
        .slice(Math.max(playedHistory.length - 5, 0))
        .reverse()
        .map((point) => ({
          matchId: point.matchId,
          matchNo: point.matchNo,
          rank: point.rank ?? 0,
        }));

      const displayName = player.user.display_name;
      const totalPoints = history.length > 0 ? history[history.length - 1]!.cumulativePoints : 0;
      const finalPoints = calcFinalPoints(playedHistory.map((p) => p.points));

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
        recentForm,
        history,
      };
    })
    .sort((a, b) => {
      if (b.finalPoints !== a.finalPoints) {
        return b.finalPoints - a.finalPoints;
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
    name: player.seasonUser.user.display_name,
    teamName: player.seasonUser.teamName,
    points: player.points,
    rank: player.rank,
  }));
};

export const leaderboardService = {
  getSeasonLeaderboard,
  getMatchLeaderboard,
};
