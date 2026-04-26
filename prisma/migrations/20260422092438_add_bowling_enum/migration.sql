/*
  Warnings:

  - The `bowlingTechnique` column on the `FantasyPlayer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BowlingTechnique" AS ENUM ('OFF_BREAK', 'LEFT_ORTHODOX', 'RIGHT_PACE', 'LEFT_PACE', 'LEG_BREAK', 'LEFT_UNORTHODOX');

-- AlterTable
ALTER TABLE "FantasyPlayer" DROP COLUMN "bowlingTechnique",
ADD COLUMN     "bowlingTechnique" "BowlingTechnique";
