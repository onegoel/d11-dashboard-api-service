import { PrismaClient } from "../../generated/prisma/client.js";
import fixtures from "../data/ipl-2026/schedule-phase-1.json" with { type: "json" };

type Fixture = {
  match_no: number;
  home: string;
  away: string;
  date: string;
};

export async function seedFixtures(prisma: PrismaClient, seasonId: number) {
  console.log("Seeding fixtures...");

  const teams = await prisma.team.findMany();

  const teamMap = new Map(teams.map((team) => [team.shortCode, team.id]));

  for (const fixture of fixtures as Fixture[]) {
    const homeTeamId = teamMap.get(fixture.home);
    const awayTeamId = teamMap.get(fixture.away);

    if (!homeTeamId || !awayTeamId) {
      throw new Error(
        `Unknown team in fixture ${fixture.match_no}: ${fixture.home} vs ${fixture.away}`,
      );
    }

    await prisma.match.upsert({
      where: {
        seasonId_matchNo: {
          seasonId,
          matchNo: fixture.match_no,
        },
      },
      update: {
        matchDate: new Date(fixture.date),
      },
      create: {
        seasonId,
        matchNo: fixture.match_no,
        matchDate: new Date(fixture.date),
        homeTeamId,
        awayTeamId,
      },
    });
  }

  console.log(`Seeded ${fixtures.length} fixtures`);
}
