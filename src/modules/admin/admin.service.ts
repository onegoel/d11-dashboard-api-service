import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ChipCode,
  ChipPlayStatus,
  MatchStatus,
  Prisma,
} from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { ChipService } from "../chip/chip.service.js";
import { RANK_POINTS } from "../score/points-system.js";
import type {
  AddSeasonUserDto,
  BulkCreateAdminMatchesDto,
  CreateAdminMatchDto,
  CreateSeasonDto,
  DeleteAdminMatchDto,
  RemoveSeasonUserDto,
  ReassignChipPlayDto,
  ReopenMatchDto,
  ReplaceMatchScoresDto,
  ReverseChipPlayDto,
  UpdateAdminMatchDto,
  UpdateScoreRankDto,
  UpdateSeasonDto,
} from "./dto/admin.dto.js";

type PrismaExecutor = Prisma.TransactionClient;

const toAuditJson = (value: unknown): Prisma.InputJsonValue => {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
};

const isPrismaUniqueConstraintError = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return (error as { code?: unknown }).code === "P2002";
};

const getAffectedMatches = <T extends { id: string }>(
  orderedMatches: T[],
  startMatchId: string,
  windowSize: number,
) => {
  const startIndex = orderedMatches.findIndex((match) => match.id === startMatchId);

  if (startIndex < 0) {
    return [] as T[];
  }

  return orderedMatches.slice(startIndex, startIndex + Math.max(windowSize, 1));
};

