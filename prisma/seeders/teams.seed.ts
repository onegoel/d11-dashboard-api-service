import { PrismaClient } from "../../generated/prisma/client.js";

export async function seedTeams(prisma: PrismaClient) {
  console.log("Seeding IPL teams...");

  await prisma.team.createMany({
    data: [
      { name: "Mumbai Indians", shortCode: "MI" },
      { name: "Chennai Super Kings", shortCode: "CSK" },
      { name: "Royal Challengers Bangalore", shortCode: "RCB" },
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

  // Update existing teams with Cricbuzz team IDs
  const teamUpdates = [
    { shortCode: "MI", cricbuzzTeamId: "62" },
    { shortCode: "CSK", cricbuzzTeamId: "58" },
    { shortCode: "RCB", cricbuzzTeamId: "59" },
    { shortCode: "KKR", cricbuzzTeamId: "63" },
    { shortCode: "DC", cricbuzzTeamId: "61" },
    { shortCode: "RR", cricbuzzTeamId: "64" },
    { shortCode: "SRH", cricbuzzTeamId: "255" },
    { shortCode: "PBKS", cricbuzzTeamId: "65" },
    { shortCode: "GT", cricbuzzTeamId: "971" },
    { shortCode: "LSG", cricbuzzTeamId: "966" },
  ];

  // Idempotently update teams with Cricbuzz IDs
  for (const { shortCode, cricbuzzTeamId } of teamUpdates) {
    await prisma.team.updateMany({
      where: { shortCode },
      data: { cricbuzzTeamId },
    });
  }

  console.log("Teams seeding completed.");
}
