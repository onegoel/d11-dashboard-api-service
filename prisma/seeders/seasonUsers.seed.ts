import { PrismaClient } from "../../generated/prisma/client.js";

export async function seedSeasonUsers(prisma: PrismaClient, seasonId: number) {
  console.log("Seeding season users...");

  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.seasonUser.upsert({
      where: {
        seasonId_userId: {
          seasonId,
          userId: user.id,
        },
      },
      update: {},
      create: {
        seasonId,
        userId: user.id,
        teamName: `${user.display_name}'s Team`,
      },
    });
  }
}
