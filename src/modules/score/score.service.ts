import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  ChipCode,
  ChipPlayStatus,
  MatchResult,
  MatchStatus,
  Prisma,
} from "../../../generated/prisma/client.js";
import type { Score } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { ChipService } from "../chip/chip.service.js";
import { RANK_POINTS } from "./points-system.js";

interface MatchScore {
  seasonUserId: string;
  rank: number;
  points?: number;
  rawScore?: number | null;
  effectiveScore?: number | null;
  secondaryRawScore?: number | null;
}

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chipService: ChipService,
  ) {}

  private static readonly TEAM_FORM_WINDOW = 3;
  private static readonly TEAM_FORM_WIN_BONUS = 5;
  private static readonly TEAM_FORM_LOSS_PENALTY = -2;
  private static readonly REGULAR_SEASON_MATCH_COUNT = parseInt(
    process.env.REGULAR_SEASON_MATCH_COUNT ?? "70",
    10,
  );

  private static isRegularSeasonMatch(matchNo: number) {
    return matchNo <= ScoreService.REGULAR_SEASON_MATCH_COUNT;
  }

  private async getTeamFormBonusBySeasonUserId(
    tx: Prisma.TransactionClient,
    seasonId: number,
    matchId: string,
    matchResult: MatchResult,
  ) {
    if (
      matchResult !== MatchResult.HOME_WIN &&
      matchResult !== MatchResult.AWAY_WIN
    ) {
      return new Map<string, number>();
    }

    const [targetMatch, orderedMatches, teamFormPlays] = await Promise.all([
      tx.match.findUnique({
        where: { id: matchId },
        select: {
          id: true,
          matchNo: true,
          homeTeamId: true,
          awayTeamId: true,
        },
      }),
      tx.match.findMany({
        where: { seasonId },
        select: {
          id: true,
          matchNo: true,
          matchResult: true,
          homeTeamId: true,
          awayTeamId: true,
        },
        orderBy: [{ matchDate: "asc" }, { matchNo: "asc" }],
      }),
      tx.chipPlay.findMany({
        where: {
          status: ChipPlayStatus.SCHEDULED,
          selectedTeamId: { not: null },
          seasonUser: { seasonId },
          chipType: { code: ChipCode.TEAM_FORM },
        },
        select: {
          seasonUserId: true,
          startMatchId: true,
          selectedTeamId: true,
        },
      }),
    ]);

    if (!targetMatch) {
      throw new NotFoundException("Match not found");
    }

    const bonusByUser = new Map<string, number>();

    for (const play of teamFormPlays) {
      const selectedTeamId = play.selectedTeamId;

      if (!selectedTeamId) {
        continue;
      }

      const startIndex = orderedMatches.findIndex(
        (m) => m.id === play.startMatchId,
      );

      if (startIndex < 0) {
        continue;
      }

      const teamMatches = orderedMatches
        .slice(startIndex)
        .filter(
          (m) =>
            ScoreService.isRegularSeasonMatch(m.matchNo) &&
            (m.homeTeamId === selectedTeamId ||
              m.awayTeamId === selectedTeamId),
        );

      if (teamMatches.length === 0) {
        continue;
      }

      const effectiveWindow: typeof teamMatches = [];

      for (const teamMatch of teamMatches) {
        if (teamMatch.matchResult === MatchResult.ABANDONED) {
          continue;
        }

        effectiveWindow.push(teamMatch);

        if (effectiveWindow.length >= ScoreService.TEAM_FORM_WINDOW) {
          break;
        }
      }

      const activeOnTargetMatch = effectiveWindow.some((m) => m.id === matchId);

      if (!activeOnTargetMatch) {
        continue;
      }

      const isSelectedTeamWinner =
        (matchResult === MatchResult.HOME_WIN &&
          targetMatch.homeTeamId === selectedTeamId) ||
        (matchResult === MatchResult.AWAY_WIN &&
          targetMatch.awayTeamId === selectedTeamId);

      bonusByUser.set(
        play.seasonUserId,
        isSelectedTeamWinner
          ? ScoreService.TEAM_FORM_WIN_BONUS
          : ScoreService.TEAM_FORM_LOSS_PENALTY,
      );
    }

    return bonusByUser;
  }

  async getMatchScores(matchId: string) {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        seasonId: true,
        matchResult: true,
      },
    });

    if (!match) {
      throw new NotFoundException("Match not found");
    }

    const [scores, activeAssignments] = await Promise.all([
      this.prisma.client.score.findMany({
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
        this.prisma.client,
        match.seasonId!,
        matchId,
      ),
    ]);

    return {
      matchResult: match.matchResult,
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
  }

  async submitMatchScoresBulk(
    matchId: string,
    scores: MatchScore[],
    matchResult: MatchResult,
    updatedByUserId?: number,
  ) {
    if (scores.length === 0 && matchResult !== MatchResult.ABANDONED) {
      throw new BadRequestException("At least one score entry is required");
    }

    const match = await this.prisma.client.match.findUnique({
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

    if (matchResult === MatchResult.ABANDONED) {
      await this.prisma.client.$transaction([
        this.prisma.client.score.deleteMany({ where: { matchId } }),
        this.prisma.client.match.update({
          where: { id: matchId },
          data: {
            status: MatchStatus.COMPLETED,
            matchResult,
            ...(updatedByUserId != null ? { updatedByUserId } : {}),
          },
        }),
      ]);

      return [];
    }

    const submittedSeasonUserIds = scores.map((score) => score.seasonUserId);
    const uniqueSeasonUserIds = [...new Set(submittedSeasonUserIds)];

    if (uniqueSeasonUserIds.length !== submittedSeasonUserIds.length) {
      throw new BadRequestException(
        "Duplicate seasonUserId entries are not allowed",
      );
    }

    const seasonUsers = await this.prisma.client.seasonUser.findMany({
      where: {
        id: {
          in: uniqueSeasonUserIds,
        },
        ...(match.seasonId !== null ? { seasonId: match.seasonId } : {}),
      },
      select: {
        id: true,
      },
    });

    if (seasonUsers.length !== uniqueSeasonUserIds.length) {
      throw new BadRequestException(
        "Scores include players outside this season",
      );
    }

    const activeAssignments =
      await this.chipService.resolveActiveChipAssignmentsForMatchTx(
        this.prisma.client,
        match.seasonId!,
        matchId,
        uniqueSeasonUserIds,
      );

    const rankPointsForRange = (startRank: number, size: number) => {
      if (size <= 0) return 0;
      let sum = 0;
      for (let r = startRank; r < startRank + size; r += 1) {
        sum += RANK_POINTS[r] ?? 0;
      }
      return sum / size;
    };

    const sortedScores = [...scores]
      .map((score) => {
        if (!Number.isInteger(score.rank) || score.rank <= 0) {
          throw new BadRequestException(
            `Invalid rank for season user ${score.seasonUserId}`,
          );
        }
        return score;
      })
      .sort((a, b) => a.rank - b.rank);

    const tieSizeByRank = new Map<number, number>();
    for (const score of sortedScores) {
      tieSizeByRank.set(score.rank, (tieSizeByRank.get(score.rank) ?? 0) + 1);
    }

    const rankedScores = sortedScores.map((score) => {
      const chipAssignment = activeAssignments.get(score.seasonUserId);
      const tieSize = tieSizeByRank.get(score.rank) ?? 1;

      return {
        seasonUserId: score.seasonUserId,
        rank: score.rank,
        points: rankPointsForRange(score.rank, tieSize),
        rawScore: score.rawScore ?? null,
        effectiveScore: score.effectiveScore ?? null,
        secondaryRawScore: score.secondaryRawScore ?? null,
        chipPlayId: chipAssignment?.chipPlayId ?? null,
      };
    });

    const teamFormBonusBySeasonUserId =
      await this.getTeamFormBonusBySeasonUserId(
        this.prisma.client,
        match.seasonId!,
        matchId,
        matchResult,
      );

    const adjustedScores = rankedScores.map((score) => ({
      ...score,
      points:
        score.points +
        (teamFormBonusBySeasonUserId.get(score.seasonUserId) ?? 0),
    }));

    const scoreUpserts = adjustedScores.map((score) =>
      this.prisma.client.score.upsert({
        where: {
          seasonUserId_matchId: {
            seasonUserId: score.seasonUserId,
            matchId,
          },
        },
        update: {
          points: score.points,
          rank: score.rank,
          rawScore: score.rawScore,
          effectiveScore: score.effectiveScore,
          secondaryRawScore: score.secondaryRawScore,
          chipPlayId: score.chipPlayId,
        },
        create: {
          seasonUserId: score.seasonUserId,
          matchId,
          points: score.points,
          rank: score.rank,
          rawScore: score.rawScore,
          effectiveScore: score.effectiveScore,
          secondaryRawScore: score.secondaryRawScore,
          chipPlayId: score.chipPlayId,
        },
      }),
    );

    const transactionResults = await this.prisma.client.$transaction([
      this.prisma.client.score.deleteMany({
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
      }),
      ...scoreUpserts,
      this.prisma.client.match.update({
        where: { id: matchId },
        data: {
          status: MatchStatus.COMPLETED,
          matchResult,
          ...(updatedByUserId != null ? { updatedByUserId } : {}),
        },
      }),
    ]);

    this.logger.log(
      `[AUDIT] submitMatchScoresBulk matchId=${matchId} result=${matchResult} rows=${adjustedScores.length} ` +
        adjustedScores
          .map(
            (s) =>
              `[su=${s.seasonUserId} rank=${s.rank} pts=${s.points} raw=${s.rawScore ?? "-"} eff=${s.effectiveScore ?? "-"}${
                s.chipPlayId ? ` chip=${s.chipPlayId}` : ""
              }]`,
          )
          .join(" "),
    );

    return transactionResults.slice(1, 1 + scoreUpserts.length) as Score[];
  }
}
