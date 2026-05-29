-- AlterTable
ALTER TABLE "FantasyContest" ADD COLUMN     "eligibleUserIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "isPlayoffContest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FantasyContestEntry" ADD COLUMN     "fantasyPlayoffSeed" INTEGER;

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "fantasyPlayoffConfig" JSONB;
