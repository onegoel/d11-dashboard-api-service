import { prisma } from "../../prisma/client.js";
import { MatchStatus } from "../../generated/prisma/client.js";
import {
    resolveActiveChipAssignmentsForMatchTx,
} from "./chip.service.js";
import { RANK_POINTS } from "./points-system.js";

export interface MatchScore {
    seasonUserId: string;
    rank: number;
    points?: number;
}

const getMatchScores = async (matchId: string) => {
    return prisma.$transaction(async (tx) => {
        const match = await tx.match.findUnique({
            where: { id: matchId },
            select: {
                id: true,
                seasonId: true,
            },
        });

        if (!match) {
            throw new Error("Match not found");
        }

        const [scores, activeAssignments] = await Promise.all([
            tx.score.findMany({
                where: { matchId },
                orderBy: { rank: "asc" },
                select: {
                    matchId: true,
                    seasonUserId: true,
                    points: true,
                    rank: true,
                    chipPlayId: true,
                    chipPlay: {
                        select: {
                            chipType: {
                                select: {
                                    code: true,
                                },
                            },
                        },
                    },
                },
            }),
            resolveActiveChipAssignmentsForMatchTx(tx, match.seasonId, matchId),
        ]);

        return {
            scores: scores.map((score) => ({
                matchId: score.matchId,
                seasonUserId: score.seasonUserId,
                points: score.points,
                rank: score.rank,
                chipPlayId: score.chipPlayId,
                chipCode: score.chipPlay?.chipType.code ?? null,
            })),
            chipAssignments: Array.from(activeAssignments.values())
                .map((assignment) => ({
                    seasonUserId: assignment.seasonUserId,
                    chipPlayId: assignment.chipPlayId,
                    chipCode: assignment.chipCode,
                    chipName: assignment.chipName,
                    chipShortCode: assignment.chipShortCode,
                    multiplier: assignment.multiplier,
                    windowSize: assignment.windowSize,
                    windowIndex: assignment.windowIndex,
                    usesSecondaryTeamScore: assignment.usesSecondaryTeamScore,
                    startMatchId: assignment.startMatchId,
                    startMatchNo: assignment.startMatchNo,
                }))
                .sort((a, b) => a.seasonUserId.localeCompare(b.seasonUserId)),
        };
    });
};

const submitMatchScoresBulk = async (matchId: string, scores: MatchScore[]) => {
    return prisma.$transaction(async (tx) => {
        if (scores.length === 0) {
            throw new Error("At least one score entry is required");
        }

        const match = await tx.match.findUnique({
            where: {
                id: matchId,
            },
            select: {
                id: true,
                seasonId: true,
            },
        });

        if (!match) {
            throw new Error("Match not found");
        }

        const submittedSeasonUserIds = scores.map((score) => score.seasonUserId);
        const uniqueSeasonUserIds = [...new Set(submittedSeasonUserIds)];

        if (uniqueSeasonUserIds.length !== submittedSeasonUserIds.length) {
            throw new Error("Duplicate seasonUserId entries are not allowed");
        }

        const seasonUsers = await tx.seasonUser.findMany({
            where: {
                id: {
                    in: uniqueSeasonUserIds,
                },
                seasonId: match.seasonId,
            },
            select: {
                id: true,
            },
        });

        if (seasonUsers.length !== uniqueSeasonUserIds.length) {
            throw new Error("Scores include players outside this season");
        }

        const activeAssignments = await resolveActiveChipAssignmentsForMatchTx(
            tx,
            match.seasonId,
            matchId,
            uniqueSeasonUserIds,
        );

        const seenRanks = new Set<number>();

        const rankedScores = [...scores]
            .map((score) => {
                if (!Number.isInteger(score.rank) || score.rank <= 0) {
                    throw new Error(
                        `Invalid rank for season user ${score.seasonUserId}`,
                    );
                }

                if (seenRanks.has(score.rank)) {
                    throw new Error("Duplicate ranks are not allowed");
                }

                seenRanks.add(score.rank);

                return score;
            })
            .sort((a, b) => a.rank - b.rank)
            .map((score) => {
                const chipAssignment = activeAssignments.get(score.seasonUserId);

                return {
                    seasonUserId: score.seasonUserId,
                    rank: score.rank,
                    points: RANK_POINTS[score.rank] ?? 0,
                    chipPlayId: chipAssignment?.chipPlayId ?? null,
                };
            });

        await tx.score.deleteMany({
            where: {
                matchId,
                ...(submittedSeasonUserIds.length > 0
                    ? {
                          seasonUserId: {
                              notIn: submittedSeasonUserIds,
                          },
                      }
                    : {}),
            },
        });

        const submittedScores = await Promise.all(
            rankedScores.map((score) =>
                tx.score.upsert({
                    where: {
                        seasonUserId_matchId: {
                            seasonUserId: score.seasonUserId,
                            matchId,
                        },
                    },
                    update: {
                        points: score.points,
                        rank: score.rank,
                        rawScore: null,
                        effectiveScore: null,
                        secondaryRawScore: null,
                        chipPlayId: score.chipPlayId,
                    },
                    create: {
                        seasonUserId: score.seasonUserId,
                        matchId,
                        points: score.points,
                        rank: score.rank,
                        rawScore: null,
                        effectiveScore: null,
                        secondaryRawScore: null,
                        chipPlayId: score.chipPlayId,
                    },
                }),
            ),
        );

        await tx.match.update({
            where: { id: matchId },
            data: { status: MatchStatus.COMPLETED },
        });

        return submittedScores;
    });
};

export const scoresService = {
    getMatchScores,
    submitMatchScoresBulk,
};
