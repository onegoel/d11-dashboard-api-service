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
}
