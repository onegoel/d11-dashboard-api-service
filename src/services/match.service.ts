import { prisma } from "../../prisma/client.js";

const getSeasonMatches = async (seasonId: number) => {
  const matches = await prisma.match.findMany({
    where: { seasonId },
    orderBy: { matchDate: "asc" },
  });

  return matches;
};

export const matchService = {
  getSeasonMatches,
};
