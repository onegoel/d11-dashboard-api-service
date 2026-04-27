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

    return {
      teams,
      competitionNotes: standings.competition_notes
        ? {
            order: standings.competition_notes.order ?? [],
            points: standings.competition_notes.points ?? [],
          }
        : null,
      teamStats: (standings.team_stats ?? []).map((stat) => ({
        matchGid: stat.match_gid,
        matchId: stat.match_id,
        teamName: stat.team_name,
        title: stat.title,
        value: stat.value,
      })),
    };
  }

  async getSeasonRecords(seasonId: number) {
    const [standings, battingRows, bowlingRows, fieldingRows, perfRaw, mvpRaw] =
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
                id: true,
                displayName: true,
                photoUrl: true,
                role: true,
                battingHand: true,
                bowlingStyle: true,
                bowlingTechnique: true,
                teamId: true,
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
                id: true,
                displayName: true,
                photoUrl: true,
                role: true,
                battingHand: true,
                bowlingStyle: true,
                bowlingTechnique: true,
                teamId: true,
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
                role: true,
                battingHand: true,
                bowlingStyle: true,
                bowlingTechnique: true,
                team: { select: { shortCode: true } },
              },
            },
          },
        }),
        this.prisma.client.$queryRaw<
          Array<{
            fantasyPlayerId: string;
            displayName: string;
            photoUrl: string | null;
            shortCode: string | null;
            role: string | null;
            battingHand: string | null;
            bowlingStyle: string | null;
            bowlingTechnique: string | null;
            matchId: string;
            matchNo: number;
            matchDate: Date;
            homeTeam: string;
            awayTeam: string;
            battingImpact: number;
            bowlingImpact: number;
            runs: number;
            ballsFaced: number;
            fours: number;
            sixes: number;
            battingPosition: number | null;
            wickets: number;
            ballsBowled: number;
            runsConceded: number;
            maidens: number;
            dotBalls: number;
            catches: number;
            stumpings: number;
            runOutDirect: number;
            runOutAssist: number;
            boundaryScoredPct: number | null;
            dotsPlayedPct: number | null;
          }>
        >`
          SELECT
            fp.id                                    AS "fantasyPlayerId",
            fp."displayName",
            fp."photoUrl",
            fp.role::text                            AS "role",
            fp."battingHand",
            fp."bowlingStyle"::text                  AS "bowlingStyle",
            fp."bowlingTechnique"::text              AS "bowlingTechnique",
            t."shortCode",
            m.id                                     AS "matchId",
            m."matchNo",
            m."matchDate",
            ht."shortCode"                           AS "homeTeam",
            at."shortCode"                           AS "awayTeam",
            COALESCE(s."battingImpact",  0)::float8  AS "battingImpact",
            COALESCE(s."bowlingImpact", 0)::float8   AS "bowlingImpact",
            s.runs,
            s."ballsFaced",
            s.fours,
            s.sixes,
            s."battingPosition",
            s.wickets,
            s."ballsBowled",
            s."runsConceded",
            s.maidens,
            s."dotBalls",
            s.catches,
            s.stumpings,
            s."runOutDirect",
            s."runOutAssist",
            s."boundaryScoredPct",
            s."dotsPlayedPct"
          FROM "FantasyPlayerMatchStats" s
          JOIN "FantasyPlayer" fp ON fp.id = s."fantasyPlayerId"
          JOIN "Match"         m  ON m.id  = s."matchId"
          JOIN "Team"          ht ON ht.id = m."homeTeamId"
          JOIN "Team"          at ON at.id = m."awayTeamId"
          LEFT JOIN "Team"     t  ON t.id  = fp."teamId"
          WHERE m."seasonId" = ${seasonId}
            AND s.played = true
            AND (COALESCE(s."battingImpact", 0) + COALESCE(s."bowlingImpact", 0)) > 0
          ORDER BY (COALESCE(s."battingImpact", 0) + COALESCE(s."bowlingImpact", 0)) DESC
          LIMIT 50
        `,
        this.prisma.client.$queryRaw<
          Array<{
            fantasyPlayerId: string;
            displayName: string;
            photoUrl: string | null;
            shortCode: string | null;
            role: string | null;
            battingHand: string | null;
            bowlingStyle: string | null;
            bowlingTechnique: string | null;
            matchCount: number;
            battingImpactTotal: number;
            bowlingImpactTotal: number;
          }>
        >`
          SELECT
            fp.id                                                          AS "fantasyPlayerId",
            fp."displayName",
            fp."photoUrl",
            fp.role::text                                                  AS "role",
            fp."battingHand",
            fp."bowlingStyle"::text                                        AS "bowlingStyle",
            fp."bowlingTechnique"::text                                    AS "bowlingTechnique",
            t."shortCode",
            COUNT(DISTINCT s."matchId")::integer                          AS "matchCount",
            SUM(COALESCE(s."battingImpact",  0))::float8                 AS "battingImpactTotal",
            SUM(COALESCE(s."bowlingImpact", 0))::float8                  AS "bowlingImpactTotal"
          FROM "FantasyPlayerMatchStats" s
          JOIN "FantasyPlayer" fp ON fp.id  = s."fantasyPlayerId"
          JOIN "Match"         m  ON m.id   = s."matchId"
          LEFT JOIN "Team"     t  ON t.id   = fp."teamId"
          WHERE m."seasonId" = ${seasonId}
            AND s.played = true
            AND (COALESCE(s."battingImpact", 0) + COALESCE(s."bowlingImpact", 0)) <> 0
          GROUP BY fp.id, fp."displayName", fp."photoUrl", fp.role, fp."battingHand", fp."bowlingStyle", fp."bowlingTechnique", t."shortCode"
          HAVING (SUM(COALESCE(s."battingImpact", 0)) + SUM(COALESCE(s."bowlingImpact", 0))) > 0
          ORDER BY (SUM(COALESCE(s."battingImpact", 0)) + SUM(COALESCE(s."bowlingImpact", 0))) DESC
          LIMIT 50
        `,
      ]);

    // ── Season-best match context (which match produced the season-high score / best figures) ──
    const battingPlayerIds = battingRows.map((r) => r.fantasyPlayer.id);
    const bowlingPlayerIds = bowlingRows.map((r) => r.fantasyPlayer.id);

    type MatchContextRow = {
      fantasyPlayerId: string;
      matchId: string;
      matchNo: number;
      matchDate: Date;
      vsTeamShortCode: string | null;
      vsTeamName: string | null;
    };

    const [highScoreMatches, bestFiguresMatches] = await Promise.all([
      battingPlayerIds.length === 0
        ? Promise.resolve([] as MatchContextRow[])
        : this.prisma.client.$queryRaw<MatchContextRow[]>`
            SELECT DISTINCT ON (s."fantasyPlayerId")
              s."fantasyPlayerId",
              m.id                                                             AS "matchId",
              m."matchNo",
              m."matchDate",
              CASE
                WHEN fp."teamId" IS NULL THEN NULL
                WHEN m."homeTeamId" = fp."teamId" THEN at_t."shortCode"
                ELSE ht_t."shortCode"
              END                                                              AS "vsTeamShortCode",
              CASE
                WHEN fp."teamId" IS NULL THEN NULL
                WHEN m."homeTeamId" = fp."teamId" THEN at_t."name"
                ELSE ht_t."name"
              END                                                              AS "vsTeamName"
            FROM "FantasyPlayerMatchStats" s
            JOIN "FantasyPlayer" fp ON fp.id  = s."fantasyPlayerId"
            JOIN "Match"         m  ON m.id   = s."matchId"
            JOIN "Team"          ht_t ON ht_t.id = m."homeTeamId"
            JOIN "Team"          at_t ON at_t.id = m."awayTeamId"
            WHERE m."seasonId" = ${seasonId}
              AND s.played = true
              AND s."fantasyPlayerId" = ANY(${battingPlayerIds}::text[])
            ORDER BY s."fantasyPlayerId", s.runs DESC, m."matchDate" ASC
          `,
      bowlingPlayerIds.length === 0
        ? Promise.resolve([] as MatchContextRow[])
        : this.prisma.client.$queryRaw<MatchContextRow[]>`
            SELECT DISTINCT ON (s."fantasyPlayerId")
              s."fantasyPlayerId",
              m.id                                                             AS "matchId",
              m."matchNo",
              m."matchDate",
              CASE
                WHEN fp."teamId" IS NULL THEN NULL
                WHEN m."homeTeamId" = fp."teamId" THEN at_t."shortCode"
                ELSE ht_t."shortCode"
              END                                                              AS "vsTeamShortCode",
              CASE
                WHEN fp."teamId" IS NULL THEN NULL
                WHEN m."homeTeamId" = fp."teamId" THEN at_t."name"
                ELSE ht_t."name"
              END                                                              AS "vsTeamName"
            FROM "FantasyPlayerMatchStats" s
            JOIN "FantasyPlayer" fp ON fp.id  = s."fantasyPlayerId"
            JOIN "Match"         m  ON m.id   = s."matchId"
            JOIN "Team"          ht_t ON ht_t.id = m."homeTeamId"
            JOIN "Team"          at_t ON at_t.id = m."awayTeamId"
            WHERE m."seasonId" = ${seasonId}
              AND s.played = true
              AND s.wickets > 0
              AND s."fantasyPlayerId" = ANY(${bowlingPlayerIds}::text[])
            ORDER BY s."fantasyPlayerId", s.wickets DESC, s."runsConceded" ASC, m."matchDate" ASC
          `,
    ]);

    const toMatchInfo = (row: MatchContextRow) => ({
      matchId: row.matchId,
      matchNo: Number(row.matchNo),
      matchDate: row.matchDate,
      vsTeamShortCode: row.vsTeamShortCode,
      vsTeamName: row.vsTeamName,
    });

    const highScoreMatchByPlayer = new Map(
      highScoreMatches.map((r) => [r.fantasyPlayerId, toMatchInfo(r)]),
    );
    const bestFiguresMatchByPlayer = new Map(
      bestFiguresMatches.map((r) => [r.fantasyPlayerId, toMatchInfo(r)]),
    );

    const mapBatting = (row: (typeof battingRows)[number]) => ({
      playerName: row.fantasyPlayer.displayName,
      playerPhotoUrl: row.fantasyPlayer.photoUrl,
      teamShortCode: row.fantasyPlayer.team?.shortCode ?? null,
      role: row.fantasyPlayer.role ?? null,
      battingHand: row.fantasyPlayer.battingHand ?? null,
      bowlingStyle: row.fantasyPlayer.bowlingStyle ?? null,
      bowlingTechnique: row.fantasyPlayer.bowlingTechnique ?? null,
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
      highScoreMatch: highScoreMatchByPlayer.get(row.fantasyPlayer.id) ?? null,
    });

    const mapBowling = (row: (typeof bowlingRows)[number]) => ({
      playerName: row.fantasyPlayer.displayName,
      playerPhotoUrl: row.fantasyPlayer.photoUrl,
      teamShortCode: row.fantasyPlayer.team?.shortCode ?? null,
      role: row.fantasyPlayer.role ?? null,
      battingHand: row.fantasyPlayer.battingHand ?? null,
      bowlingStyle: row.fantasyPlayer.bowlingStyle ?? null,
      bowlingTechnique: row.fantasyPlayer.bowlingTechnique ?? null,
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
      bestFiguresMatch:
        bestFiguresMatchByPlayer.get(row.fantasyPlayer.id) ?? null,
    });

    const mapFielding = (row: (typeof fieldingRows)[number]) => ({
      playerName: row.fantasyPlayer.displayName,
      playerPhotoUrl: row.fantasyPlayer.photoUrl,
      teamShortCode: row.fantasyPlayer.team?.shortCode ?? null,
      role: row.fantasyPlayer.role ?? null,
      battingHand: row.fantasyPlayer.battingHand ?? null,
      bowlingStyle: row.fantasyPlayer.bowlingStyle ?? null,
      bowlingTechnique: row.fantasyPlayer.bowlingTechnique ?? null,
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

    const mapMvp = (row: (typeof mvpRaw)[number]) => ({
      playerName: row.displayName,
      playerPhotoUrl: row.photoUrl,
      teamShortCode: row.shortCode,
      role: row.role ?? null,
      battingHand: row.battingHand ?? null,
      bowlingStyle: row.bowlingStyle ?? null,
      bowlingTechnique: row.bowlingTechnique ?? null,
      matches: Number(row.matchCount),
      battingImpact: Number(row.battingImpactTotal),
      bowlingImpact: Number(row.bowlingImpactTotal),
      totalImpact:
        Number(row.battingImpactTotal) + Number(row.bowlingImpactTotal),
    });

    // mvpRaw is already ordered by totalImpact DESC from the query
    const mvp = mvpRaw.map(mapMvp);

    const mapPerformance = (row: (typeof perfRaw)[number]) => ({
      playerName: row.displayName,
      playerPhotoUrl: row.photoUrl,
      teamShortCode: row.shortCode,
      role: row.role ?? null,
      battingHand: row.battingHand ?? null,
      bowlingStyle: row.bowlingStyle ?? null,
      bowlingTechnique: row.bowlingTechnique ?? null,
      matchId: row.matchId,
      matchNo: Number(row.matchNo),
      matchDate: row.matchDate,
      homeTeam: row.homeTeam,
      awayTeam: row.awayTeam,
      battingImpact: Number(row.battingImpact),
      bowlingImpact: Number(row.bowlingImpact),
      totalImpact: Number(row.battingImpact) + Number(row.bowlingImpact),
      runs: Number(row.runs ?? 0),
      ballsFaced: Number(row.ballsFaced ?? 0),
      fours: Number(row.fours ?? 0),
      sixes: Number(row.sixes ?? 0),
      battingPosition:
        row.battingPosition != null ? Number(row.battingPosition) : null,
      wickets: Number(row.wickets ?? 0),
      ballsBowled: Number(row.ballsBowled ?? 0),
      runsConceded: Number(row.runsConceded ?? 0),
      maidens: Number(row.maidens ?? 0),
      dotBalls: Number(row.dotBalls ?? 0),
      catches: Number(row.catches ?? 0),
      stumpings: Number(row.stumpings ?? 0),
      runOutDirect: Number(row.runOutDirect ?? 0),
      runOutAssist: Number(row.runOutAssist ?? 0),
      boundaryScoredPct:
        row.boundaryScoredPct != null ? Number(row.boundaryScoredPct) : null,
      dotsPlayedPct:
        row.dotsPlayedPct != null ? Number(row.dotsPlayedPct) : null,
    });

    const topPerformances = perfRaw.map(mapPerformance);

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
      mvp,
      topPerformances,
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
