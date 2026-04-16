import { PrismaClient } from "../../generated/prisma/client.js";

export async function seedTeams(prisma: PrismaClient) {
  console.log("Seeding IPL teams...");

  const IPL_TEAMS = [
    {
      name: "Chennai Super Kings",
      shortName: "CSK",
    },
    {
      name: "Delhi Capitals",
      shortName: "DC",
    },
    {
      name: "Punjab Kings",
      shortName: "PBKS",
    },
    {
      name: "Kolkata Knight Riders",
      shortName: "KKR",
    },
    {
      name: "Mumbai Indians",
      shortName: "MI",
    },
    {
      name: "Rajasthan Royals",
      shortName: "RR",
    },
    {
      name: "Royal Challengers Bengaluru",
      shortName: "RCB",
    },
    {
      name: "Sunrisers Hyderabad",
      shortName: "SRH",
    },
    {
      name: "Gujarat Titans",
      shortName: "GT",
    },
    {
      name: "Lucknow Super Giants",
      shortName: "LSG",
    },
  ];

  await prisma.team.createMany({
    data: [
      { name: "Mumbai Indians", shortCode: "MI" },
      { name: "Chennai Super Kings", shortCode: "CSK" },
      { name: "Royal Challengers Bengaluru", shortCode: "RCB" },
      { name: "Kolkata Knight Riders", shortCode: "KKR" },
      { name: "Delhi Capitals", shortCode: "DC" },
      { name: "Rajasthan Royals", shortCode: "RR" },
      { name: "Sunrisers Hyderabad", shortCode: "SRH" },
      { name: "Punjab Kings", shortCode: "PBKS" },
      { name: "Gujarat Titans", shortCode: "GT" },
      { name: "Lucknow Super Giants", shortCode: "LSG" },
    ],
    skipDuplicates: true,
  });

  // Idempotent upsert to set CA team IDs based on short codes
  for (const team of IPL_TEAMS) {
    await prisma.team.upsert({
      where: { shortCode: team.shortName },
      update: {
        name: team.name,
        shortCode: team.shortName,
      },
      create: {
        name: team.name,
        shortCode: team.shortName,
      },
    });
  }

  console.log("Teams seeding completed.");
}
