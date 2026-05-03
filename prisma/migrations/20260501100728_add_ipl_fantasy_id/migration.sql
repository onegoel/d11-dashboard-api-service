/*
  Warnings:

  - A unique constraint covering the columns `[iplFantasyId]` on the table `FantasyPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FantasyPlayer" ADD COLUMN     "iplFantasyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FantasyPlayer_iplFantasyId_key" ON "FantasyPlayer"("iplFantasyId");
