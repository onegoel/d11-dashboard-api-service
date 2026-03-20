import { PrismaClient } from "../../generated/prisma/client.js";
export async function seedSeason(prisma) {
    console.log("Seeding season...");
    return prisma.season.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: "DPS D11 Cup 2026",
            year: 2026,
        },
    });
}
//# sourceMappingURL=seasons.seed.js.map