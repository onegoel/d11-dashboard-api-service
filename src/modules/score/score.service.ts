import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ChipCode,
  ChipPlayStatus,
  MatchResult,
  MatchStatus,
  Prisma,
} from "../../../generated/prisma/client.js";
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
    if (matchResult !== MatchResult.HOME_WIN && matchResult !== MatchResult.AWAY_WIN) {
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

      const startIndex = orderedMatches.findIndex((m) => m.id === play.startMatchId);

      if (startIndex < 0) {
        continue;
      }

      const teamMatches = orderedMatches
        .slice(startIndex)
        .filter(
          (m) =>
            ScoreService.isRegularSeasonMatch(m.matchNo) &&
            (m.homeTeamId === selectedTeamId || m.awayTeamId === selectedTeamId),
        );

      if (teamMatches.length === 0) {
        continue;
      }

      const effectiveWindow: typeof teamMatches = [];

      if (teamMatches.length <= ScoreService.TEAM_FORM_WINDOW) {
        effectiveWindow.push(...teamMatches.slice(0, ScoreService.TEAM_FORM_WINDOW));
      } else {
        for (const teamMatch of teamMatches) {
          if (teamMatch.matchResult === MatchResult.ABANDONED) {
            continue;
          }

          effectiveWindow.push(teamMatch);

          if (effectiveWindow.length >= ScoreService.TEAM_FORM_WINDOW) {
            break;
          }
        }
      }

      const activeOnTargetMatch = effectiveWindow.some((m) => m.id === matchId);

      if (!activeOnTargetMatch) {
        continue;
      }

      const isSelectedTeamWinner =
        (matchResult === MatchResult.HOME_WIN && targetMatch.homeTeamId === selectedTeamId) ||
        (matchResult === MatchResult.AWAY_WIN && targetMatch.awayTeamId === selectedTeamId);

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
    return this.prisma.client.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
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
    });
  }

  async submitMatchScoresBulk(
    matchId: string,
    scores: MatchScore[],
    matchResult: MatchResult,
    updatedByUserId: number,
  ) {
    return this.prisma.client.$transaction(async (tx) => {
      if (scores.length === 0 && matchResult !== MatchResult.ABANDONED) {
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

      if (matchResult === MatchResult.ABANDONED) {
        await tx.score.deleteMany({ where: { matchId } });

        await tx.match.update({
          where: { id: matchId },
          data: {
            status: MatchStatus.COMPLETED,
            matchResult,
            updatedByUserId,
          },
        });

        return [];
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

      const teamFormBonusBySeasonUserId = await this.getTeamFormBonusBySeasonUserId(
        tx,
        match.seasonId,
        matchId,
        matchResult,
      );

      const adjustedScores = rankedScores.map((score) => ({
        ...score,
        points: score.points + (teamFormBonusBySeasonUserId.get(score.seasonUserId) ?? 0),
      }));

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
        adjustedScores.map((score) =>
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
          matchResult,
          updatedByUserId,
        },
      });

      return submittedScores;
    });
  }
}
