import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { MatchResult, MatchStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { isPrismaRecordNotFoundError } from "../../common/errors/prisma-error.utils.js";
import { CRICAPI_POLLING } from "../cricapi/cricapi.polling-config.js";
import {
  CRICAPI_ENABLE_MOCK_SCORE_FALLBACK,
  CRICAPI_USE_MOCK_SCORE,
} from "../cricapi/cricapi.source-config.js";
import { CricapiService } from "../cricapi/cricapi.service.js";
import type { GetMatchScoreResponseDto } from "./dto/get-match-score-response.dto.js";

type GetSeasonMatchesOptions = {
  status?: MatchStatus;
};

type MatchScoreSnapshotRow = {
  id: string;
  status: MatchStatus;
  matchResult: MatchResult;
  cricApiMatchId: string | null;
  cricApiStatus: string | null;
  cricApiScore: unknown;
  cricApiLastSyncedAt: Date | null;
};

@Injectable()
export class MatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cricapiService: CricapiService,
  ) {}

  async syncMatchScore(matchId: string): Promise<GetMatchScoreResponseDto> {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
      },
    });

    if (!match) {
      throw new NotFoundException("Match not found");
    }

    if (!match.cricApiMatchId) {
      throw new BadRequestException(
        "Match is not linked to CricAPI. Missing cricApiMatchId.",
      );
    }

    const matchInfo = await this.cricapiService.getMatchInfo(
      match.cricApiMatchId,
    );
    const score = (matchInfo.data.score ?? []).map((inning) => ({
      r: inning.r,
      w: inning.w,
      o: inning.o,
      inning: inning.inning,
    })) as InputJsonValue;

    const nextStatus: MatchStatus = matchInfo.data.matchEnded
      ? MatchStatus.COMPLETED
      : matchInfo.data.matchStarted
        ? MatchStatus.LIVE
        : MatchStatus.SCHEDULED;

    const nextResult = this.deriveMatchResult(
      matchInfo.data.matchWinner,
      match.homeTeam.name,
      match.awayTeam.name,
      matchInfo.data.matchEnded,
    );

    await this.prisma.client.match.update({
      where: { id: matchId },
      data: {
        cricApiScore: score,
        cricApiStatus: matchInfo.data.status || null,
        cricApiLastSyncedAt: new Date(),
        status: nextStatus,
        matchResult: nextResult,
      },
    });

    return this.getMatchScore(matchId);
  }

  async getMatchScore(matchId: string): Promise<GetMatchScoreResponseDto> {
    const match = (await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        status: true,
        matchResult: true,
        cricApiMatchId: true,
        cricApiStatus: true,
        cricApiScore: true,
        cricApiLastSyncedAt: true,
      },
    })) as MatchScoreSnapshotRow | null;

    if (!match) {
      throw new NotFoundException("Match not found");
    }

    if (
      CRICAPI_USE_MOCK_SCORE &&
      CRICAPI_ENABLE_MOCK_SCORE_FALLBACK &&
      !match.cricApiLastSyncedAt &&
      !match.cricApiStatus &&
      !match.cricApiScore
    ) {
      const mockMatchInfo = await this.cricapiService.getMatchInfo(
        match.cricApiMatchId ?? match.id,
      );

      return {
        matchId: match.id,
        status: match.status,
        matchResult: match.matchResult,
        cricApiStatus: mockMatchInfo.data.status || null,
        cricApiScore: mockMatchInfo.data.score ?? null,
        lastSyncedAt: new Date().toISOString(),
        isStale: false,
      };
    }

    const staleThresholdMs = CRICAPI_POLLING.POLL_INTERVAL_MS * 3;
    const ageMs = match.cricApiLastSyncedAt
      ? Date.now() - match.cricApiLastSyncedAt.getTime()
      : Number.POSITIVE_INFINITY;

    return {
      matchId: match.id,
      status: match.status,
      matchResult: match.matchResult,
      cricApiStatus: match.cricApiStatus,
      cricApiScore:
        (match.cricApiScore as GetMatchScoreResponseDto["cricApiScore"]) ??
        null,
      lastSyncedAt: match.cricApiLastSyncedAt?.toISOString() ?? null,
      isStale: Boolean(match.cricApiLastSyncedAt) && ageMs > staleThresholdMs,
    };
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

  private deriveMatchResult(
    matchWinner: string,
    homeTeamName: string,
    awayTeamName: string,
    matchEnded: boolean,
  ): MatchResult {
    if (!matchEnded) {
      return MatchResult.PENDING;
    }

    const winner = this.normalizeTeamName(matchWinner);
    if (!winner) {
      return MatchResult.PENDING;
    }

    if (winner.includes("abandon") || winner.includes("no result")) {
      return MatchResult.ABANDONED;
    }

    const home = this.normalizeTeamName(homeTeamName);
    const away = this.normalizeTeamName(awayTeamName);

    if (winner.includes(home) || home.includes(winner)) {
      return MatchResult.HOME_WIN;
    }

    if (winner.includes(away) || away.includes(winner)) {
      return MatchResult.AWAY_WIN;
    }

    return MatchResult.PENDING;
  }

  private normalizeTeamName(name: string): string {
    return (name || "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}
