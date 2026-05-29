/*
  Warnings:

  - A unique constraint covering the columns `[wisdenPlayerId]` on the table `FantasyPlayer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[wisdenMatchGid]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[wisdenTeamId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FantasyEntryPlayer" ADD COLUMN     "wisdenPlayerId" TEXT;

-- AlterTable
ALTER TABLE "FantasyMatchPlayer" ADD COLUMN     "teamWisdenId" TEXT,
ADD COLUMN     "wisdenMatchGid" TEXT,
ADD COLUMN     "wisdenPlayerId" TEXT;

-- AlterTable
ALTER TABLE "FantasyPlayer" ADD COLUMN     "battingHand" TEXT,
ADD COLUMN     "bowlingHand" TEXT,
ADD COLUMN     "bowlingStyle" TEXT,
ADD COLUMN     "teamWisdenId" TEXT,
ADD COLUMN     "wisdenPlayerId" TEXT;

-- AlterTable
ALTER TABLE "FantasyPlayerScore" ADD COLUMN     "wisdenMatchGid" TEXT,
ADD COLUMN     "wisdenPlayerId" TEXT;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "wisdenLastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "wisdenMatchGid" TEXT,
ADD COLUMN     "wisdenScore" JSONB,
ADD COLUMN     "wisdenStatus" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "wisdenTeamId" TEXT;

-- CreateIndex
CREATE INDEX "FantasyEntryPlayer_wisdenPlayerId_idx" ON "FantasyEntryPlayer"("wisdenPlayerId");

-- CreateIndex
CREATE INDEX "FantasyMatchPlayer_wisdenMatchGid_idx" ON "FantasyMatchPlayer"("wisdenMatchGid");

-- CreateIndex
CREATE INDEX "FantasyMatchPlayer_wisdenPlayerId_idx" ON "FantasyMatchPlayer"("wisdenPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "FantasyPlayer_wisdenPlayerId_key" ON "FantasyPlayer"("wisdenPlayerId");

-- CreateIndex
CREATE INDEX "FantasyPlayer_teamWisdenId_idx" ON "FantasyPlayer"("teamWisdenId");

-- CreateIndex
CREATE INDEX "FantasyPlayerScore_wisdenPlayerId_idx" ON "FantasyPlayerScore"("wisdenPlayerId");

-- CreateIndex
CREATE INDEX "FantasyPlayerScore_wisdenMatchGid_idx" ON "FantasyPlayerScore"("wisdenMatchGid");

-- CreateIndex
CREATE UNIQUE INDEX "Match_wisdenMatchGid_key" ON "Match"("wisdenMatchGid");

-- CreateIndex
CREATE INDEX "Match_wisdenMatchGid_idx" ON "Match"("wisdenMatchGid");

-- CreateIndex
CREATE UNIQUE INDEX "Team_wisdenTeamId_key" ON "Team"("wisdenTeamId");
