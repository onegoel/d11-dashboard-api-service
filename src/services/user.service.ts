// const getAllUsers

import { prisma } from "../../prisma/client.js";

const getSeasonUsers = async (seasonId: number) => {
  const seasonUsers = await prisma.seasonUser.findMany({
    where: {
      seasonId,
    },
  });

  return seasonUsers;
};

export const usersService = {
  getSeasonUsers,
};
