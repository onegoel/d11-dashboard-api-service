/*
  Warnings:

  - The `bowlingStyle` column on the `FantasyPlayer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BowlingStyle" AS ENUM ('PACE', 'SPIN');

-- AlterTable
ALTER TABLE "FantasyPlayer" DROP COLUMN "bowlingStyle",
ADD COLUMN     "bowlingStyle" "BowlingStyle";

-- AlterTable
ALTER TABLE "FantasySeasonLeaderboard" ADD COLUMN     "avgRank" DOUBLE PRECISION,
ADD COLUMN     "top3Finishes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "wisdenScoringFinalizedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "FantasyPlayerSeasonStats" (
    "fantasyPlayerId" TEXT NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "runsTotal" INTEGER NOT NULL DEFAULT 0,
    "ballsFacedTotal" INTEGER NOT NULL DEFAULT 0,
    "foursTotal" INTEGER NOT NULL DEFAULT 0,
    "sixesTotal" INTEGER NOT NULL DEFAULT 0,
    "highScore" INTEGER NOT NULL DEFAULT 0,
    "wicketsTotal" INTEGER NOT NULL DEFAULT 0,
    "ballsBowledTotal" INTEGER NOT NULL DEFAULT 0,
    "runsConcededTotal" INTEGER NOT NULL DEFAULT 0,
    "maidensTotal" INTEGER NOT NULL DEFAULT 0,
    "dotBallsTotal" INTEGER NOT NULL DEFAULT 0,
    "bestBowlingWickets" INTEGER NOT NULL DEFAULT 0,
    "bestBowlingRuns" INTEGER NOT NULL DEFAULT 0,
    "catchesTotal" INTEGER NOT NULL DEFAULT 0,
    "stumpingsTotal" INTEGER NOT NULL DEFAULT 0,
    "runOutsTotal" INTEGER NOT NULL DEFAULT 0,
    "fantasyPointsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fantasyPointsAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fantasyPointsBest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyPlayerSeasonStats_pkey" PRIMARY KEY ("fantasyPlayerId","seasonId")
);

-- CreateIndex
CREATE INDEX "FantasyPlayerSeasonStats_seasonId_idx" ON "FantasyPlayerSeasonStats"("seasonId");

-- CreateIndex
CREATE INDEX "FantasyPlayerSeasonStats_fantasyPlayerId_idx" ON "FantasyPlayerSeasonStats"("fantasyPlayerId");

-- AddForeignKey
ALTER TABLE "FantasyPlayerSeasonStats" ADD CONSTRAINT "FantasyPlayerSeasonStats_fantasyPlayerId_fkey" FOREIGN KEY ("fantasyPlayerId") REFERENCES "FantasyPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyPlayerSeasonStats" ADD CONSTRAINT "FantasyPlayerSeasonStats_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
