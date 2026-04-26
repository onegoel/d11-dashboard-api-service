import { Injectable, NotFoundException } from "@nestjs/common";
import { MatchResult, MatchStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { isPrismaRecordNotFoundError } from "../../common/errors/prisma-error.utils.js";
import type {
  WisdenScorecardResponse,
  WisdenTableResponse,
} from "../../common/types/wisden.types.js";
import { withDerivedMatchResult } from "../liveScore/wisden-match-result.util.js";
import { WisdenService } from "../wisden/wisden.service.js";

type GetSeasonMatchesOptions = {
  status?: MatchStatus;
};

@Injectable()
export class MatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wisden: WisdenService,
  ) {}

  private async getStandings(): Promise<Awaited<
    ReturnType<WisdenService["getTable"]>
  > | null> {
    try {
      return await this.wisden.getTable();
    } catch {
      return null;
    }
  }

  createIplSeriesStandingsPayload = (standings: WisdenTableResponse | null) => {
    return {
      teams: standings?.groups.flatMap((group) =>
        group.team.map((team) => ({
          matchesLost: team.lost,
          matchesPlayed: team.matches,
          matchesWon: team.won,
          matchesTied: team.matches - team.won - team.lost - team.no_result,
          points: team.points,
          teamName: team.team_name,
          netRunRate: team.net_run_rate,
          teamShortName: team.team_short_name || team.team_abbreviation,
          position: team.position,
          noResults: team.no_result,
          teamId: String(team.team_id),
          seriesForm: [], // This would require additional data to populate
          nextMatches: [], // This would require additional data to populate
        })),
      ),
    };
  };

  async getSeasonRecords(seasonId: number) {
    const [standings, battingRows, bowlingRows, fieldingRows] =
      await Promise.all([
        this.getStandings(),
        this.prisma.client.fantasyPlayerSeasonStats.findMany({
          where: {
            seasonId,
            runsTotal: { gt: 0 },
          },
          orderBy: [{ runsTotal: "desc" }, { ballsFacedTotal: "asc" }],
          take: 12,
          select: {
            matchesPlayed: true,
            runsTotal: true,
            ballsFacedTotal: true,
            foursTotal: true,
            sixesTotal: true,
            highScore: true,
            fantasyPlayer: {
              select: {
                displayName: true,
                photoUrl: true,
                team: { select: { shortCode: true } },
              },
            },
          },
        }),
        this.prisma.client.fantasyPlayerSeasonStats.findMany({
          where: {
            seasonId,
            OR: [{ wicketsTotal: { gt: 0 } }, { ballsBowledTotal: { gt: 0 } }],
          },
          orderBy: [
            { wicketsTotal: "desc" },
            { runsConcededTotal: "asc" },
            { ballsBowledTotal: "asc" },
          ],
          take: 12,
          select: {
            matchesPlayed: true,
            wicketsTotal: true,
            ballsBowledTotal: true,
            runsConcededTotal: true,
            maidensTotal: true,
            bestBowlingWickets: true,
            bestBowlingRuns: true,
            fantasyPlayer: {
              select: {
                displayName: true,
                photoUrl: true,
                team: { select: { shortCode: true } },
              },
            },
          },
        }),
        this.prisma.client.fantasyPlayerSeasonStats.findMany({
          where: {
            seasonId,
            OR: [
              { catchesTotal: { gt: 0 } },
              { stumpingsTotal: { gt: 0 } },
              { runOutsTotal: { gt: 0 } },
            ],
          },
          orderBy: [
            { catchesTotal: "desc" },
            { stumpingsTotal: "desc" },
            { runOutsTotal: "desc" },
          ],
          take: 12,
          select: {
            matchesPlayed: true,
            catchesTotal: true,
            stumpingsTotal: true,
            runOutsTotal: true,
            fantasyPlayer: {
              select: {
                displayName: true,
                photoUrl: true,
                team: { select: { shortCode: true } },
              },
            },
          },
        }),
      ]);

    return {
      seasonId,
      standings: this.createIplSeriesStandingsPayload(standings ?? null),
      batting: battingRows.map((row) => ({
        playerName: row.fantasyPlayer.displayName,
        playerPhotoUrl: row.fantasyPlayer.photoUrl,
        teamShortCode: row.fantasyPlayer.team?.shortCode ?? null,
        matches: row.matchesPlayed,
        runs: row.runsTotal,
        average:
          row.matchesPlayed > 0
            ? Math.round((row.runsTotal / row.matchesPlayed) * 10) / 10
            : 0,
        strikeRate:
          row.ballsFacedTotal > 0
            ? Math.round((row.runsTotal / row.ballsFacedTotal) * 1000) / 10
            : 0,
        fours: row.foursTotal,
        sixes: row.sixesTotal,
        highScore: row.highScore,
      })),
      bowling: bowlingRows.map((row) => ({
        playerName: row.fantasyPlayer.displayName,
        playerPhotoUrl: row.fantasyPlayer.photoUrl,
        teamShortCode: row.fantasyPlayer.team?.shortCode ?? null,
        matches: row.matchesPlayed,
        wickets: row.wicketsTotal,
        average:
          row.wicketsTotal > 0
            ? Math.round((row.runsConcededTotal / row.wicketsTotal) * 10) / 10
            : null,
        strikeRate:
          row.wicketsTotal > 0
            ? Math.round((row.ballsBowledTotal / row.wicketsTotal) * 10) / 10
            : null,
        economy:
          row.ballsBowledTotal > 0
            ? Math.round(
                (row.runsConcededTotal / (row.ballsBowledTotal / 6)) * 100,
              ) / 100
            : null,
        maidens: row.maidensTotal,
        best:
          row.bestBowlingWickets > 0
            ? `${row.bestBowlingWickets}/${row.bestBowlingRuns}`
            : "-",
      })),
      fielding: fieldingRows
        .map((row) => ({
          playerName: row.fantasyPlayer.displayName,
          playerPhotoUrl: row.fantasyPlayer.photoUrl,
          teamShortCode: row.fantasyPlayer.team?.shortCode ?? null,
          matches: row.matchesPlayed,
          catches: row.catchesTotal,
          stumpings: row.stumpingsTotal,
          runOuts: row.runOutsTotal,
          dismissals: row.catchesTotal + row.stumpingsTotal + row.runOutsTotal,
        }))
        .sort((a, b) => b.dismissals - a.dismissals || b.catches - a.catches),
    };
  }

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
