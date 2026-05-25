import {
  MatchResult,
  MatchStatus,
  PrismaClient,
} from "../../generated/prisma/client.js";

// Rank → leaderboard points (mirrors src/services/points-system.ts)
const RANK_POINTS: Record<number, number> = {
  1: 10,
  2: 7,
  3: 5,
  4: 3,
  5: 2,
  6: 1,
  7: 0,
  8: 0,
};

const pointsForRank = (rank: number) => RANK_POINTS[rank] ?? 0;

const getSeededMatchResult = (matchNo: number): MatchResult =>
  matchNo % 2 === 0 ? MatchResult.AWAY_WIN : MatchResult.HOME_WIN;

const PLAYER_ORDER = [
  "suryo",
  "sart_wars",
  "gamechangerjassibhai",
  "goelball_gorillas",
  "rohukannz",
  "bigrickenergy",
  "ujju",
  "mayank",
  "baksy",
] as const;

const TOTAL_MATCHES = 72; // 70 league + Q1 + Eliminator
const DNP_CHANCE = 0.08;  // ~8% chance each player sits out a match

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function randomRanks(playerCount: number): (number | null)[] {
  const result: (number | null)[] = Array(playerCount).fill(null);
  const playing = Array.from({ length: playerCount }, (_, i) => i).filter(
    () => Math.random() > DNP_CHANCE,
  );
  shuffle(playing).forEach((playerIdx, rank) => {
    result[playerIdx] = rank + 1;
  });
  return result;
}

export async function seedScores(prisma: PrismaClient, seasonId: number) {
  console.log(
    `Seeding scores for up to ${TOTAL_MATCHES} matches (league + Q1 + Eliminator)...`,
  );

  const matches = await prisma.match.findMany({
    where: { seasonId },
    orderBy: { matchNo: "asc" },
    take: TOTAL_MATCHES,
    select: { id: true, matchNo: true },
  });

  if (matches.length < TOTAL_MATCHES) {
    console.warn(
      `Found ${matches.length} of ${TOTAL_MATCHES} expected matches — ` +
        "scores will be seeded for available matches only.",
    );
  }

  const seasonUsers = await prisma.seasonUser.findMany({
    where: { seasonId },
    select: { id: true, user: { select: { user_name: true } } },
  });

  const userNameToSeasonUserId = new Map(
    seasonUsers.map((su) => [su.user.user_name, su.id]),
  );

  for (const userName of PLAYER_ORDER) {
    if (!userNameToSeasonUserId.has(userName)) {
      throw new Error(
        `Season user not found for user_name="${userName}". ` +
          "Run seedUsers and seedSeasonUsers first.",
      );
    }
  }

  for (const match of matches) {
    const ranks = randomRanks(PLAYER_ORDER.length);

    await prisma.$transaction(async (tx) => {
      await tx.score.deleteMany({ where: { matchId: match.id } });

      for (let playerIdx = 0; playerIdx < PLAYER_ORDER.length; playerIdx++) {
        const rank = ranks[playerIdx];
        if (rank === null || rank === undefined) continue;

        await tx.score.create({
          data: {
            seasonUserId: userNameToSeasonUserId.get(PLAYER_ORDER[playerIdx]!)!,
            matchId: match.id,
            points: pointsForRank(rank),
            rank,
            rawScore: null,
            effectiveScore: null,
            secondaryRawScore: null,
            chipPlayId: null,
          },
        });
      }

      await tx.match.update({
        where: { id: match.id },
        data: {
          status: MatchStatus.COMPLETED,
          matchResult: getSeededMatchResult(match.matchNo),
        },
      });
    });

    console.log(`  ✓ Match ${match.matchNo} seeded.`);
  }

  console.log("Scores seeding complete.");
}
