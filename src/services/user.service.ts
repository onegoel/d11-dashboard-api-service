// const getAllUsers

import { prisma } from "../../prisma/client.js";

const getSeasonUsers = async (seasonId: number) => {
    const seasonUsers = await prisma.seasonUser.findMany({
        where: {
            seasonId,
        },
        include: {
            user: true,
        },
    });

    return seasonUsers;
};

export const usersService = {
    getSeasonUsers,
};
