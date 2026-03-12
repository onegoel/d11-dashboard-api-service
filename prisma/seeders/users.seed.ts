import { PrismaClient } from "../../generated/prisma/client.js";

export async function seedUsers(prisma: PrismaClient) {
  console.log("Seeding users...");

  await prisma.user.createMany({
    data: [
      { user_name: "suryo", last_name: "Nag", first_name: "Suryadeepto" },
      { user_name: "sart_wars", last_name: "Saxena", first_name: "Sarthak" },
      {
        user_name: "gamechangerjassibhai",
        last_name: "Goel",
        first_name: "Aarav",
      },
      {
        user_name: "goelball_gorillas",
        last_name: "Goel",
        first_name: "Aryan",
      },
      { user_name: "rohukannz", last_name: "Kanna", first_name: "Rohan" },
      { user_name: "bigrickenergy", last_name: "Haldar", first_name: "Rikhil" },
      { user_name: "ujju", last_name: "Agarwal", first_name: "Ujjwal" },
      { user_name: "mayank", last_name: "Agarwal", first_name: "Mayank" },
    ],
    skipDuplicates: true,
  });
}
