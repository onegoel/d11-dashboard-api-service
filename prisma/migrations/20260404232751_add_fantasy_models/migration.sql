/*
  Warnings:

  - You are about to drop the column `cricApiLastSyncedAt` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `cricApiMatchId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `cricApiScore` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `cricApiStatus` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `cricApiSeriesId` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `cricbuzzTeamId` on the `Team` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[caMatchId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[caSeriesId]` on the table `Season` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[caTeamId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FantasyPlayerRole" AS ENUM ('BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER');

-- CreateEnum
CREATE TYPE "FantasyContestStatus" AS ENUM ('OPEN', 'LOCKED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_seasonId_fkey";

-- DropIndex
DROP INDEX "Match_cricApiMatchId_key";

-- DropIndex
DROP INDEX "Season_cricApiSeriesId_key";

-- DropIndex
DROP INDEX "Team_cricbuzzTeamId_key";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "cricApiLastSyncedAt",
DROP COLUMN "cricApiMatchId",
DROP COLUMN "cricApiScore",
DROP COLUMN "cricApiStatus",
ADD COLUMN     "caLastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "caMatchId" TEXT,
ADD COLUMN     "caScore" JSONB,
ADD COLUMN     "caStatus" TEXT,
ALTER COLUMN "seasonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Season" DROP COLUMN "cricApiSeriesId",
ADD COLUMN     "caSeriesId" TEXT;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "cricbuzzTeamId",
ADD COLUMN     "caTeamId" TEXT;

-- CreateTable
CREATE TABLE "FantasyPlayer" (
    "id" TEXT NOT NULL,
    "caPlayerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "FantasyPlayerRole" NOT NULL,
    "teamId" TEXT,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FantasyMatchPlayer" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "fantasyPlayerId" TEXT NOT NULL,
    "creditValue" DOUBLE PRECISION NOT NULL,
    "isInPlayingXI" BOOLEAN NOT NULL DEFAULT false,
    "selectionPct" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyMatchPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FantasyContest" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "status" "FantasyContestStatus" NOT NULL DEFAULT 'OPEN',
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyContest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FantasyContestEntry" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamNo" INTEGER NOT NULL DEFAULT 1,
    "chipCode" "ChipCode",
    "totalPoints" DOUBLE PRECISION,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyContestEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FantasyEntryPlayer" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "fantasyPlayerId" TEXT NOT NULL,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "isViceCaptain" BOOLEAN NOT NULL DEFAULT false,
    "points" DOUBLE PRECISION,
    "isBench" BOOLEAN NOT NULL DEFAULT false,
    "benchPriority" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyEntryPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FantasyPlayerScore" (
    "id" TEXT NOT NULL,
    "fantasyPlayerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyPlayerScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FantasyPlayer_caPlayerId_key" ON "FantasyPlayer"("caPlayerId");

-- CreateIndex
CREATE INDEX "FantasyPlayer_teamId_idx" ON "FantasyPlayer"("teamId");

-- CreateIndex
CREATE INDEX "FantasyMatchPlayer_matchId_idx" ON "FantasyMatchPlayer"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "FantasyMatchPlayer_matchId_fantasyPlayerId_key" ON "FantasyMatchPlayer"("matchId", "fantasyPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "FantasyContest_matchId_key" ON "FantasyContest"("matchId");

-- CreateIndex
CREATE INDEX "FantasyContest_status_idx" ON "FantasyContest"("status");

-- CreateIndex
CREATE INDEX "FantasyContestEntry_contestId_idx" ON "FantasyContestEntry"("contestId");

-- CreateIndex
CREATE INDEX "FantasyContestEntry_userId_idx" ON "FantasyContestEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FantasyContestEntry_contestId_userId_teamNo_key" ON "FantasyContestEntry"("contestId", "userId", "teamNo");

-- CreateIndex
CREATE INDEX "FantasyEntryPlayer_entryId_idx" ON "FantasyEntryPlayer"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "FantasyEntryPlayer_entryId_fantasyPlayerId_key" ON "FantasyEntryPlayer"("entryId", "fantasyPlayerId");

-- CreateIndex
CREATE INDEX "FantasyPlayerScore_matchId_idx" ON "FantasyPlayerScore"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "FantasyPlayerScore_fantasyPlayerId_matchId_key" ON "FantasyPlayerScore"("fantasyPlayerId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_caMatchId_key" ON "Match"("caMatchId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_caSeriesId_key" ON "Season"("caSeriesId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_caTeamId_key" ON "Team"("caTeamId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyPlayer" ADD CONSTRAINT "FantasyPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyMatchPlayer" ADD CONSTRAINT "FantasyMatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyMatchPlayer" ADD CONSTRAINT "FantasyMatchPlayer_fantasyPlayerId_fkey" FOREIGN KEY ("fantasyPlayerId") REFERENCES "FantasyPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyContest" ADD CONSTRAINT "FantasyContest_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyContestEntry" ADD CONSTRAINT "FantasyContestEntry_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "FantasyContest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyContestEntry" ADD CONSTRAINT "FantasyContestEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyEntryPlayer" ADD CONSTRAINT "FantasyEntryPlayer_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "FantasyContestEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyEntryPlayer" ADD CONSTRAINT "FantasyEntryPlayer_fantasyPlayerId_fkey" FOREIGN KEY ("fantasyPlayerId") REFERENCES "FantasyPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyPlayerScore" ADD CONSTRAINT "FantasyPlayerScore_fantasyPlayerId_fkey" FOREIGN KEY ("fantasyPlayerId") REFERENCES "FantasyPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FantasyPlayerScore" ADD CONSTRAINT "FantasyPlayerScore_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
