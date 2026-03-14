import { prisma } from "../../prisma/client.js";
import { MatchStatus } from "../../generated/prisma/client.js";

type GetSeasonMatchesOptions = {
    status?: MatchStatus;
};

const getSeasonMatches = async (
    seasonId: number,
    options: GetSeasonMatchesOptions = {},
) => {
    const matches = await prisma.match.findMany({
                where: {
                        seasonId,
                        ...(options.status ? { status: options.status } : {}),
                },
        orderBy: { matchDate: "asc" },
        include: {
            homeTeam: true,
            awayTeam: true,
        },
    });

    return matches;
};

const updateMatchStatus = async (matchId: string, status: MatchStatus) => {
    return prisma.match.update({
        where: { id: matchId },
        data: { status },
        include: {
            homeTeam: true,
            awayTeam: true,
        },
    });
};

export const matchService = {
    getSeasonMatches,
        updateMatchStatus,
};
