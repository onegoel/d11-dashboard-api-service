// const getAllUsers

import { prisma } from "../../prisma/client.js";

const getSeasonUsers = async (seasonId: number) => {
    return prisma.seasonUser.findMany({
        where: {
            seasonId,
        },
        include: {
            user: true,
        },
    });
};

const updateUserDisplayName = async (userId: number, displayName: string) => {
    return prisma.user.update({
        where: { id: userId },
        data: { display_name: displayName },
    });
};

const updateSeasonUserTeamName = async (seasonUserId: string, teamName: string) => {
    return prisma.seasonUser.update({
        where: { id: seasonUserId },
        data: { teamName },
        include: {
            user: true,
        },
    });
};

export const usersService = {
    getSeasonUsers,
    updateUserDisplayName,
    updateSeasonUserTeamName,
};
