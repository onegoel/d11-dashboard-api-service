/*
  Warnings:

  - A unique constraint covering the columns `[my11PlayerId]` on the table `FantasyPlayer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[my11TeamId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `my11PlayerId` to the `FantasyPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FantasyPlayer" ADD COLUMN     "isStatsAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "my11PlayerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "my11TeamId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FantasyPlayer_my11PlayerId_key" ON "FantasyPlayer"("my11PlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_my11TeamId_key" ON "Team"("my11TeamId");
