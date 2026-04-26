import { Injectable } from "@nestjs/common";
import { MatchResult } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import type {
  WisdenTableResponse,
  WisdenTableTeam,
} from "../../common/types/wisden.types.js";
import { WisdenService } from "../wisden/wisden.service.js";

@Injectable()
export class RecordsService {
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

  async getSeriesFormByTeamId(team: WisdenTableTeam) {
    const nativeTeamId = await this.prisma.client.team.findUnique({
      where: { wisdenTeamId: String(team.team_id) },
      select: { id: true },
    });

    if (!nativeTeamId) {
      return [];
    }

    const allMatchesForTeam = await this.prisma.client.match.findMany({
      where: {
        OR: [{ homeTeamId: nativeTeamId.id }, { awayTeamId: nativeTeamId.id }],
        matchResult: {
          in: [
            MatchResult.HOME_WIN,
            MatchResult.AWAY_WIN,
            MatchResult.ABANDONED,
          ],
        },
      },
    });

    return allMatchesForTeam.map((match) => {
      const isHomeTeam = match.homeTeamId === nativeTeamId.id;
      let result: "W" | "L" | "NR" | "T";
      if (match.matchResult === MatchResult.ABANDONED) {
        result = "NR";
      } else if (match.matchResult === MatchResult.HOME_WIN) {
        result = isHomeTeam ? "W" : "L";
      } else {
        result = isHomeTeam ? "L" : "W";
      }
      return { matchId: match.id, result };
    });
  }

  async createIplSeriesStandingsPayload(standings: WisdenTableResponse | null) {
    if (!standings) {
      return null;
    }

    const teams = await Promise.all(
      standings.groups.flatMap((group) =>
        group.team.map(async (team) => ({
          matchesLost: team.lost,
          matchesPlayed: team.matches,
          matchesWon: team.won,
          matchesTied: team.matches - team.won - team.lost - team.no_result,
          points: team.points,
          teamName: team.team_name,
          netRunRate: team.net_run_rate,
          teamShortName: team.team_abbreviation,
          position: team.position,
          noResults: team.no_result,
          teamId: String(team.team_id),
          seriesForm: await this.getSeriesFormByTeamId(team),
          nextMatches: [],
        })),
      ),
    );

    return { teams };
  }

  async getSeasonRecords(seasonId: number) {
    const [standings, battingRows, bowlingRows, fieldingRows] =
      await Promise.all([
        this.getStandings(),
        this.prisma.client.fantasyPlayerSeasonStats.findMany({
          where: { seasonId, runsTotal: { gt: 0 } },
          orderBy: [{ runsTotal: "desc" }, { ballsFacedTotal: "asc" }],
          take: 20,
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
          take: 20,
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
          take: 20,
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

    const mapBatting = (row: (typeof battingRows)[number]) => ({
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
    });

    const mapBowling = (row: (typeof bowlingRows)[number]) => ({
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
    });

    const mapFielding = (row: (typeof fieldingRows)[number]) => ({
      playerName: row.fantasyPlayer.displayName,
      playerPhotoUrl: row.fantasyPlayer.photoUrl,
      teamShortCode: row.fantasyPlayer.team?.shortCode ?? null,
      matches: row.matchesPlayed,
      catches: row.catchesTotal,
      stumpings: row.stumpingsTotal,
      runOuts: row.runOutsTotal,
      dismissals: row.catchesTotal + row.stumpingsTotal + row.runOutsTotal,
    });

    const batting = battingRows.map(mapBatting);
    const bowling = bowlingRows.map(mapBowling);
    const fielding = fieldingRows
      .map(mapFielding)
      .sort((a, b) => b.dismissals - a.dismissals || b.catches - a.catches);

    // Derive leaderboard leaders for the preview cards
    const byStrikeRate = [...batting]
      .filter((p) => p.matches >= 3)
      .sort((a, b) => b.strikeRate - a.strikeRate);
    const byHighScore = [...batting].sort((a, b) => b.highScore - a.highScore);

    const byEconomy = [...bowling]
      .filter((p) => p.economy !== null && p.matches >= 2)
      .sort((a, b) => (a.economy ?? Infinity) - (b.economy ?? Infinity));
    const bowlingByStrikeRate = [...bowling]
      .filter((p) => p.strikeRate !== null && p.wickets > 0)
      .sort((a, b) => (a.strikeRate ?? Infinity) - (b.strikeRate ?? Infinity));
    const byFigures = [...bowling].sort((a, b) => {
      const [aw = 0, ar = 999] =
        a.best !== "-" ? a.best.split("/").map(Number) : [0, 999];
      const [bw = 0, br = 999] =
        b.best !== "-" ? b.best.split("/").map(Number) : [0, 999];
      return bw - aw || ar - br;
    });

    const byCatches = [...fielding].sort((a, b) => b.catches - a.catches);
    const byStumpings = [...fielding].sort((a, b) => b.stumpings - a.stumpings);
    const byRunOuts = [...fielding].sort((a, b) => b.runOuts - a.runOuts);

    return {
      seasonId,
      standings: await this.createIplSeriesStandingsPayload(standings ?? null),
      batting,
      bowling,
      fielding,
      leaders: {
        batting: {
          mostRuns: batting[0] ?? null,
          bestStrikeRate: byStrikeRate[0] ?? null,
          highestScore: byHighScore[0] ?? null,
        },
        bowling: {
          mostWickets: bowling[0] ?? null,
          bestEconomy: byEconomy[0] ?? null,
          bestStrikeRate: bowlingByStrikeRate[0] ?? null,
          bestFigures: byFigures[0] ?? null,
        },
        fielding: {
          mostCatches: byCatches[0] ?? null,
          mostStumpings: byStumpings[0]?.stumpings ? byStumpings[0] : null,
          mostRunOuts: byRunOuts[0]?.runOuts ? byRunOuts[0] : null,
        },
      },
    };
  }
}
