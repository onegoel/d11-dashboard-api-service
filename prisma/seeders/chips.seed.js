import { ChipCode, PrismaClient } from "../../generated/prisma/client.js";
const chipSeeds = [
    {
        code: ChipCode.DOUBLE_TEAM,
        name: "Double Team",
        description: "Submit two Dream11 scores for a match. The higher score is used for leaderboard ranking.",
        multiplier: 1,
        maxUsesPerSeason: 2,
        effectWindowMatches: 1,
        requiresBottomHalf: false,
        usesSecondaryTeamScore: true,
    },
    {
        code: ChipCode.COMEBACK_KID,
        name: "Comeback Kid",
        description: "Bottom-half players can boost Dream11 score by 1.1x for 3 consecutive matches.",
        multiplier: 1.1,
        maxUsesPerSeason: 2,
        effectWindowMatches: 3,
        requiresBottomHalf: true,
        usesSecondaryTeamScore: false,
    },
];
export async function seedChipTypes(prisma) {
    console.log("Seeding chip types...");
    for (const chip of chipSeeds) {
        await prisma.chipType.upsert({
            where: {
                code: chip.code,
            },
            update: {
                name: chip.name,
                description: chip.description,
                multiplier: chip.multiplier,
                maxUsesPerSeason: chip.maxUsesPerSeason,
                effectWindowMatches: chip.effectWindowMatches,
                requiresBottomHalf: chip.requiresBottomHalf,
                usesSecondaryTeamScore: chip.usesSecondaryTeamScore,
            },
            create: chip,
        });
    }
}
//# sourceMappingURL=chips.seed.js.map