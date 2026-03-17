import { prisma, pool } from "./client.js";

import { seedUsers } from "./seeders/users.seed.js";
import { seedTeams } from "./seeders/teams.seed.js";
import { seedSeason } from "./seeders/seasons.seed.js";
import { seedSeasonUsers } from "./seeders/seasonUsers.seed.js";
import { seedFixtures } from "./seeders/matches.seed.js";
import { seedChipTypes } from "./seeders/chips.seed.js";

async function main() {
  console.log("Seeding database...");

  await seedUsers(prisma);
  await seedTeams(prisma);
  await seedChipTypes(prisma);
  const season = await seedSeason(prisma);
  await seedSeasonUsers(prisma, season.id);
  await seedFixtures(prisma, season.id);

  console.log("Seed complete");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
