/*
  Warnings:

  - You are about to drop the column `stadium` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "stadium",
DROP COLUMN "venue",
ADD COLUMN     "weatherForecast" JSONB;
