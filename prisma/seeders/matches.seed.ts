import { PrismaClient } from "../../generated/prisma/client.js";
import fixtures from "../data/ipl-2026/league-stage-ipl-2026.json" with { type: "json" };

type Fixture = {
  matchNo: number;
  home: string;
  away: string;
  date: string;
  stadium?: string;
  venue?: string;
  wisdenMatchGid?: string;
};

const unlockOneScheduledMatchForTesting = async (
  prisma: PrismaClient,
  seasonId: number,
) => {
  const now = new Date();

  const editableScheduledMatch = await prisma.match.findFirst({
    where: {
      seasonId,
      status: "SCHEDULED",
      matchDate: { lte: now },
    },
    orderBy: { matchDate: "asc" },
    select: {
      id: true,
      matchNo: true,
      matchDate: true,
    },
  });

  if (editableScheduledMatch) {
    console.log(
      `Match ${editableScheduledMatch.matchNo} already editable (${editableScheduledMatch.matchDate.toISOString()})`,
    );
    return;
  }

  const nextScheduledMatch = await prisma.match.findFirst({
    where: {
      seasonId,
      status: "SCHEDULED",
      matchDate: { gt: now },
    },
    orderBy: { matchDate: "asc" },
    select: {
      id: true,
      matchNo: true,
    },
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

  const teamMap = new Map(teams.map((team) => [team.shortCode, team.id]));

  for (const fixture of fixtures as Fixture[]) {
    const homeTeamId = teamMap.get(fixture.home);
    const awayTeamId = teamMap.get(fixture.away);

    if (!homeTeamId || !awayTeamId) {
      throw new Error(
        `Unknown team in fixture ${fixture.matchNo}: ${fixture.home} vs ${fixture.away}`,
      );
    }

    await prisma.match.upsert({
      where: {
        seasonId_matchNo: {
          seasonId,
          matchNo: fixture.matchNo,
        },
      },
      update: {
        matchDate: new Date(fixture.date),
        homeTeamId,
        awayTeamId,
        stadium: fixture.stadium,
        venue: fixture.venue,
        wisdenMatchGid: fixture.wisdenMatchGid,
      },
      create: {
        seasonId,
        matchNo: fixture.matchNo,
        matchDate: new Date(fixture.date),
        homeTeamId,
        awayTeamId,
        stadium: fixture.stadium,
        venue: fixture.venue,
        status: "SCHEDULED",
        matchResult: "PENDING",
        wisdenMatchGid: fixture.wisdenMatchGid,
      },
    });
  }

  if (enableTestUnlock) {
    await unlockOneScheduledMatchForTesting(prisma, seasonId);
  } else {
    console.log("Skipping test-unlock");
  }

  console.log(`Seeded ${fixtures.length} fixtures`);
}
