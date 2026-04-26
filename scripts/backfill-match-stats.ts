/**
 * Backfill FantasyPlayerMatchStats + FantasyMatchPlayer.battingPosition
 * for all completed, Wisden-linked matches.
 *
 * Run:
 *   npm run backfill:match-stats
 *   # or for a single match:
 *   MATCH_ID=<id> npm run backfill:match-stats
 */
import "dotenv/config";
import { prisma } from "../prisma/client.js";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN ?? "";
const DELAY_MS = 500; // be gentle on Wisden's API rate limits

const singleMatchId = process.env.MATCH_ID ?? null;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scoreMatch(matchId: string): Promise<boolean> {
  const url = `${BASE_URL}/fantasy/matches/${matchId}/score`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`  ✗ ${matchId} → HTTP ${res.status}: ${body}`);
    return false;
  }

  const data = await res.json().catch(() => ({}));
  console.log(
    `  ✓ ${matchId} → scored=${data.scored ?? "?"} ranked=${data.ranked ?? "?"}`,
  );
  return true;
}

async function main() {
  const matches = singleMatchId
    ? await prisma.match.findMany({
        where: { id: singleMatchId, wisdenMatchGid: { not: null } },
        select: { id: true, wisdenMatchGid: true },
      })
    : await prisma.match.findMany({
        where: {
          status: "COMPLETED",
          wisdenMatchGid: { not: null },
        },
        orderBy: { startTime: "desc" },
        select: { id: true, wisdenMatchGid: true },
      });

  if (matches.length === 0) {
    console.log("No matches found to backfill.");
    return;
  }

  console.log(`Backfilling ${matches.length} match(es)...\n`);

  let ok = 0;
  let failed = 0;

  for (const match of matches) {
    const success = await scoreMatch(match.id);
    if (success) ok++;
    else failed++;
    await sleep(DELAY_MS);
  }

  console.log(`\nDone. ✓ ${ok} succeeded, ✗ ${failed} failed.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
