/*
  Warnings:

  - A unique constraint covering the columns `[cricbuzzTeamId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "cricbuzzTeamId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Team_cricbuzzTeamId_key" ON "Team"("cricbuzzTeamId");
