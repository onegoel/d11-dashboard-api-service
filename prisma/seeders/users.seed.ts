import { PrismaClient } from "../../generated/prisma/client.js";

export async function seedUsers(prisma: PrismaClient) {
  console.log("Seeding users...");

  await prisma.user.createMany({
    data: [
      { name: "Suryo" },
      { name: "Sarthak" },
      { name: "Aarav" },
      { name: "Aryan" },
      { name: "Kanna" },
      { name: "Rikhil" },
      { name: "Ujjwal" },
      { name: "Mayank" },
    ],
    skipDuplicates: true,
  });
}
