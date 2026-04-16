import { prisma, pool } from "./client.js";

import { seedUsers } from "./seeders/users.seed.js";
import { seedTeams } from "./seeders/teams.seed.js";
import { seedSeason } from "./seeders/seasons.seed.js";
import { seedSeasonUsers } from "./seeders/seasonUsers.seed.js";
import { seedFixtures } from "./seeders/matches.seed.js";
import { seedSquads } from "./seeders/squads.seed.js";
import { seedChipTypes } from "./seeders/chips.seed.js";
import { seedScores } from "./seeders/scores.seed.js";

async function main() {
  console.log("Seeding database...");

  const isProd = process.env.SEED_ENV === "production";
  const enableTestUnlock =
    process.env.SEED_ENABLE_TEST_UNLOCK === "true" && !isProd;

  // Reference data — safe for prod
  await seedTeams(prisma);
  await seedChipTypes(prisma);
  const season = await seedSeason(prisma);
  await seedFixtures(prisma, season.id, enableTestUnlock);
  await seedSquads(prisma);

  if (!isProd) {
    // Dev/test data only
    await seedUsers(prisma);
    await seedSeasonUsers(prisma, season.id);
    await seedScores(prisma, season.id);
  } else {
    console.log("Skipping user/score seeders (SEED_ENV=production)");
  }

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
