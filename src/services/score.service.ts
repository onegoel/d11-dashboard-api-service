import { prisma } from "../../prisma/client.js";
import { MatchStatus } from "../../generated/prisma/client.js";

export interface MatchScore {
    seasonUserId: string;
    points: number;
    rank: number;
}

const submitMatchScoresBulk = async (matchId: string, scores: MatchScore[]) => {
    return prisma.$transaction(async (tx) => {
        const submittedSeasonUserIds = scores.map((score) => score.seasonUserId);

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
            scores.map((score) =>
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
                    },
                    create: {
                        seasonUserId: score.seasonUserId,
                        matchId,
                        points: score.points,
                        rank: score.rank,
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
    submitMatchScoresBulk,
};
