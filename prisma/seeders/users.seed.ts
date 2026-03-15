import { PrismaClient } from "../../generated/prisma/client.js";

export async function seedUsers(prisma: PrismaClient) {
  console.log("Seeding users...");

  const users = [
    {
      user_name: "suryo",
      last_name: "Nag",
      first_name: "Suryadeepto",
      display_name: "Suryo",
    },
    {
      user_name: "sart_wars",
      last_name: "Saxena",
      first_name: "Sarthak",
      display_name: "Sarthak",
    },
    {
      user_name: "gamechangerjassibhai",
      last_name: "Goel",
      first_name: "Aarav",
      display_name: "Aarav",
    },
    {
      user_name: "goelball_gorillas",
      last_name: "Goel",
      first_name: "Aryan",
      display_name: "Aryan",
    },
    {
      user_name: "rohukannz",
      last_name: "Kanna",
      first_name: "Rohan",
      display_name: "Kanna",
    },
    {
      user_name: "bigrickenergy",
      last_name: "Haldar",
      first_name: "Rikhil",
      display_name: "Rikhil",
    },
    {
      user_name: "ujju",
      last_name: "Agarwal",
      first_name: "Ujjwal",
      display_name: "Ujjwal",
    },
    {
      user_name: "mayank",
      last_name: "Agarwal",
      first_name: "Mayank",
      display_name: "Mayank",
    },
    {
      user_name: "baksy",
      last_name: "Baksy",
      first_name: "Aronya",
      display_name: "Aronya",
    },
  ] as const;

  for (const user of users) {
    await prisma.user.upsert({
      where: { user_name: user.user_name },
      update: {
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name,
      },
      create: user,
    });
  }
}
