/*
  Warnings:

  - A unique constraint covering the columns `[my11MatchId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "my11MatchId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Match_my11MatchId_key" ON "Match"("my11MatchId");
