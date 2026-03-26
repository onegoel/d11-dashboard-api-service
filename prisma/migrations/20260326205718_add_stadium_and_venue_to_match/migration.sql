-- DropIndex
DROP INDEX "ChipPlay_selectedTeamId_idx";

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "stadium" TEXT,
ADD COLUMN     "venue" TEXT;
