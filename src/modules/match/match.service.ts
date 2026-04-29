import { Injectable, NotFoundException } from "@nestjs/common";
import { MatchResult, MatchStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { isPrismaRecordNotFoundError } from "../../common/errors/prisma-error.utils.js";
import type { WisdenScorecardResponse } from "../../common/types/wisden.types.js";
import { withDerivedMatchResult } from "../liveScore/wisden-match-result.util.js";

type GetSeasonMatchesOptions = {
  status?: MatchStatus;
};

type MatchPotmByImpact = {
  fantasyPlayerId: string;
  displayName: string;
  shortName: string | null;
  playerPhotoUrl: string | null;
  teamShortCode: string | null;
  totalImpact: number;
  battingImpact: number;
  bowlingImpact: number;
};

const MATCH_INCLUDE = {
  homeTeam: true,
  awayTeam: true,
  ground: true,
} as const;

const MATCH_WITH_AUDIT_INCLUDE = {
  ...MATCH_INCLUDE,
  updatedByUser: {
    select: {
      id: true,
      display_name: true,
    },
  },
} as const;

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  private async attachPotmByImpact<T extends { id: string }>(
    matches: T[],
  ): Promise<Array<T & { potmByImpact: MatchPotmByImpact | null }>> {
    const potmByMatchId = await this.getPotmByImpactForMatches(
      matches.map((match) => match.id),
    );

    return matches.map((match) => ({
      ...match,
      potmByImpact: potmByMatchId.get(match.id) ?? null,
    }));
  }

  private async getPotmByImpactForMatches(
    matchIds: string[],
  ): Promise<Map<string, MatchPotmByImpact>> {
    if (matchIds.length === 0) return new Map();

    const impactRows =
      await this.prisma.client.fantasyPlayerMatchStats.findMany({
        where: {
          matchId: { in: matchIds },
          played: true,
        },
        select: {
          matchId: true,
          fantasyPlayerId: true,
          battingImpact: true,
          bowlingImpact: true,
          fantasyPlayer: {
            select: {
              displayName: true,
              shortName: true,
              photoUrl: true,
              team: {
                select: {
                  shortCode: true,
                },
              },
            },
          },
        },
      });

    const byMatch = new Map<string, MatchPotmByImpact>();

    for (const row of impactRows) {
      const battingImpact = row.battingImpact ?? 0;
      const bowlingImpact = row.bowlingImpact ?? 0;
      const totalImpact = battingImpact + bowlingImpact;
      if (totalImpact <= 0) continue;

      const candidate: MatchPotmByImpact = {
        fantasyPlayerId: row.fantasyPlayerId,
        displayName: row.fantasyPlayer.displayName,
        shortName: row.fantasyPlayer.shortName,
        playerPhotoUrl: row.fantasyPlayer.photoUrl,
        teamShortCode: row.fantasyPlayer.team?.shortCode ?? null,
        totalImpact,
        battingImpact,
        bowlingImpact,
      };

      const current = byMatch.get(row.matchId);
      if (!current) {
        byMatch.set(row.matchId, candidate);
        continue;
      }

      const isBetter =
        candidate.totalImpact > current.totalImpact ||
        (candidate.totalImpact === current.totalImpact &&
          candidate.battingImpact > current.battingImpact) ||
        (candidate.totalImpact === current.totalImpact &&
          candidate.battingImpact === current.battingImpact &&
          candidate.bowlingImpact > current.bowlingImpact) ||
        (candidate.totalImpact === current.totalImpact &&
          candidate.battingImpact === current.battingImpact &&
          candidate.bowlingImpact === current.bowlingImpact &&
          candidate.displayName.localeCompare(current.displayName) < 0);

      if (isBetter) {
        byMatch.set(row.matchId, candidate);
      }
    }

    return byMatch;
  }

  async getMatchById(matchId: string) {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      include: MATCH_INCLUDE,
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
        const updatedMatch = await this.prisma.client.match.update({
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
          include: MATCH_INCLUDE,
        });
        const [withPotm] = await this.attachPotmByImpact([updatedMatch]);
        return withPotm;
      }
    }

    const [withPotm] = await this.attachPotmByImpact([match]);
    return withPotm;
  }

  async getSeasonMatches(
    seasonId: number,
    options: GetSeasonMatchesOptions = {},
  ) {
    const matches = await this.prisma.client.match.findMany({
      where: {
        seasonId,
        ...(options.status ? { status: options.status } : {}),
      },
      orderBy: { matchDate: "asc" },
      include: MATCH_WITH_AUDIT_INCLUDE,
    });

    return this.attachPotmByImpact(matches);
  }

  async updateMatchStatus(matchId: string, status: MatchStatus) {
    try {
      return await this.prisma.client.match.update({
        where: { id: matchId },
        data: { status },
        include: MATCH_WITH_AUDIT_INCLUDE,
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
      include: MATCH_INCLUDE,
    });
    if (!match) {
      throw new NotFoundException(
        `No match found for Wisden gid ${wisdenMatchGid}`,
      );
    }
    return match;
  }
}
