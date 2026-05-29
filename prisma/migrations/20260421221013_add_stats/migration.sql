-- AlterTable
ALTER TABLE "FantasyMatchPlayer" ADD COLUMN     "battingPosition" INTEGER;

-- AlterTable
ALTER TABLE "FantasyPlayer" ADD COLUMN     "bowlingTechnique" TEXT;

-- CreateTable
CREATE TABLE "FantasyPlayerMatchStats" (
    "fantasyPlayerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "ballsFaced" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "battingPosition" INTEGER,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "ballsBowled" INTEGER NOT NULL DEFAULT 0,
    "runsConceded" INTEGER NOT NULL DEFAULT 0,
    "maidens" INTEGER NOT NULL DEFAULT 0,
    "dotBalls" INTEGER NOT NULL DEFAULT 0,
    "catches" INTEGER NOT NULL DEFAULT 0,
    "stumpings" INTEGER NOT NULL DEFAULT 0,
    "runOutDirect" INTEGER NOT NULL DEFAULT 0,
    "runOutAssist" INTEGER NOT NULL DEFAULT 0,
    "battingImpact" DOUBLE PRECISION DEFAULT 0,
    "boundaryScoredPct" DOUBLE PRECISION DEFAULT 0,
    "dotsPlayedPct" DOUBLE PRECISION DEFAULT 0,
    "bowlingImpactViz" DOUBLE PRECISION DEFAULT 0,
    "played" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FantasyPlayerMatchStats_pkey" PRIMARY KEY ("fantasyPlayerId","matchId")
);

-- CreateTable
CREATE TABLE "FantasyPlayerShotData" (
    "fantasyPlayerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "paceRuns" INTEGER NOT NULL DEFAULT 0,
    "paceBalls" INTEGER NOT NULL DEFAULT 0,
    "paceBoundaries" INTEGER NOT NULL DEFAULT 0,
    "spinRuns" INTEGER NOT NULL DEFAULT 0,
    "spinBalls" INTEGER NOT NULL DEFAULT 0,
    "spinBoundaries" INTEGER NOT NULL DEFAULT 0,
    "zone1Balls" INTEGER NOT NULL DEFAULT 0,
    "zone1Runs" INTEGER NOT NULL DEFAULT 0,
    "zone2Balls" INTEGER NOT NULL DEFAULT 0,
    "zone2Runs" INTEGER NOT NULL DEFAULT 0,
    "zone3Balls" INTEGER NOT NULL DEFAULT 0,
    "zone3Runs" INTEGER NOT NULL DEFAULT 0,
    "zone4Balls" INTEGER NOT NULL DEFAULT 0,
    "zone4Runs" INTEGER NOT NULL DEFAULT 0,
    "zone5Balls" INTEGER NOT NULL DEFAULT 0,
    "zone5Runs" INTEGER NOT NULL DEFAULT 0,
    "zone6Balls" INTEGER NOT NULL DEFAULT 0,
    "zone6Runs" INTEGER NOT NULL DEFAULT 0,
    "zone7Balls" INTEGER NOT NULL DEFAULT 0,
    "zone7Runs" INTEGER NOT NULL DEFAULT 0,
    "zone8Balls" INTEGER NOT NULL DEFAULT 0,
    "zone8Runs" INTEGER NOT NULL DEFAULT 0,
    "caughtVsPaceCount" INTEGER NOT NULL DEFAULT 0,
    "caughtVsSpinCount" INTEGER NOT NULL DEFAULT 0,
    "caughtZone1Count" INTEGER NOT NULL DEFAULT 0,
    "caughtZone2Count" INTEGER NOT NULL DEFAULT 0,
    "caughtZone3Count" INTEGER NOT NULL DEFAULT 0,
    "caughtZone4Count" INTEGER NOT NULL DEFAULT 0,
    "caughtZone5Count" INTEGER NOT NULL DEFAULT 0,
    "caughtZone6Count" INTEGER NOT NULL DEFAULT 0,
    "caughtZone7Count" INTEGER NOT NULL DEFAULT 0,
    "caughtZone8Count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FantasyPlayerShotData_pkey" PRIMARY KEY ("fantasyPlayerId","matchId")
);

-- CreateTable
CREATE TABLE "FantasySeasonLeaderboard" (
    "seasonId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalPoints" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "adjustedPoints" DOUBLE PRECISION,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasySeasonLeaderboard_pkey" PRIMARY KEY ("seasonId","userId")
);

-- CreateIndex
CREATE INDEX "FantasyPlayerMatchStats_matchId_idx" ON "FantasyPlayerMatchStats"("matchId");

-- CreateIndex
CREATE INDEX "FantasyPlayerMatchStats_fantasyPlayerId_idx" ON "FantasyPlayerMatchStats"("fantasyPlayerId");

-- CreateIndex
CREATE INDEX "FantasyPlayerShotData_matchId_idx" ON "FantasyPlayerShotData"("matchId");

-- CreateIndex
CREATE INDEX "FantasyPlayerShotData_fantasyPlayerId_idx" ON "FantasyPlayerShotData"("fantasyPlayerId");

-- CreateIndex
CREATE INDEX "FantasySeasonLeaderboard_seasonId_idx" ON "FantasySeasonLeaderboard"("seasonId");

-- AddForeignKey
ALTER TABLE "FantasySeasonLeaderboard" ADD CONSTRAINT "FantasySeasonLeaderboard_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasySeasonLeaderboard" ADD CONSTRAINT "FantasySeasonLeaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
