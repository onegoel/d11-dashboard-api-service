-- CreateEnum for MatchResult
CREATE TYPE "MatchResult" AS ENUM ('HOME_WIN', 'AWAY_WIN', 'ABANDONED', 'PENDING');

-- Update ChipCode enum: remove COMEBACK_KID, add new ones
-- PostgreSQL requires dropping and recreating the type
ALTER TYPE "ChipCode" RENAME TO "ChipCode_old";

CREATE TYPE "ChipCode" AS ENUM ('DOUBLE_TEAM', 'TEAM_FORM', 'SWAPPER', 'ANCHOR_PLAYER');

-- Update ChipType table
ALTER TABLE "ChipType" 
  ALTER COLUMN "code" TYPE "ChipCode" USING (
    CASE
      WHEN "code"::text = 'COMEBACK_KID' THEN 'TEAM_FORM'
      ELSE "code"::text
    END
  )::"ChipCode";

-- Drop old enum
DROP TYPE "ChipCode_old";

-- Add matchResult column to Match
ALTER TABLE "Match"
  ADD COLUMN "matchResult" "MatchResult" NOT NULL DEFAULT 'PENDING';

-- Add selectedTeamId column to ChipPlay
ALTER TABLE "ChipPlay"
  ADD COLUMN "selectedTeamId" TEXT;

-- Add foreign key constraint for selectedTeamId
ALTER TABLE "ChipPlay"
  ADD CONSTRAINT "ChipPlay_selectedTeamId_fkey"
  FOREIGN KEY ("selectedTeamId") REFERENCES "Team"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for selectedTeamId
CREATE INDEX "ChipPlay_selectedTeamId_idx" ON "ChipPlay"("selectedTeamId");
