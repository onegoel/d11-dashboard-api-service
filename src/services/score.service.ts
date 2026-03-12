import { prisma } from "../../prisma/client.js";

export interface MatchScore {
  matchId: string;
  seasonUserId: string;
  points: number;
  rank: number;
}

const submitMatchScore = async (score: MatchScore) => {
  return prisma.score.upsert({
    where: {
      seasonUserId_matchId: {
        seasonUserId: score.seasonUserId,
        matchId: score.matchId,
      },
    },
    update: {
      points: score.points,
    },
    create: {
      seasonUserId: score.seasonUserId,
      matchId: score.matchId,
      points: score.points,
      rank: score.rank,
    },
  });
};

export const scoresService = { submitMatchScore };
