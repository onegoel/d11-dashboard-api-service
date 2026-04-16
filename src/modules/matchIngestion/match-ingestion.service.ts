import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaService } from "../../common/database/prisma.service.js";
import { MatchPollerService } from "../liveScore/match-poller.service.js";
import { WisdenService } from "../wisden/wisden.service.js";
import type { WisdenTableTeam } from "../../common/types/wisden.types.js";

export interface IngestionResult {
  teamsSynced: number;
  updated: number;
  skipped: number;
  noMatch: number;
}

type FixtureSeed = {
  matchNo: number;
  home: string;
  away: string;
  date: string;
  stadium?: string;
  venue?: string;
  wisdenMatchGid?: string;
};

const DEFAULT_FIXTURE_PATH = path.join(
  process.cwd(),
  "prisma/data/ipl-2026/league-stage-ipl-2026.json",
);

@Injectable()
export class MatchIngestionService {
  private readonly logger = new Logger(MatchIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly poller: MatchPollerService,
    private readonly wisden: WisdenService,
  ) {}

  // ── Cron: 10 AM IST daily — ingest Wisden forthcoming match IDs ───────

  @Cron("0 10 * * *", { timeZone: "Asia/Kolkata" })
  async scheduledWisdenIngest(): Promise<void> {
    this.logger.log("[Cron 10AM IST] Running Wisden match ID ingestion");
    await this.ingestWisdenMatchIds();
  }

  async ingestWisdenMatchIds(): Promise<IngestionResult> {
    const teamsSynced = await this.syncWisdenTeamsFromTable();
    const fixtures = await this.loadFixtureSeeds();

    let updated = 0;
    let skipped = 0;
    let noMatch = 0;

    for (const fixture of fixtures) {
      if (!fixture.wisdenMatchGid) {
        skipped++;
        continue;
      }

      const dbMatch = await this.findExistingMatchFromFixture(fixture);

      if (!dbMatch) {
        this.logger.warn(
          `No matching DB record for fixture ${fixture.matchNo} (${fixture.home} vs ${fixture.away})`,
        );
        noMatch++;
        continue;
      }

      if (dbMatch.wisdenMatchGid === fixture.wisdenMatchGid) {
        this.logger.debug(
          `Wisden match ID already ingested for fixture ${fixture.matchNo}`,
        );
        this.poller.scheduleMatch(dbMatch.id, dbMatch.matchDate);
        skipped++;
        continue;
      }

      await this.prisma.client.match.update({
        where: { id: dbMatch.id },
        data: {
          wisdenMatchGid: fixture.wisdenMatchGid,
          venue: dbMatch.venue ?? fixture.venue ?? null,
          stadium: dbMatch.stadium ?? fixture.stadium ?? null,
        },
      });

      this.logger.log(
        `Ingested Wisden match ID for fixture ${fixture.matchNo} (${fixture.wisdenMatchGid})`,
      );
      this.poller.scheduleMatch(dbMatch.id, dbMatch.matchDate);
      updated++;
    }

    this.logger.log(
      `Wisden match ingestion complete: teamsSynced=${teamsSynced}, updated=${updated}, skipped=${skipped}, unmatched=${noMatch}`,
    );

    return { teamsSynced, updated, skipped, noMatch };
  }

  async syncWisdenTeamsFromTable(): Promise<number> {
    const table = await this.wisden.getTable();
    const teams = table.groups.flatMap((group) => group.team);
    let synced = 0;

    for (const team of teams) {
      const dbTeam = await this.findExistingTeam(team);
      if (!dbTeam) {
        this.logger.warn(`No DB team found for Wisden team ${team.team_name}`);
        continue;
      }

      if (
        dbTeam.wisdenTeamId === String(team.team_id) &&
        dbTeam.name === team.team_name
      ) {
        continue;
      }

      await this.prisma.client.team.update({
        where: { id: dbTeam.id },
        data: {
          wisdenTeamId: String(team.team_id),
          name: team.team_name,
        },
      });
      synced++;
    }

    return synced;
  }

  private async findExistingTeam(team: WisdenTableTeam) {
    return this.prisma.client.team.findFirst({
      where: {
        OR: [
          { wisdenTeamId: String(team.team_id) },
          { shortCode: team.team_abbreviation },
          { name: team.team_name },
        ],
      },
    });
  }

  private async findExistingMatchFromFixture(fixture: FixtureSeed) {
    const matchDate = new Date(fixture.date);
    const dayStart = new Date(matchDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(matchDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    return this.prisma.client.match.findFirst({
      where: {
        matchNo: fixture.matchNo,
        matchDate: { gte: dayStart, lte: dayEnd },
        homeTeam: { shortCode: fixture.home },
        awayTeam: { shortCode: fixture.away },
      },
      include: { homeTeam: true, awayTeam: true },
    });
  }

  private async loadFixtureSeeds(
    filePath = DEFAULT_FIXTURE_PATH,
  ): Promise<FixtureSeed[]> {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error("Fixture seed file is not an array");
    }

    return parsed as FixtureSeed[];
  }
}
