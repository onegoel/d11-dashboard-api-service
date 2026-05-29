-- AlterTable
ALTER TABLE "FantasyMatchPlayer" ADD COLUMN     "currentSeasonPoints" DOUBLE PRECISION,
ADD COLUMN     "inLastMatchBestXI" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLastMatchPlayed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playerIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playerOut" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FantasyPlayer" ADD COLUMN     "shortName" TEXT;
