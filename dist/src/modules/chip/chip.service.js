var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@nestjs/common";
import { ChipCode, ChipPlayStatus, MatchStatus, Prisma, PrismaClient, } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
export class ChipServiceError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
const getChipShortCode = (code) => {
    switch (code) {
        case ChipCode.DOUBLE_TEAM:
            return "DT";
        case ChipCode.COMEBACK_KID:
            return "CK";
        default:
            return code;
    }
};
const buildMatchLabel = (match) => {
    return `${match.homeTeam.shortCode} vs ${match.awayTeam.shortCode}`;
};
const getOrderedSeasonMatches = async (tx, seasonId) => {
    return tx.match.findMany({
        where: { seasonId },
        select: {
            id: true,
            matchNo: true,
            matchDate: true,
            status: true,
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
    });
};
const getAffectedMatches = (orderedMatches, startMatchId, windowSize) => {
    const startIndex = orderedMatches.findIndex((match) => match.id === startMatchId);
    if (startIndex < 0) {
        return [];
    }
    const size = Math.max(windowSize, 1);
    return orderedMatches.slice(startIndex, startIndex + size);
};
const hasOverlap = (firstIds, secondIds) => {
    const firstSet = new Set(firstIds);
    return secondIds.some((id) => firstSet.has(id));
};
const getStandingsForSeason = async (tx, seasonId) => {
    const seasonUsers = await tx.seasonUser.findMany({
        where: { seasonId },
        include: {
            user: true,
            scores: {
                where: {
                    match: {
                        status: MatchStatus.COMPLETED,
                    },
                },
                select: {
                    points: true,
                    rank: true,
                },
            },
        },
    });
    const standings = seasonUsers
        .map((seasonUser) => {
        const totalPoints = seasonUser.scores.reduce((sum, score) => sum + score.points, 0);
        const averageRank = seasonUser.scores.length > 0
            ? seasonUser.scores.reduce((sum, score) => sum + score.rank, 0) /
                seasonUser.scores.length
            : Number.POSITIVE_INFINITY;
        const wins = seasonUser.scores.filter((score) => score.rank === 1).length;
        return {
            seasonUserId: seasonUser.id,
            displayName: seasonUser.user.display_name,
            points: totalPoints,
            averageRank,
            wins,
        };
    })
        .sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        if (a.averageRank !== b.averageRank) {
            return a.averageRank - b.averageRank;
        }
        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }
        return a.displayName.localeCompare(b.displayName);
    });
    const positionBySeasonUserId = new Map();
    standings.forEach((entry, index) => {
        positionBySeasonUserId.set(entry.seasonUserId, index + 1);
    });
    return {
        totalPlayers: standings.length,
        positionBySeasonUserId,
    };
};
const isBottomHalfPosition = (position, totalPlayers) => {
    if (totalPlayers < 2) {
        return false;
    }
    return position > Math.ceil(totalPlayers / 2);
};
export const resolveActiveChipAssignmentsForMatchTx = async (tx, seasonId, matchId, seasonUserIds) => {
    const orderedMatches = await getOrderedSeasonMatches(tx, seasonId);
    const targetIndex = orderedMatches.findIndex((match) => match.id === matchId);
    if (targetIndex < 0) {
        throw new ChipServiceError(404, "Match not found for season");
    }
    const chipPlays = await tx.chipPlay.findMany({
        where: {
            seasonUser: { seasonId },
            status: ChipPlayStatus.SCHEDULED,
            ...(seasonUserIds && seasonUserIds.length > 0
                ? {
                    seasonUserId: {
                        in: seasonUserIds,
                    },
                }
                : {}),
        },
        include: {
            chipType: true,
            startMatch: {
                select: {
                    id: true,
                    matchNo: true,
                },
            },
        },
    });
    const assignments = new Map();
    for (const chipPlay of chipPlays) {
        const affectedMatches = getAffectedMatches(orderedMatches, chipPlay.startMatchId, chipPlay.chipType.effectWindowMatches);
        const activeIndex = affectedMatches.findIndex((match) => match.id === matchId);
        if (activeIndex < 0) {
            continue;
        }
        if (assignments.has(chipPlay.seasonUserId)) {
            throw new ChipServiceError(500, `Overlapping chip plays found for season user ${chipPlay.seasonUserId}`);
        }
        assignments.set(chipPlay.seasonUserId, {
            seasonUserId: chipPlay.seasonUserId,
            chipPlayId: chipPlay.id,
            chipCode: chipPlay.chipType.code,
            chipName: chipPlay.chipType.name,
            chipShortCode: getChipShortCode(chipPlay.chipType.code),
            multiplier: chipPlay.chipType.multiplier,
            windowSize: affectedMatches.length,
            windowIndex: activeIndex + 1,
            usesSecondaryTeamScore: chipPlay.chipType.usesSecondaryTeamScore,
            startMatchId: chipPlay.startMatch.id,
            startMatchNo: chipPlay.startMatch.matchNo,
        });
    }
    return assignments;
};
const getChipTypeByCodeTx = async (tx, chipCode) => {
    const chipType = await tx.chipType.findUnique({
        where: {
            code: chipCode,
        },
    });
    if (!chipType) {
        throw new ChipServiceError(404, "Chip type not found");
    }
    return chipType;
};
const getSeasonUserTx = async (tx, seasonUserId, seasonId) => {
    const seasonUser = await tx.seasonUser.findUnique({
        where: {
            id: seasonUserId,
        },
        include: {
            user: true,
        },
    });
    if (!seasonUser || seasonUser.seasonId !== seasonId) {
        throw new ChipServiceError(404, "Season user not found in this season");
    }
    return seasonUser;
};
const serializeChipType = (chipType) => ({
    id: chipType.id,
    code: chipType.code,
    shortCode: getChipShortCode(chipType.code),
    name: chipType.name,
    description: chipType.description,
    multiplier: chipType.multiplier,
    maxUsesPerSeason: chipType.maxUsesPerSeason,
    effectWindowMatches: chipType.effectWindowMatches,
    requiresBottomHalf: chipType.requiresBottomHalf,
    usesSecondaryTeamScore: chipType.usesSecondaryTeamScore,
});
const serializeAffectedMatches = (orderedMatches, startMatchId, windowSize) => {
    return getAffectedMatches(orderedMatches, startMatchId, windowSize).map((match) => ({
        id: match.id,
        matchNo: match.matchNo,
        matchDate: match.matchDate.toISOString(),
        matchLabel: buildMatchLabel(match),
    }));
};
const serializeChipPlay = (chipPlay, orderedMatches, now) => {
    const affectedMatches = serializeAffectedMatches(orderedMatches, chipPlay.startMatchId, chipPlay.chipType.effectWindowMatches);
    const hasStarted = chipPlay.startMatch.matchDate <= now;
    return {
        id: chipPlay.id,
        seasonUserId: chipPlay.seasonUserId,
        chipCode: chipPlay.chipType.code,
        chipShortCode: getChipShortCode(chipPlay.chipType.code),
        chipName: chipPlay.chipType.name,
        status: chipPlay.status,
        startMatchId: chipPlay.startMatch.id,
        startMatchNo: chipPlay.startMatch.matchNo,
        startMatchDate: chipPlay.startMatch.matchDate.toISOString(),
        startMatchLabel: buildMatchLabel(chipPlay.startMatch),
        affectedMatches,
        canDeselect: chipPlay.status === ChipPlayStatus.SCHEDULED && chipPlay.startMatch.matchDate > now,
        hasStarted,
        canceledAt: chipPlay.canceledAt?.toISOString() ?? null,
        createdAt: chipPlay.createdAt.toISOString(),
    };
};
const getSeasonPowerupsOverview = async (prismaClient, seasonId) => {
    const now = new Date();
    const [chipTypes, seasonUsers, orderedMatches, chipPlays, standings] = await prismaClient.$transaction(async (tx) => {
        const [loadedChipTypes, loadedSeasonUsers, loadedOrderedMatches, loadedChipPlays, loadedStandings,] = await Promise.all([
            tx.chipType.findMany({
                orderBy: {
                    id: "asc",
                },
            }),
            tx.seasonUser.findMany({
                where: { seasonId },
                include: {
                    user: true,
                },
            }),
            getOrderedSeasonMatches(tx, seasonId),
            tx.chipPlay.findMany({
                where: {
                    seasonUser: {
                        seasonId,
                    },
                },
                include: {
                    chipType: true,
                    startMatch: {
                        select: {
                            id: true,
                            matchNo: true,
                            matchDate: true,
                            status: true,
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
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            }),
            getStandingsForSeason(tx, seasonId),
        ]);
        return [
            loadedChipTypes,
            loadedSeasonUsers,
            loadedOrderedMatches,
            loadedChipPlays,
            loadedStandings,
        ];
    });
    const playsBySeasonUserId = new Map();
    for (const chipPlay of chipPlays) {
        const userPlays = playsBySeasonUserId.get(chipPlay.seasonUserId) ?? [];
        userPlays.push(chipPlay);
        playsBySeasonUserId.set(chipPlay.seasonUserId, userPlays);
    }
    const users = seasonUsers
        .map((seasonUser) => {
        const userPlays = playsBySeasonUserId.get(seasonUser.id) ?? [];
        const position = standings.positionBySeasonUserId.get(seasonUser.id) ?? null;
        const chipInventory = chipTypes.map((chipType) => {
            const usedCount = userPlays.filter((play) => play.chipTypeId === chipType.id &&
                play.status !== ChipPlayStatus.CANCELLED).length;
            return {
                chipCode: chipType.code,
                chipShortCode: getChipShortCode(chipType.code),
                chipName: chipType.name,
                maxUsesPerSeason: chipType.maxUsesPerSeason,
                usedCount,
                remainingCount: Math.max(chipType.maxUsesPerSeason - usedCount, 0),
            };
        });
        const eligibilityByChipCode = Object.fromEntries(chipTypes.map((chipType) => [
            chipType.code,
            chipType.requiresBottomHalf
                ? position !== null &&
                    isBottomHalfPosition(position, standings.totalPlayers)
                : true,
        ]));
        const serializedPlays = userPlays
            .map((chipPlay) => serializeChipPlay(chipPlay, orderedMatches, now))
            .sort((a, b) => {
            const dateDelta = new Date(a.startMatchDate).getTime() -
                new Date(b.startMatchDate).getTime();
            if (dateDelta !== 0) {
                return dateDelta;
            }
            return a.chipName.localeCompare(b.chipName);
        });
        return {
            seasonUserId: seasonUser.id,
            displayName: seasonUser.user.display_name,
            teamName: seasonUser.teamName,
            position,
            chipInventory,
            eligibilityByChipCode,
            plays: serializedPlays,
        };
    })
        .sort((a, b) => {
        const aPosition = a.position ?? Number.POSITIVE_INFINITY;
        const bPosition = b.position ?? Number.POSITIVE_INFINITY;
        if (aPosition !== bPosition) {
            return aPosition - bPosition;
        }
        return a.displayName.localeCompare(b.displayName);
    });
    return {
        seasonId,
        chipTypes: chipTypes.map((chipType) => serializeChipType(chipType)),
        selectableMatches: orderedMatches
            .filter((match) => match.matchDate > now)
            .map((match) => ({
            id: match.id,
            matchNo: match.matchNo,
            matchDate: match.matchDate.toISOString(),
            status: match.status,
            matchLabel: buildMatchLabel(match),
        })),
        users,
        generatedAt: now.toISOString(),
    };
};
const selectPowerupForSeasonMatch = async (prismaClient, { seasonId, seasonUserId, chipCode, startMatchId, }) => {
    const now = new Date();
    return prismaClient.$transaction(async (tx) => {
        const [seasonUser, chipType, orderedMatches] = await Promise.all([
            getSeasonUserTx(tx, seasonUserId, seasonId),
            getChipTypeByCodeTx(tx, chipCode),
            getOrderedSeasonMatches(tx, seasonId),
        ]);
        const startMatch = orderedMatches.find((match) => match.id === startMatchId);
        if (!startMatch) {
            throw new ChipServiceError(404, "Selected match not found in this season");
        }
        if (startMatch.matchDate <= now) {
            throw new ChipServiceError(400, "Powerup selection is locked once the selected match has started");
        }
        const affectedMatches = getAffectedMatches(orderedMatches, startMatchId, chipType.effectWindowMatches);
        if (affectedMatches.length < chipType.effectWindowMatches) {
            throw new ChipServiceError(400, `${chipType.name} needs ${chipType.effectWindowMatches} consecutive matches from the selected start match`);
        }
        const existingPlayForMatch = await tx.chipPlay.findUnique({
            where: {
                seasonUserId_chipTypeId_startMatchId: {
                    seasonUserId,
                    chipTypeId: chipType.id,
                    startMatchId,
                },
            },
            include: {
                chipType: true,
            },
        });
        if (existingPlayForMatch?.status === ChipPlayStatus.SCHEDULED) {
            return serializeChipPlay({
                ...existingPlayForMatch,
                startMatch,
            }, orderedMatches, now);
        }
        const scheduledPlays = await tx.chipPlay.findMany({
            where: {
                seasonUserId,
                status: ChipPlayStatus.SCHEDULED,
                seasonUser: {
                    seasonId,
                },
            },
            include: {
                chipType: true,
            },
        });
        const activeUsageCount = await tx.chipPlay.count({
            where: {
                seasonUserId,
                chipTypeId: chipType.id,
                status: {
                    not: ChipPlayStatus.CANCELLED,
                },
            },
        });
        if (activeUsageCount >= chipType.maxUsesPerSeason) {
            throw new ChipServiceError(400, `${chipType.name} has already been used ${chipType.maxUsesPerSeason} times this season`);
        }
        if (chipType.requiresBottomHalf) {
            const standings = await getStandingsForSeason(tx, seasonId);
            const position = standings.positionBySeasonUserId.get(seasonUser.id);
            if (position === undefined ||
                !isBottomHalfPosition(position, standings.totalPlayers)) {
                throw new ChipServiceError(400, `${chipType.name} can only be selected by players in the bottom 50%`);
            }
        }
        const newAffectedMatchIds = affectedMatches.map((match) => match.id);
        for (const existingPlay of scheduledPlays) {
            const existingAffectedMatches = getAffectedMatches(orderedMatches, existingPlay.startMatchId, existingPlay.chipType.effectWindowMatches);
            const existingAffectedMatchIds = existingAffectedMatches.map((match) => match.id);
            if (hasOverlap(newAffectedMatchIds, existingAffectedMatchIds)) {
                throw new ChipServiceError(400, `Another powerup is already selected for one or more matches in this window (${existingPlay.chipType.name})`);
            }
        }
        if (existingPlayForMatch?.status === ChipPlayStatus.CANCELLED) {
            const reactivated = await tx.chipPlay.update({
                where: {
                    id: existingPlayForMatch.id,
                },
                data: {
                    status: ChipPlayStatus.SCHEDULED,
                    canceledAt: null,
                },
                include: {
                    chipType: true,
                },
            });
            return serializeChipPlay({
                ...reactivated,
                startMatch,
            }, orderedMatches, now);
        }
        const created = await tx.chipPlay.create({
            data: {
                seasonUserId,
                chipTypeId: chipType.id,
                startMatchId,
            },
            include: {
                chipType: true,
            },
        });
        return serializeChipPlay({
            ...created,
            startMatch,
        }, orderedMatches, now);
    });
};
const deselectPowerup = async (prismaClient, chipPlayId) => {
    const now = new Date();
    return prismaClient.$transaction(async (tx) => {
        const chipPlay = await tx.chipPlay.findUnique({
            where: {
                id: chipPlayId,
            },
            include: {
                chipType: true,
                startMatch: {
                    select: {
                        id: true,
                        matchNo: true,
                        matchDate: true,
                        status: true,
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
                        seasonId: true,
                    },
                },
            },
        });
        if (!chipPlay) {
            throw new ChipServiceError(404, "Powerup selection not found");
        }
        if (chipPlay.status === ChipPlayStatus.CANCELLED) {
            const orderedMatches = await getOrderedSeasonMatches(tx, chipPlay.startMatch.seasonId);
            return serializeChipPlay(chipPlay, orderedMatches, now);
        }
        if (chipPlay.startMatch.matchDate <= now) {
            throw new ChipServiceError(400, "Powerup cannot be deselected after the selected match has started");
        }
        const updatedChipPlay = await tx.chipPlay.update({
            where: {
                id: chipPlay.id,
            },
            data: {
                status: ChipPlayStatus.CANCELLED,
                canceledAt: now,
            },
            include: {
                chipType: true,
            },
        });
        const orderedMatches = await getOrderedSeasonMatches(tx, chipPlay.startMatch.seasonId);
        return serializeChipPlay({
            ...updatedChipPlay,
            startMatch: chipPlay.startMatch,
        }, orderedMatches, now);
    });
};
let ChipService = class ChipService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSeasonPowerupsOverview(seasonId) {
        return getSeasonPowerupsOverview(this.prisma.client, seasonId);
    }
    async selectPowerupForSeasonMatch(input) {
        return selectPowerupForSeasonMatch(this.prisma.client, input);
    }
    async deselectPowerup(chipPlayId) {
        return deselectPowerup(this.prisma.client, chipPlayId);
    }
    async resolveActiveChipAssignmentsForMatchTx(tx, seasonId, matchId, seasonUserIds) {
        return resolveActiveChipAssignmentsForMatchTx(tx, seasonId, matchId, seasonUserIds);
    }
};
ChipService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ChipService);
export { ChipService };
//# sourceMappingURL=chip.service.js.map