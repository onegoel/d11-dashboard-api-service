/*
  Warnings:

  - A unique constraint covering the columns `[my11SeriesId]` on the table `Season` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FantasyEntryPlayer" ADD COLUMN     "caPlayerId" TEXT,
ADD COLUMN     "my11PlayerId" TEXT;

-- AlterTable
ALTER TABLE "FantasyMatchPlayer" ADD COLUMN     "caMatchId" TEXT,
ADD COLUMN     "caPlayerId" TEXT,
ADD COLUMN     "my11MatchId" TEXT,
ADD COLUMN     "my11PlayerId" TEXT,
ADD COLUMN     "teamCaId" TEXT,
ADD COLUMN     "teamMy11Id" TEXT;

-- AlterTable
ALTER TABLE "FantasyPlayer" ADD COLUMN     "teamCaId" TEXT,
ADD COLUMN     "teamMy11Id" TEXT;

-- AlterTable
ALTER TABLE "FantasyPlayerScore" ADD COLUMN     "caMatchId" TEXT,
ADD COLUMN     "caPlayerId" TEXT,
ADD COLUMN     "my11MatchId" TEXT,
ADD COLUMN     "my11PlayerId" TEXT;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "awayTeamCaId" TEXT,
ADD COLUMN     "awayTeamMy11Id" TEXT,
ADD COLUMN     "homeTeamCaId" TEXT,
ADD COLUMN     "homeTeamMy11Id" TEXT,
ADD COLUMN     "seasonCaSeriesId" TEXT,
ADD COLUMN     "seasonMy11SeriesId" TEXT;

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "my11SeriesId" TEXT;

-- CreateIndex
CREATE INDEX "FantasyEntryPlayer_caPlayerId_idx" ON "FantasyEntryPlayer"("caPlayerId");

-- CreateIndex
CREATE INDEX "FantasyEntryPlayer_my11PlayerId_idx" ON "FantasyEntryPlayer"("my11PlayerId");

-- CreateIndex
CREATE INDEX "FantasyMatchPlayer_caMatchId_idx" ON "FantasyMatchPlayer"("caMatchId");

-- CreateIndex
CREATE INDEX "FantasyMatchPlayer_my11MatchId_idx" ON "FantasyMatchPlayer"("my11MatchId");

-- CreateIndex
CREATE INDEX "FantasyMatchPlayer_caPlayerId_idx" ON "FantasyMatchPlayer"("caPlayerId");

-- CreateIndex
CREATE INDEX "FantasyMatchPlayer_my11PlayerId_idx" ON "FantasyMatchPlayer"("my11PlayerId");

-- CreateIndex
CREATE INDEX "FantasyPlayer_teamCaId_idx" ON "FantasyPlayer"("teamCaId");

-- CreateIndex
CREATE INDEX "FantasyPlayer_teamMy11Id_idx" ON "FantasyPlayer"("teamMy11Id");

-- CreateIndex
CREATE INDEX "FantasyPlayerScore_caPlayerId_idx" ON "FantasyPlayerScore"("caPlayerId");

-- CreateIndex
CREATE INDEX "FantasyPlayerScore_my11PlayerId_idx" ON "FantasyPlayerScore"("my11PlayerId");

-- CreateIndex
CREATE INDEX "FantasyPlayerScore_caMatchId_idx" ON "FantasyPlayerScore"("caMatchId");

-- CreateIndex
CREATE INDEX "FantasyPlayerScore_my11MatchId_idx" ON "FantasyPlayerScore"("my11MatchId");

-- CreateIndex
CREATE INDEX "Match_homeTeamCaId_idx" ON "Match"("homeTeamCaId");

-- CreateIndex
CREATE INDEX "Match_homeTeamMy11Id_idx" ON "Match"("homeTeamMy11Id");

-- CreateIndex
CREATE INDEX "Match_awayTeamCaId_idx" ON "Match"("awayTeamCaId");

-- CreateIndex
CREATE INDEX "Match_awayTeamMy11Id_idx" ON "Match"("awayTeamMy11Id");

-- CreateIndex
CREATE INDEX "Match_seasonCaSeriesId_idx" ON "Match"("seasonCaSeriesId");

-- CreateIndex
CREATE INDEX "Match_seasonMy11SeriesId_idx" ON "Match"("seasonMy11SeriesId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_my11SeriesId_key" ON "Season"("my11SeriesId");
