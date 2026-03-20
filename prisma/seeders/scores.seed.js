import { MatchStatus, PrismaClient } from "../../generated/prisma/client.js";
// Rank → leaderboard points (mirrors src/services/points-system.ts)
const RANK_POINTS = {
    1: 10,
    2: 7,
    3: 5,
    4: 3,
    5: 2,
    6: 1,
    7: 0,
    8: 0,
};
const pointsForRank = (rank) => RANK_POINTS[rank] ?? 0;
/**
 * Ranks for matches 1-15 (index 0 = match 1).
 * Inner array order maps to the player order below (PLAYER_ORDER).
 * Each row must be a permutation of 1-9.
 *
 * Players   : suryo, sart_wars, gamechangerjassibhai, goelball_gorillas,
 *             rohukannz, bigrickenergy, ujju, mayank, baksy
 * Indexes   :   0       1              2                3
 *               4          5              6      7       8
 */
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
];
/**
 * matchRanks[m][p] = rank of player p in match m+1.
 *
 * Match winners (rank 1):
 *   M1:  ujju       M2:  suryo      M3:  sart_wars  M4:  ujju
 *   M5:  suryo      M6:  rohukannz  M7:  ujju        M8:  sart_wars
 *   M9:  ujju       M10: suryo      M11: goelball    M12: ujju
 *   M13: rohukannz  M14: suryo      M15: ujju
 */
const matchRanks = [
    // M1  : ujju 1st, suryo 2nd, sart_wars 3rd
    [2, 3, 4, 9, 5, 6, 1, 7, 8],
    // M2  : suryo 1st, ujju 2nd, rohukannz 3rd
    [1, 5, 7, 4, 3, 6, 2, 9, 8],
    // M3  : sart_wars 1st, ujju 2nd, suryo 3rd
    [3, 1, 5, 4, 6, 7, 2, 8, 9],
    // M4  : ujju 1st, rohukannz 2nd, sart_wars 3rd
    [4, 3, 7, 6, 2, 5, 1, 9, 8],
    // M5  : suryo 1st, ujju 2nd, sart_wars 3rd
    [1, 3, 5, 6, 4, 8, 2, 7, 9],
    // M6  : rohukannz 1st, suryo 2nd, ujju 3rd
    [2, 4, 5, 7, 1, 6, 3, 8, 9],
    // M7  : ujju 1st, suryo 2nd, gamechangerjassibhai 3rd
    [2, 4, 3, 5, 6, 7, 1, 8, 9],
    // M8  : sart_wars 1st, rohukannz 2nd, ujju 3rd
    [4, 1, 5, 6, 2, 7, 3, 9, 8],
    // M9  : ujju 1st, gamechangerjassibhai 2nd, sart_wars 3rd
    [5, 3, 2, 7, 4, 6, 1, 8, 9],
    // M10 : suryo 1st, ujju 2nd, rohukannz 3rd
    [1, 4, 6, 7, 3, 5, 2, 9, 8],
    // M11 : goelball_gorillas 1st, suryo 2nd, ujju 3rd
    [2, 6, 4, 1, 5, 7, 3, 8, 9],
    // M12 : ujju 1st, suryo 2nd, sart_wars 3rd
    [2, 3, 6, 4, 7, 5, 1, 8, 9],
    // M13 : rohukannz 1st, ujju 2nd, suryo 3rd
    [3, 4, 5, 7, 1, 6, 2, 9, 8],
    // M14 : suryo 1st, sart_wars 2nd, ujju 3rd
    [1, 2, 5, 6, 4, 7, 3, 8, 9],
    // M15 : ujju 1st, suryo 2nd, sart_wars 3rd
    [2, 3, 6, 5, 4, 7, 1, 9, 8],
];
export async function seedScores(prisma, seasonId) {
    console.log("Seeding scores for matches 1-15...");
    // Fetch the first 15 matches ordered by matchNo
    const matches = await prisma.match.findMany({
        where: { seasonId },
        orderBy: { matchNo: "asc" },
        take: 15,
        select: { id: true, matchNo: true },
    });
    if (matches.length < 15) {
        console.warn(`Expected 15 matches but found ${matches.length}. ` +
            "Seeding scores only for available matches.");
    }
    // Resolve userName → seasonUserId
    const seasonUsers = await prisma.seasonUser.findMany({
        where: { seasonId },
        select: {
            id: true,
            user: { select: { user_name: true } },
        },
    });
    const userNameToSeasonUserId = new Map(seasonUsers.map((su) => [su.user.user_name, su.id]));
    // Validate all expected players are present
    for (const userName of PLAYER_ORDER) {
        if (!userNameToSeasonUserId.has(userName)) {
            throw new Error(`Season user not found for user_name="${userName}". ` +
                "Run seedUsers and seedSeasonUsers first.");
        }
    }
    for (let matchIdx = 0; matchIdx < matches.length; matchIdx++) {
        const match = matches[matchIdx];
        const ranks = matchRanks[matchIdx];
        if (!ranks) {
            console.warn(`No rank data for match index ${matchIdx}, skipping.`);
            continue;
        }
        console.log(`  Seeding scores for match ${match.matchNo} (id=${match.id})...`);
        await prisma.$transaction(async (tx) => {
            // Delete any existing scores for this match so upsert is clean
            await tx.score.deleteMany({ where: { matchId: match.id } });
            for (let playerIdx = 0; playerIdx < PLAYER_ORDER.length; playerIdx++) {
                const userName = PLAYER_ORDER[playerIdx];
                const rank = ranks[playerIdx];
                const points = pointsForRank(rank);
                const seasonUserId = userNameToSeasonUserId.get(userName);
                await tx.score.create({
                    data: {
                        seasonUserId,
                        matchId: match.id,
                        points,
                        rank,
                        rawScore: null,
                        effectiveScore: null,
                        secondaryRawScore: null,
                        chipPlayId: null,
                    },
                });
            }
            // Mark match as COMPLETED so leaderboard service includes it
            await tx.match.update({
                where: { id: match.id },
                data: { status: MatchStatus.COMPLETED },
            });
        });
        console.log(`  ✓ Match ${match.matchNo} seeded.`);
    }
    console.log("Scores seeding complete.");
}
//# sourceMappingURL=scores.seed.js.map