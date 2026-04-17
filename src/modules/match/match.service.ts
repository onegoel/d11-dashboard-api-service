import { Injectable, NotFoundException } from "@nestjs/common";
import { MatchResult, MatchStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { isPrismaRecordNotFoundError } from "../../common/errors/prisma-error.utils.js";
import type { WisdenScorecardResponse } from "../../common/types/wisden.types.js";
import { withDerivedMatchResult } from "../liveScore/wisden-match-result.util.js";

type GetSeasonMatchesOptions = {
  status?: MatchStatus;
};

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatchById(matchId: string) {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true },
    });

    if (!match) {
      throw new NotFoundException(`No match found for id ${matchId}`);
    }

    if (match.status === MatchStatus.COMPLETED && match.wisdenScore) {
      const derived = withDerivedMatchResult(
        match.wisdenScore as WisdenScorecardResponse,
      );
      const resultText = derived.scorecard.match_result ?? null;
      const shouldUpdateResultText =
        resultText !== null && resultText !== match.matchResultText;
      const shouldUpdateOutcome =
        match.matchResult === MatchResult.PENDING &&
        derived.outcome !== MatchResult.PENDING;
      const shouldUpdateStatus = match.wisdenStatus === null;

      if (shouldUpdateResultText || shouldUpdateOutcome || shouldUpdateStatus) {
        return this.prisma.client.match.update({
          where: { id: matchId },
          data: {
            ...(shouldUpdateResultText ? { matchResultText: resultText } : {}),
            ...(shouldUpdateStatus
              ? {
                  wisdenStatus:
                    match.wisdenStatus ??
                    derived.scorecard.match_status ??
                    "complete",
                  wisdenLastSyncedAt: new Date(),
                }
              : {}),
            ...(shouldUpdateOutcome ? { matchResult: derived.outcome } : {}),
          },
          include: { homeTeam: true, awayTeam: true },
        });
      }
    }

    return match;
  }

  async getSeasonMatches(
    seasonId: number,
    options: GetSeasonMatchesOptions = {},
  ) {
    return this.prisma.client.match.findMany({
      where: {
        seasonId,
        ...(options.status ? { status: options.status } : {}),
      },
      orderBy: { matchDate: "asc" },
      include: {
        homeTeam: true,
        awayTeam: true,
        updatedByUser: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });
  }

  async updateMatchStatus(matchId: string, status: MatchStatus) {
    try {
      return await this.prisma.client.match.update({
        where: { id: matchId },
        data: { status },
        include: {
          homeTeam: true,
          awayTeam: true,
          updatedByUser: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
      });
    } catch (error) {
      if (isPrismaRecordNotFoundError(error)) {
        throw new NotFoundException("Match not found");
      }

      throw error;
    }
  }

  async getMatchByWisdenGid(wisdenMatchGid: string) {
    const match = await this.prisma.client.match.findFirst({
      where: { wisdenMatchGid },
      include: { homeTeam: true, awayTeam: true },
    });
    if (!match) {
      throw new NotFoundException(
        `No match found for Wisden gid ${wisdenMatchGid}`,
      );
    }
    return match;
  }
}
