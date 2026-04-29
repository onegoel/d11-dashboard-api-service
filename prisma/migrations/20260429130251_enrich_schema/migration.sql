/*
  Warnings:

  - A unique constraint covering the columns `[cricbuzzTeamId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MatchFormat" AS ENUM ('T10', 'T20', 'ODI', 'TEST', 'OTHER');

-- CreateEnum
CREATE TYPE "TournamentType" AS ENUM ('BILATERAL', 'FRANCHISE_LEAGUE', 'TRI_SERIES', 'MULTI_NATION_TOURNAMENT', 'DOMESTIC_CUP', 'OTHER');

-- CreateEnum
CREATE TYPE "TournamentStage" AS ENUM ('LEAGUE', 'GROUP', 'SUPER_FOUR', 'SUPER_SIX', 'QUALIFIER', 'ELIMINATOR', 'SEMI_FINAL', 'FINAL', 'OTHER');

-- AlterTable
ALTER TABLE "FantasyPlayer" ADD COLUMN     "country" TEXT,
ADD COLUMN     "isInjured" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "format" "MatchFormat",
ADD COLUMN     "groundId" INTEGER,
ADD COLUMN     "groupName" TEXT,
ADD COLUMN     "isKnockout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roundNumber" INTEGER,
ADD COLUMN     "seriesName" TEXT,
ADD COLUMN     "seriesShortName" TEXT,
ADD COLUMN     "stageLabel" TEXT,
ADD COLUMN     "tournamentName" TEXT,
ADD COLUMN     "tournamentShortName" TEXT,
ADD COLUMN     "tournamentStage" "TournamentStage",
ADD COLUMN     "tournamentType" "TournamentType";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "aliases" JSONB,
ADD COLUMN     "captainName" TEXT,
ADD COLUMN     "coachName" TEXT,
ADD COLUMN     "colorAccent" TEXT,
ADD COLUMN     "colorPrimary" TEXT,
ADD COLUMN     "colorSecondary" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "cricbuzzTeamId" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "displayOrder" INTEGER,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "homeCity" TEXT,
ADD COLUMN     "homeGroundId" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "nickName" TEXT,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "stateOrRegion" TEXT;

-- CreateTable
CREATE TABLE "Ground" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "altitude" INTEGER,
    "capacity" INTEGER,
    "establishedYear" INTEGER,
    "pitchType" TEXT,
    "outfield" TEXT,
    "historicalTosses" INTEGER NOT NULL DEFAULT 0,
    "wisdenGroundId" TEXT,
    "timezone" TEXT,
    "hasFloodlights" BOOLEAN NOT NULL DEFAULT false,
    "isDomestic" BOOLEAN NOT NULL DEFAULT true,
    "isInternational" BOOLEAN NOT NULL DEFAULT false,
    "notableFeaturesJson" JSONB,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ground_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ground_wisdenGroundId_key" ON "Ground"("wisdenGroundId");

-- CreateIndex
CREATE INDEX "Ground_country_idx" ON "Ground"("country");

-- CreateIndex
CREATE INDEX "Ground_wisdenGroundId_idx" ON "Ground"("wisdenGroundId");

-- CreateIndex
CREATE INDEX "Ground_region_idx" ON "Ground"("region");

-- CreateIndex
CREATE INDEX "Match_format_idx" ON "Match"("format");

-- CreateIndex
CREATE INDEX "Match_tournamentType_idx" ON "Match"("tournamentType");

-- CreateIndex
CREATE INDEX "Match_tournamentStage_idx" ON "Match"("tournamentStage");

-- CreateIndex
CREATE INDEX "Match_isKnockout_idx" ON "Match"("isKnockout");

-- CreateIndex
CREATE UNIQUE INDEX "Team_cricbuzzTeamId_key" ON "Team"("cricbuzzTeamId");

-- CreateIndex
CREATE INDEX "Team_isActive_idx" ON "Team"("isActive");

-- CreateIndex
CREATE INDEX "Team_country_idx" ON "Team"("country");

-- CreateIndex
CREATE INDEX "Team_displayOrder_idx" ON "Team"("displayOrder");

-- CreateIndex
CREATE INDEX "Team_homeGroundId_idx" ON "Team"("homeGroundId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_homeGroundId_fkey" FOREIGN KEY ("homeGroundId") REFERENCES "Ground"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "Ground"("id") ON DELETE SET NULL ON UPDATE CASCADE;
