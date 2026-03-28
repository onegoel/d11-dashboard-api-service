/*
  Warnings:

  - A unique constraint covering the columns `[cricApiMatchId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cricApiSeriesId]` on the table `Season` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "cricApiMatchId" TEXT;

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "cricApiSeriesId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Match_cricApiMatchId_key" ON "Match"("cricApiMatchId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_cricApiSeriesId_key" ON "Season"("cricApiSeriesId");
