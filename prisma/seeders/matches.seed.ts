import {
  MatchFormat,
  MatchStatus,
  PrismaClient,
  TournamentStage,
  TournamentType,
} from "../../generated/prisma/client.js";
import fixtures from "../data/ipl-2026/league-stage-ipl-2026.json" with { type: "json" };
import playoffs from "../data/ipl-2026/playoffs-ipl-2026.json" with { type: "json" };

type Fixture = {
  matchNo: number;
  home: string;
  away: string;
  date: string;
  stadium?: string;
  venue?: string;
  wisdenMatchGid?: string;
  format?: string;
  tournamentType?: string;
  tournamentName?: string;
  tournamentStage?: string;
  stageLabel?: string;
  cricbuzzGroundId?: number;
};

const unlockOneScheduledMatchForTesting = async (
  prisma: PrismaClient,
  seasonId: number,
) => {
  const now = new Date();

  const editableScheduledMatch = await prisma.match.findFirst({
    where: { seasonId, status: "SCHEDULED", matchDate: { lte: now } },
    orderBy: { matchDate: "asc" },
    select: { id: true, matchNo: true, matchDate: true },
  });

  if (editableScheduledMatch) {
    console.log(
      `Match ${editableScheduledMatch.matchNo} already editable (${editableScheduledMatch.matchDate.toISOString()})`,
    );
    return;
  }

  const nextScheduledMatch = await prisma.match.findFirst({
    where: { seasonId, status: "SCHEDULED", matchDate: { gt: now } },
    orderBy: { matchDate: "asc" },
    select: { id: true, matchNo: true },
  });

  if (!nextScheduledMatch) {
    console.log("No future scheduled match found to unlock for testing");
    return;
  }

  const unlockedDate = new Date(now.getTime() - 10 * 60 * 1000);
  await prisma.match.update({
    where: { id: nextScheduledMatch.id },
    data: { matchDate: unlockedDate },
  });

  console.log(
    `Unlocked match ${nextScheduledMatch.matchNo} for testing (${unlockedDate.toISOString()})`,
  );
};

export async function seedFixtures(
  prisma: PrismaClient,
  seasonId: number,
  enableTestUnlock = false,
) {
  console.log("Seeding fixtures...");

  const teams = await prisma.team.findMany();
  const teamMap = new Map(teams.map((t) => [t.shortCode, t.id]));

  // Snapshot all existing matches so we never query per-fixture
  const existing = await prisma.match.findMany({
    where: { seasonId },
    select: { id: true, matchNo: true, status: true },
  });
  const existingByMatchNo = new Map(existing.map((m) => [m.matchNo, m]));

  // ── League fixtures ──────────────────────────────────────────────────────
  let leagueCreated = 0;
  let leagueSkipped = 0;

  for (const fixture of fixtures as Fixture[]) {
    const homeTeamId = teamMap.get(fixture.home) ?? "";
    const awayTeamId = teamMap.get(fixture.away) ?? "";

    if (!homeTeamId || !awayTeamId) {
      throw new Error(
        `Unknown team in fixture ${fixture.matchNo}: ${fixture.home} vs ${fixture.away}`,
      );
    }

    const ground = await prisma.ground.findFirst({
      where: { cricbuzzGroundId: fixture.cricbuzzGroundId ?? undefined },
      select: { id: true },
    });

    const existing = existingByMatchNo.get(fixture.matchNo);

    if (!existing) {
      // New fixture — create it
      await prisma.match.create({
        data: {
          seasonId,
          matchNo: fixture.matchNo,
          homeTeamId,
          awayTeamId,
          matchDate: new Date(fixture.date),
          format: MatchFormat.T20,
          tournamentType: TournamentType.FRANCHISE_LEAGUE,
          tournamentName: fixture.tournamentName,
          tournamentStage: TournamentStage.LEAGUE,
          groundId: ground?.id ?? null,
          wisdenMatchGid: fixture.wisdenMatchGid ?? null,
        },
      });
      leagueCreated++;
    } else if (existing.status === MatchStatus.SCHEDULED) {
      // Existing scheduled match — safe to update metadata only
      await prisma.match.update({
        where: { id: existing.id },
        data: {
          format: MatchFormat.T20,
          tournamentType: TournamentType.FRANCHISE_LEAGUE,
          tournamentName: fixture.tournamentName,
          tournamentStage: TournamentStage.LEAGUE,
          groundId: ground?.id ?? null,
        },
      });
    } else {
      // LIVE or COMPLETED — leave completely untouched
      leagueSkipped++;
    }
  }

  console.log(
    `League fixtures: ${leagueCreated} created, ${leagueSkipped} skipped (live/completed)`,
  );

  // ── Playoff fixtures ─────────────────────────────────────────────────────
  let playoffCreated = 0;
  let playoffSkipped = 0;

  for (const fixture of playoffs as Fixture[]) {
    if (fixture.home === "TBD" || fixture.away === "TBD") {
      console.log(
        `  Skipping playoff ${fixture.matchNo} (${fixture.home} vs ${fixture.away}) — teams TBD`,
      );
      continue;
    }

    const homeTeamId = teamMap.get(fixture.home) ?? "";
    const awayTeamId = teamMap.get(fixture.away) ?? "";

    if (!homeTeamId || !awayTeamId) {
      throw new Error(
        `Unknown team in playoff fixture ${fixture.matchNo}: ${fixture.home} vs ${fixture.away}`,
      );
    }

    const ground = await prisma.ground.findFirst({
      where: { cricbuzzGroundId: fixture.cricbuzzGroundId ?? undefined },
      select: { id: true },
    });

    const existing = existingByMatchNo.get(fixture.matchNo);

    if (!existing) {
      // New playoff fixture — create it
      await prisma.match.create({
        data: {
          seasonId,
          matchNo: fixture.matchNo,
          homeTeamId,
          awayTeamId,
          matchDate: new Date(fixture.date),
          format: MatchFormat.T20,
          tournamentType: TournamentType.FRANCHISE_LEAGUE,
          tournamentName: fixture.tournamentName,
          tournamentStage: fixture.tournamentStage as TournamentStage,
          stageLabel: fixture.stageLabel,
          isKnockout: true,
          groundId: ground?.id ?? null,
          wisdenMatchGid: fixture.wisdenMatchGid ?? null,
        },
      });
      playoffCreated++;
    } else if (existing.status === MatchStatus.SCHEDULED) {
      // Scheduled playoff — safe to update non-result fields
      await prisma.match.update({
        where: { id: existing.id },
        data: {
          homeTeamId,
          awayTeamId,
          matchDate: new Date(fixture.date),
          format: MatchFormat.T20,
          tournamentType: TournamentType.FRANCHISE_LEAGUE,
          tournamentName: fixture.tournamentName,
          tournamentStage: fixture.tournamentStage as TournamentStage,
          stageLabel: fixture.stageLabel,
          isKnockout: true,
          groundId: ground?.id ?? null,
          wisdenMatchGid: fixture.wisdenMatchGid ?? null,
        },
      });
    } else {
      // LIVE or COMPLETED — leave completely untouched
      playoffSkipped++;
    }
  }

  console.log(
    `Playoff fixtures: ${playoffCreated} created, ${playoffSkipped} skipped (live/completed)`,
  );

  if (enableTestUnlock) {
    await unlockOneScheduledMatchForTesting(prisma, seasonId);
  }
}
