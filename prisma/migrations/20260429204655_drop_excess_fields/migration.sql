/*
  Warnings:

  - You are about to drop the column `altitude` on the `Ground` table. All the data in the column will be lost.
  - You are about to drop the column `isDomestic` on the `Ground` table. All the data in the column will be lost.
  - You are about to drop the column `isInternational` on the `Ground` table. All the data in the column will be lost.
  - You are about to drop the column `wisdenGroundId` on the `Ground` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cricbuzzGroundId]` on the table `Ground` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Ground_wisdenGroundId_idx";

-- DropIndex
DROP INDEX "Ground_wisdenGroundId_key";

-- AlterTable
ALTER TABLE "Ground" DROP COLUMN "altitude",
DROP COLUMN "isDomestic",
DROP COLUMN "isInternational",
DROP COLUMN "wisdenGroundId",
ADD COLUMN     "altitudeMeters" INTEGER,
ADD COLUMN     "cricbuzzGroundId" INTEGER,
ADD COLUMN     "knownAs" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Ground_cricbuzzGroundId_key" ON "Ground"("cricbuzzGroundId");

-- CreateIndex
CREATE INDEX "Ground_cricbuzzGroundId_idx" ON "Ground"("cricbuzzGroundId");
