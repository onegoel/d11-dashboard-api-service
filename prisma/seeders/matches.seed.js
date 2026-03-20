import { PrismaClient } from "../../generated/prisma/client.js";
import fixtures from "../data/ipl-2026/schedule-phase-1.json" with { type: "json" };
const unlockOneScheduledMatchForTesting = async (prisma, seasonId) => {
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
        console.log(`Match ${editableScheduledMatch.matchNo} already editable (${editableScheduledMatch.matchDate.toISOString()})`);
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
    console.log(`Unlocked match ${nextScheduledMatch.matchNo} for testing (${unlockedDate.toISOString()})`);
};
export async function seedFixtures(prisma, seasonId) {
    console.log("Seeding fixtures...");
    const teams = await prisma.team.findMany();
    const teamMap = new Map(teams.map((team) => [team.shortCode, team.id]));
    for (const fixture of fixtures) {
        const homeTeamId = teamMap.get(fixture.home);
        const awayTeamId = teamMap.get(fixture.away);
        if (!homeTeamId || !awayTeamId) {
            throw new Error(`Unknown team in fixture ${fixture.match_no}: ${fixture.home} vs ${fixture.away}`);
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
                homeTeamId,
                awayTeamId,
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
    await unlockOneScheduledMatchForTesting(prisma, seasonId);
    console.log(`Seeded ${fixtures.length} fixtures`);
}
//# sourceMappingURL=matches.seed.js.map