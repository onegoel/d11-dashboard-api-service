/*
  Warnings:

  - You are about to drop the column `caPlayerId` on the `FantasyEntryPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `my11PlayerId` on the `FantasyEntryPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `caMatchId` on the `FantasyMatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `caPlayerId` on the `FantasyMatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `my11MatchId` on the `FantasyMatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `my11PlayerId` on the `FantasyMatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `teamCaId` on the `FantasyMatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `teamMy11Id` on the `FantasyMatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `caPlayerId` on the `FantasyPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `my11CreditValue` on the `FantasyPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `my11IsInjured` on the `FantasyPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `my11PlayerId` on the `FantasyPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `my11PointsOverall` on the `FantasyPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `teamCaId` on the `FantasyPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `teamMy11Id` on the `FantasyPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `caMatchId` on the `FantasyPlayerScore` table. All the data in the column will be lost.
  - You are about to drop the column `caPlayerId` on the `FantasyPlayerScore` table. All the data in the column will be lost.
  - You are about to drop the column `my11MatchId` on the `FantasyPlayerScore` table. All the data in the column will be lost.
  - You are about to drop the column `my11PlayerId` on the `FantasyPlayerScore` table. All the data in the column will be lost.
  - You are about to drop the column `awayTeamCaId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `awayTeamMy11Id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `caLastSyncedAt` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `caMatchId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `caScore` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `caStatus` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamCaId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamMy11Id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `my11MatchId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `seasonCaSeriesId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `seasonMy11SeriesId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `caSeriesId` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `my11SeriesId` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `caTeamId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `my11TeamId` on the `Team` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FantasyEntryPlayer_caPlayerId_idx";

-- DropIndex
DROP INDEX "FantasyEntryPlayer_my11PlayerId_idx";

-- DropIndex
DROP INDEX "FantasyMatchPlayer_caMatchId_idx";

-- DropIndex
DROP INDEX "FantasyMatchPlayer_caPlayerId_idx";

-- DropIndex
DROP INDEX "FantasyMatchPlayer_my11MatchId_idx";

-- DropIndex
DROP INDEX "FantasyMatchPlayer_my11PlayerId_idx";

-- DropIndex
DROP INDEX "FantasyPlayer_caPlayerId_key";

-- DropIndex
DROP INDEX "FantasyPlayer_my11PlayerId_key";

-- DropIndex
DROP INDEX "FantasyPlayer_teamCaId_idx";

-- DropIndex
DROP INDEX "FantasyPlayer_teamMy11Id_idx";

-- DropIndex
DROP INDEX "FantasyPlayerScore_caMatchId_idx";

-- DropIndex
DROP INDEX "FantasyPlayerScore_caPlayerId_idx";

-- DropIndex
DROP INDEX "FantasyPlayerScore_my11MatchId_idx";

-- DropIndex
DROP INDEX "FantasyPlayerScore_my11PlayerId_idx";

-- DropIndex
DROP INDEX "Match_awayTeamCaId_idx";

-- DropIndex
DROP INDEX "Match_awayTeamMy11Id_idx";

-- DropIndex
DROP INDEX "Match_caMatchId_key";

-- DropIndex
DROP INDEX "Match_homeTeamCaId_idx";

-- DropIndex
DROP INDEX "Match_homeTeamMy11Id_idx";

-- DropIndex
DROP INDEX "Match_my11MatchId_key";

-- DropIndex
DROP INDEX "Match_seasonCaSeriesId_idx";

-- DropIndex
DROP INDEX "Match_seasonMy11SeriesId_idx";

-- DropIndex
DROP INDEX "Season_caSeriesId_key";

-- DropIndex
DROP INDEX "Season_my11SeriesId_key";

-- DropIndex
DROP INDEX "Team_caTeamId_key";

-- DropIndex
DROP INDEX "Team_my11TeamId_key";

-- AlterTable
ALTER TABLE "FantasyEntryPlayer" DROP COLUMN "caPlayerId",
DROP COLUMN "my11PlayerId";

-- AlterTable
ALTER TABLE "FantasyMatchPlayer" DROP COLUMN "caMatchId",
DROP COLUMN "caPlayerId",
DROP COLUMN "my11MatchId",
DROP COLUMN "my11PlayerId",
DROP COLUMN "teamCaId",
DROP COLUMN "teamMy11Id";

-- AlterTable
ALTER TABLE "FantasyPlayer" DROP COLUMN "caPlayerId",
DROP COLUMN "my11CreditValue",
DROP COLUMN "my11IsInjured",
DROP COLUMN "my11PlayerId",
DROP COLUMN "my11PointsOverall",
DROP COLUMN "teamCaId",
DROP COLUMN "teamMy11Id";

-- AlterTable
ALTER TABLE "FantasyPlayerScore" DROP COLUMN "caMatchId",
DROP COLUMN "caPlayerId",
DROP COLUMN "my11MatchId",
DROP COLUMN "my11PlayerId";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "awayTeamCaId",
DROP COLUMN "awayTeamMy11Id",
DROP COLUMN "caLastSyncedAt",
DROP COLUMN "caMatchId",
DROP COLUMN "caScore",
DROP COLUMN "caStatus",
DROP COLUMN "homeTeamCaId",
DROP COLUMN "homeTeamMy11Id",
DROP COLUMN "my11MatchId",
DROP COLUMN "seasonCaSeriesId",
DROP COLUMN "seasonMy11SeriesId";

-- AlterTable
ALTER TABLE "Season" DROP COLUMN "caSeriesId",
DROP COLUMN "my11SeriesId";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "caTeamId",
DROP COLUMN "my11TeamId";
