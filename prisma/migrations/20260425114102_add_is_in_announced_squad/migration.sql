-- AlterTable
ALTER TABLE "FantasyMatchPlayer" ADD COLUMN     "isCaptain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInAnnouncedSquad" BOOLEAN,
ADD COLUMN     "isKeeper" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isViceCaptain" BOOLEAN DEFAULT false,
ADD COLUMN     "playerOrder" INTEGER;
