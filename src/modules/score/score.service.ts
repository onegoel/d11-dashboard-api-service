import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MatchStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { ChipService } from "../chip/chip.service.js";
import { RANK_POINTS } from "./points-system.js";

export interface MatchScore {
  seasonUserId: string;
  rank: number;
  points?: number;
}

@Injectable()
export class ScoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chipService: ChipService,
  ) {}

  async getMatchScores(matchId: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        select: {
          id: true,
          seasonId: true,
        },
      });

      if (!match) {
        throw new NotFoundException("Match not found");
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
        this.chipService.resolveActiveChipAssignmentsForMatchTx(
          tx,
          match.seasonId,
          matchId,
        ),
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
  }

  async submitMatchScoresBulk(
    matchId: string,
    scores: MatchScore[],
    updatedByUserId: number,
  ) {
    return this.prisma.client.$transaction(async (tx) => {
      if (scores.length === 0) {
        throw new BadRequestException("At least one score entry is required");
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
        throw new NotFoundException("Match not found");
      }

      const submittedSeasonUserIds = scores.map((score) => score.seasonUserId);
      const uniqueSeasonUserIds = [...new Set(submittedSeasonUserIds)];

      if (uniqueSeasonUserIds.length !== submittedSeasonUserIds.length) {
        throw new BadRequestException(
          "Duplicate seasonUserId entries are not allowed",
        );
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
        throw new BadRequestException("Scores include players outside this season");
      }

      const activeAssignments =
        await this.chipService.resolveActiveChipAssignmentsForMatchTx(
          tx,
          match.seasonId,
          matchId,
          uniqueSeasonUserIds,
        );

      const seenRanks = new Set<number>();

      const rankedScores = [...scores]
        .map((score) => {
          if (!Number.isInteger(score.rank) || score.rank <= 0) {
            throw new BadRequestException(
              `Invalid rank for season user ${score.seasonUserId}`,
            );
          }

          if (seenRanks.has(score.rank)) {
            throw new BadRequestException("Duplicate ranks are not allowed");
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
        data: {
          status: MatchStatus.COMPLETED,
          updatedByUserId,
        },
      });

      return submittedScores;
    });
  }
}
