/*
  Warnings:

  - You are about to drop the column `bowlingImpactViz` on the `FantasyPlayerMatchStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FantasyPlayerMatchStats" DROP COLUMN "bowlingImpactViz",
ADD COLUMN     "bowlingImpact" DOUBLE PRECISION DEFAULT 0;