const hasOverlap = (firstIds: string[], secondIds: string[]) => {
  const set = new Set(firstIds);
  return secondIds.some((id) => set.has(id));
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chipService: ChipService,
  ) {}

  private async logAction(
    tx: PrismaExecutor,
    action: string,
    entityType: string,
    entityId?: string | null,
    reason?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    const data: Prisma.AdminAuditLogCreateInput = {
      action,
      entityType,
      ...(entityId !== undefined ? { entityId } : {}),
      ...(reason !== undefined ? { reason } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
    };

    await tx.adminAuditLog.create({
      data,
    });
  }

  private async ensureTeamsExist(
    tx: PrismaExecutor,
    homeTeamId: string,
    awayTeamId: string,
  ) {
    if (homeTeamId === awayTeamId) {
      throw new BadRequestException("Home and away teams must be different");
    }

    const teams = await tx.team.findMany({
      where: {
        id: {
          in: [homeTeamId, awayTeamId],
        },
      },
      select: {
        id: true,
      },
    });

    if (teams.length !== 2) {
      throw new BadRequestException("Both teams must exist");
    }
  }

  private validateContiguousRanks(ranks: number[]) {
    const sorted = [...ranks].sort((a, b) => a - b);

    sorted.forEach((rank, index) => {
      if (rank !== index + 1) {
        throw new BadRequestException(
          "Ranks must be contiguous starting from 1 (1..N)",
        );
      }
    });
  }

  private async getOrderedSeasonMatches(tx: PrismaExecutor, seasonId: number) {
    return tx.match.findMany({
      where: { seasonId },
      select: {
        id: true,
        seasonId: true,
        matchNo: true,
        matchDate: true,
        status: true,
      },
      orderBy: [{ matchDate: "asc" }, { matchNo: "asc" }],
    });
  }

  async getAuditLogs(query: { limit?: number; entityType?: string; entityId?: string }) {
    return this.prisma.client.adminAuditLog.findMany({
      where: {
        ...(query.entityType ? { entityType: query.entityType } : {}),
        ...(query.entityId ? { entityId: query.entityId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: query.limit ?? 50,
    });
  }

  async getSeasons() {
    return this.prisma.client.season.findMany({
      orderBy: [{ year: "desc" }, { id: "desc" }],
      include: {
        winnerUser: true,
      },
    });
  }

  async getTeams() {
    return this.prisma.client.team.findMany({
      orderBy: [{ shortCode: "asc" }],
    });
  }

  async getUsers() {
    return this.prisma.client.user.findMany({
      orderBy: [{ display_name: "asc" }],
    });
  }

  async createMatch(dto: CreateAdminMatchDto) {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        await this.ensureTeamsExist(tx, dto.homeTeamId, dto.awayTeamId);

        const match = await tx.match.create({
          data: {
            seasonId: dto.seasonId,
            matchNo: dto.matchNo,
            matchDate: new Date(dto.matchDate),
            homeTeamId: dto.homeTeamId,
            awayTeamId: dto.awayTeamId,
            status: dto.status ?? MatchStatus.SCHEDULED,
          },
          include: {
            homeTeam: true,
            awayTeam: true,
            season: true,
          },
        });

        await this.logAction(tx, "match.create", "match", match.id, dto.reason, toAuditJson({
          seasonId: dto.seasonId,
          matchNo: dto.matchNo,
        }));

        return match;
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new BadRequestException(
          "A match with this season/matchNo already exists",
        );
      }

      throw error;
    }
  }

  async bulkCreateMatches(dto: BulkCreateAdminMatchesDto) {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const createdMatches = [] as Awaited<ReturnType<typeof tx.match.create>>[];

        for (const matchInput of dto.matches) {
          await this.ensureTeamsExist(tx, matchInput.homeTeamId, matchInput.awayTeamId);

          const created = await tx.match.create({
            data: {
              seasonId: matchInput.seasonId,
              matchNo: matchInput.matchNo,
              matchDate: new Date(matchInput.matchDate),
              homeTeamId: matchInput.homeTeamId,
              awayTeamId: matchInput.awayTeamId,
              status: matchInput.status ?? MatchStatus.SCHEDULED,
            },
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          });

          createdMatches.push(created);
        }

        await this.logAction(tx, "match.bulk-create", "match", undefined, dto.reason, toAuditJson({
          count: createdMatches.length,
          matchIds: createdMatches.map((match) => match.id),
        }));

        return createdMatches;
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new BadRequestException(
          "One or more matches conflict with an existing season/matchNo pair",
        );
      }

      throw error;
    }
  }

  async updateMatch(matchId: string, dto: UpdateAdminMatchDto) {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const current = await tx.match.findUnique({
          where: { id: matchId },
          select: {
            id: true,
            homeTeamId: true,
            awayTeamId: true,
          },
        });

        if (!current) {
          throw new NotFoundException("Match not found");
        }

        const nextHomeTeamId = dto.homeTeamId ?? current.homeTeamId;
        const nextAwayTeamId = dto.awayTeamId ?? current.awayTeamId;

        await this.ensureTeamsExist(tx, nextHomeTeamId, nextAwayTeamId);

        const updated = await tx.match.update({
          where: { id: matchId },
          data: {
            ...(dto.matchNo !== undefined ? { matchNo: dto.matchNo } : {}),
            ...(dto.matchDate ? { matchDate: new Date(dto.matchDate) } : {}),
            ...(dto.homeTeamId ? { homeTeamId: dto.homeTeamId } : {}),
            ...(dto.awayTeamId ? { awayTeamId: dto.awayTeamId } : {}),
            ...(dto.status ? { status: dto.status } : {}),
          },
          include: {
            homeTeam: true,
            awayTeam: true,
            season: true,
          },
        });

        await this.logAction(tx, "match.update", "match", matchId, dto.reason, toAuditJson({
          changes: dto,
        }));

        return updated;
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new BadRequestException(
          "This update conflicts with an existing season/matchNo pair",
        );
      }

      throw error;
    }
  }

  async deleteMatch(matchId: string, dto: DeleteAdminMatchDto) {
    return this.prisma.client.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          _count: {
            select: {
              scores: true,
              chipPlays: true,
              picks: true,
            },
          },
        },
      });

      if (!match) {
        throw new NotFoundException("Match not found");
      }

      const hasDependencies =
        match._count.scores > 0 || match._count.chipPlays > 0 || match._count.picks > 0;

      if (hasDependencies && !dto.force) {
        throw new BadRequestException(
          "Match has dependent scores/chip plays/picks. Retry with force=true to delete it.",
        );
      }

      if (dto.force) {
        await tx.score.deleteMany({ where: { matchId } });
        await tx.chipPlay.deleteMany({ where: { startMatchId: matchId } });
        await tx.playerPick.deleteMany({ where: { matchId } });
      }

      await tx.match.delete({ where: { id: matchId } });

      await this.logAction(tx, "match.delete", "match", matchId, dto.reason, toAuditJson({
        force: Boolean(dto.force),
      }));

      return { id: matchId, deleted: true };
    });
  }

  async reopenMatch(matchId: string, dto: ReopenMatchDto) {
    return this.prisma.client.$transaction(async (tx) => {
      const match = await tx.match.findUnique({ where: { id: matchId } });

      if (!match) {
        throw new NotFoundException("Match not found");
      }

      const status = dto.status ?? MatchStatus.LIVE;

      if (status === MatchStatus.COMPLETED) {
        throw new BadRequestException("Reopen status must be SCHEDULED or LIVE");
      }

      const updated = await tx.match.update({
        where: { id: matchId },
        data: { status },
      });

      await this.logAction(tx, "match.reopen", "match", matchId, dto.reason, toAuditJson({
        previousStatus: match.status,
        nextStatus: status,
      }));

      return updated;
    });
  }

  async replaceMatchScores(matchId: string, dto: ReplaceMatchScoresDto) {
    return this.prisma.client.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        select: { id: true, seasonId: true },
      });

      if (!match) {
        throw new NotFoundException("Match not found");
      }

      const submittedSeasonUserIds = dto.scores.map((score) => score.seasonUserId);
      const uniqueSeasonUserIds = [...new Set(submittedSeasonUserIds)];

      if (uniqueSeasonUserIds.length !== submittedSeasonUserIds.length) {
        throw new BadRequestException("Duplicate seasonUserId entries are not allowed");
      }

      this.validateContiguousRanks(dto.scores.map((score) => score.rank));

      const seasonUsers = await tx.seasonUser.findMany({
        where: {
          seasonId: match.seasonId,
          id: { in: uniqueSeasonUserIds },
        },
        select: { id: true },
      });

      if (seasonUsers.length !== uniqueSeasonUserIds.length) {
        throw new BadRequestException("Scores include players outside this season");
      }

      const activeAssignments = await this.chipService.resolveActiveChipAssignmentsForMatchTx(
        tx,
        match.seasonId,
        matchId,
        uniqueSeasonUserIds,
      );

      await tx.score.deleteMany({ where: { matchId } });

      const createdScores = await Promise.all(
        [...dto.scores]
          .sort((a, b) => a.rank - b.rank)
          .map((score) => {
            const chipAssignment = activeAssignments.get(score.seasonUserId);

            return tx.score.create({
              data: {
                seasonUserId: score.seasonUserId,
                matchId,
                rank: score.rank,
                points: RANK_POINTS[score.rank] ?? 0,
                rawScore: null,
                effectiveScore: null,
                secondaryRawScore: null,
                chipPlayId: chipAssignment?.chipPlayId ?? null,
              },
            });
          }),
      );

      await tx.match.update({
        where: { id: matchId },
        data: { status: MatchStatus.COMPLETED },
      });

      await this.logAction(tx, "score.replace", "match", matchId, dto.reason, toAuditJson({
        scoreCount: createdScores.length,
        seasonUserIds: uniqueSeasonUserIds,
      }));

      return createdScores;
    });
  }

  async updateScoreRank(scoreId: string, dto: UpdateScoreRankDto) {
    return this.prisma.client.$transaction(async (tx) => {
      const target = await tx.score.findUnique({
        where: { id: scoreId },
        select: { id: true, matchId: true, rank: true },
      });

      if (!target) {
        throw new NotFoundException("Score not found");
      }

      const scores = await tx.score.findMany({
        where: { matchId: target.matchId },
        orderBy: { rank: "asc" },
      });

      if (dto.rank > scores.length) {
        throw new BadRequestException(`Rank must be between 1 and ${scores.length}`);
      }

      const nextScores = scores.map((score) => {
        if (score.id === target.id) {
          return { ...score, rank: dto.rank, points: RANK_POINTS[dto.rank] ?? 0 };
        }

        let nextRank = score.rank;

        if (dto.rank < target.rank && score.rank >= dto.rank && score.rank < target.rank) {
          nextRank = score.rank + 1;
        }

        if (dto.rank > target.rank && score.rank <= dto.rank && score.rank > target.rank) {
          nextRank = score.rank - 1;
        }

        return {
          ...score,
          rank: nextRank,
          points: RANK_POINTS[nextRank] ?? 0,
        };
      });

      await Promise.all(
        nextScores.map((score) =>
          tx.score.update({
            where: { id: score.id },
            data: {
              rank: score.rank,
              points: score.points,
            },
          }),
        ),
      );

      await this.logAction(tx, "score.update-rank", "score", scoreId, dto.reason, toAuditJson({
        matchId: target.matchId,
        previousRank: target.rank,
        nextRank: dto.rank,
      }));

      return tx.score.findMany({
        where: { matchId: target.matchId },
        orderBy: { rank: "asc" },
      });
    });
  }

  async deleteScore(scoreId: string, reason?: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const target = await tx.score.findUnique({
        where: { id: scoreId },
        select: { id: true, matchId: true, rank: true },
      });

      if (!target) {
        throw new NotFoundException("Score not found");
      }

      const scores = await tx.score.findMany({
        where: { matchId: target.matchId },
        orderBy: { rank: "asc" },
      });

      await tx.score.delete({ where: { id: scoreId } });

      const remainingScores = scores
        .filter((score) => score.id !== scoreId)
        .map((score, index) => ({
          ...score,
          rank: index + 1,
          points: RANK_POINTS[index + 1] ?? 0,
        }));

      await Promise.all(
        remainingScores.map((score) =>
          tx.score.update({
            where: { id: score.id },
            data: {
              rank: score.rank,
              points: score.points,
            },
          }),
        ),
      );

      if (remainingScores.length === 0) {
        await tx.match.update({
          where: { id: target.matchId },
          data: { status: MatchStatus.SCHEDULED },
        });
      }

      await this.logAction(tx, "score.delete", "score", scoreId, reason, toAuditJson({
        matchId: target.matchId,
        deletedRank: target.rank,
      }));

      return {
        deleted: true,
        scoreId,
        matchId: target.matchId,
      };
    });
  }

  async reverseChipPlay(chipPlayId: string, dto: ReverseChipPlayDto) {
    return this.prisma.client.$transaction(async (tx) => {
      const chipPlay = await tx.chipPlay.findUnique({
        where: { id: chipPlayId },
        include: {
          chipType: true,
          startMatch: {
            select: {
              seasonId: true,
            },
          },
        },
      });

      if (!chipPlay) {
        throw new NotFoundException("Chip play not found");
      }

      const updated = await tx.chipPlay.update({
        where: { id: chipPlayId },
        data: {
          status: ChipPlayStatus.CANCELLED,
          canceledAt: new Date(),
        },
      });

      await tx.score.updateMany({
        where: { chipPlayId },
        data: { chipPlayId: null },
      });

      await this.logAction(tx, "chip.reverse", "chipPlay", chipPlayId, dto.reason, toAuditJson({
        chipCode: chipPlay.chipType.code,
        seasonUserId: chipPlay.seasonUserId,
        startMatchId: chipPlay.startMatchId,
      }));

      return updated;
    });
  }

  async reassignChipPlay(chipPlayId: string, dto: ReassignChipPlayDto) {
    return this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.chipPlay.findUnique({
        where: { id: chipPlayId },
        include: {
          chipType: true,
          seasonUser: {
            select: {
              seasonId: true,
            },
          },
          startMatch: {
            select: {
              id: true,
              seasonId: true,
            },
          },
        },
      });

      if (!existing) {
        throw new NotFoundException("Chip play not found");
      }

      const seasonId = existing.seasonUser.seasonId;
      const targetSeasonUserId = dto.seasonUserId ?? existing.seasonUserId;
      const targetChipCode = dto.chipCode ?? existing.chipType.code;
      const targetStartMatchId = dto.startMatchId ?? existing.startMatchId;

      const [targetSeasonUser, targetStartMatch, targetChipType, orderedMatches, otherScheduledPlays] = await Promise.all([
        tx.seasonUser.findUnique({
          where: { id: targetSeasonUserId },
          select: { id: true, seasonId: true },
        }),
        tx.match.findUnique({
          where: { id: targetStartMatchId },
          select: { id: true, seasonId: true },
        }),
        tx.chipType.findUnique({
          where: { code: targetChipCode },
        }),
        this.getOrderedSeasonMatches(tx, seasonId),
        tx.chipPlay.findMany({
          where: {
            seasonUserId: targetSeasonUserId,
            status: ChipPlayStatus.SCHEDULED,
            id: { not: chipPlayId },
          },
          include: { chipType: true },
        }),
      ]);

      if (!targetSeasonUser || targetSeasonUser.seasonId !== seasonId) {
        throw new BadRequestException("Target season user is not part of this season");
      }

      if (!targetStartMatch || targetStartMatch.seasonId !== seasonId) {
        throw new BadRequestException("Target start match is not part of this season");
      }

      if (!targetChipType) {
        throw new NotFoundException("Target chip type not found");
      }

      const newAffectedMatchIds = getAffectedMatches(
        orderedMatches,
        targetStartMatchId,
        targetChipType.effectWindowMatches,
      ).map((match) => match.id);

      for (const scheduledPlay of otherScheduledPlays) {
        const existingAffectedIds = getAffectedMatches(
          orderedMatches,
          scheduledPlay.startMatchId,
          scheduledPlay.chipType.effectWindowMatches,
        ).map((match) => match.id);

        if (hasOverlap(newAffectedMatchIds, existingAffectedIds)) {
          throw new BadRequestException(
            "Target chip assignment overlaps with another scheduled powerup for this player",
          );
        }
      }

      await tx.chipPlay.update({
        where: { id: chipPlayId },
        data: {
          status: ChipPlayStatus.CANCELLED,
          canceledAt: new Date(),
        },
      });

      await tx.score.updateMany({
        where: { chipPlayId },
        data: { chipPlayId: null },
      });

      const existingTargetPlay = await tx.chipPlay.findUnique({
        where: {
          seasonUserId_chipTypeId_startMatchId: {
            seasonUserId: targetSeasonUserId,
            chipTypeId: targetChipType.id,
            startMatchId: targetStartMatchId,
          },
        },
      });

      const replacement = existingTargetPlay
        ? await tx.chipPlay.update({
            where: { id: existingTargetPlay.id },
            data: {
              status: ChipPlayStatus.SCHEDULED,
              canceledAt: null,
            },
          })
        : await tx.chipPlay.create({
            data: {
              seasonUserId: targetSeasonUserId,
              chipTypeId: targetChipType.id,
              startMatchId: targetStartMatchId,
              status: ChipPlayStatus.SCHEDULED,
            },
          });

      const completedAffectedMatchIds = orderedMatches
        .filter((match) => match.status === MatchStatus.COMPLETED)
        .filter((match) => newAffectedMatchIds.includes(match.id))
        .map((match) => match.id);

      if (completedAffectedMatchIds.length > 0) {
        await tx.score.updateMany({
          where: {
            seasonUserId: targetSeasonUserId,
            matchId: {
              in: completedAffectedMatchIds,
            },
          },
          data: {
            chipPlayId: replacement.id,
          },
        });
      }

      await this.logAction(tx, "chip.reassign", "chipPlay", chipPlayId, dto.reason, toAuditJson({
        replacementChipPlayId: replacement.id,
        targetSeasonUserId,
        targetChipCode,
        targetStartMatchId,
      }));

      return {
        cancelledChipPlayId: chipPlayId,
        replacementChipPlayId: replacement.id,
      };
    });
  }

  async addSeasonUser(seasonId: number, dto: AddSeasonUserDto) {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: dto.userId } });

        if (!user) {
          throw new NotFoundException("User not found");
        }

        const seasonUser = await tx.seasonUser.upsert({
          where: {
            seasonId_userId: {
              seasonId,
              userId: dto.userId,
            },
          },
          update: {
            ...(dto.teamName ? { teamName: dto.teamName } : {}),
          },
          create: {
            seasonId,
            userId: dto.userId,
            teamName: dto.teamName ?? `${user.display_name}'s Team`,
          },
          include: {
            user: true,
            season: true,
          },
        });

        await this.logAction(tx, "season-user.add", "seasonUser", seasonUser.id, dto.reason, toAuditJson({
          seasonId,
          userId: dto.userId,
        }));

        return seasonUser;
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new BadRequestException("This user is already registered in the season");
      }

      throw error;
    }
  }

  async removeSeasonUser(seasonUserId: string, dto: RemoveSeasonUserDto) {
    return this.prisma.client.$transaction(async (tx) => {
      const seasonUser = await tx.seasonUser.findUnique({
        where: { id: seasonUserId },
        include: {
          _count: {
            select: {
              scores: true,
              chipPlays: true,
              playerPicks: true,
            },
          },
        },
      });

      if (!seasonUser) {
        throw new NotFoundException("Season user not found");
      }

      const hasDependencies =
        seasonUser._count.scores > 0 ||
        seasonUser._count.chipPlays > 0 ||
        seasonUser._count.playerPicks > 0;

      if (hasDependencies && !dto.force) {
        throw new BadRequestException(
          "Season user has scores/chip plays/picks. Retry with force=true to remove them.",
        );
      }

      if (dto.force) {
        await tx.score.deleteMany({ where: { seasonUserId } });
        await tx.chipPlay.deleteMany({ where: { seasonUserId } });
        await tx.playerPick.deleteMany({ where: { seasonUserId } });
      }

      await tx.seasonUser.delete({ where: { id: seasonUserId } });

      await this.logAction(tx, "season-user.remove", "seasonUser", seasonUserId, dto.reason, toAuditJson({
        force: Boolean(dto.force),
      }));

      return { id: seasonUserId, deleted: true };
    });
  }

  async createSeason(dto: CreateSeasonDto) {
    return this.prisma.client.$transaction(async (tx) => {
      if (dto.isActive) {
        await tx.season.updateMany({ data: { isActive: false } });
      }

      const season = await tx.season.create({
        data: {
          name: dto.name,
          year: dto.year,
          isActive: dto.isActive ?? true,
          ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
          ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
          ...(dto.winnerUserId !== undefined ? { winnerUserId: dto.winnerUserId } : {}),
        },
      });

      await this.logAction(tx, "season.create", "season", String(season.id), dto.reason, toAuditJson({
        year: dto.year,
        isActive: season.isActive,
      }));

      return season;
    });
  }

  async updateSeason(seasonId: number, dto: UpdateSeasonDto) {
    return this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.season.findUnique({ where: { id: seasonId } });

      if (!existing) {
        throw new NotFoundException("Season not found");
      }

      if (dto.isActive) {
        await tx.season.updateMany({
          where: {
            id: { not: seasonId },
          },
          data: { isActive: false },
        });
      }

      const updated = await tx.season.update({
        where: { id: seasonId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.year !== undefined ? { year: dto.year } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          ...(dto.startDate !== undefined ? { startDate: new Date(dto.startDate) } : {}),
          ...(dto.endDate !== undefined ? { endDate: new Date(dto.endDate) } : {}),
          ...(dto.winnerUserId !== undefined ? { winnerUserId: dto.winnerUserId } : {}),
        },
      });

      await this.logAction(tx, "season.update", "season", String(seasonId), dto.reason, toAuditJson({
        changes: dto,
      }));

      return updated;
    });
  }
}