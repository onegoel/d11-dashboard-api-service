/*
  Warnings:

  - You are about to drop the column `playerName` on the `PlayerPick` table. All the data in the column will be lost.
  - Added the required column `fantasyPlayerId` to the `PlayerPick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FantasyMatchPlayer" ADD COLUMN     "subbedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subbedOut" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FantasyPlayerSeasonStats" ADD COLUMN     "centuriesTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fiftiesTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thirtiesTotal" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PlayerPick" DROP COLUMN "playerName",
ADD COLUMN     "fantasyPlayerId" TEXT NOT NULL,
ADD COLUMN     "isViceCaptain" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "PlayerPick" ADD CONSTRAINT "PlayerPick_fantasyPlayerId_fkey" FOREIGN KEY ("fantasyPlayerId") REFERENCES "FantasyPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
