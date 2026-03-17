-- CreateEnum
CREATE TYPE "ChipCode" AS ENUM ('DOUBLE_TEAM', 'COMEBACK_KID');

-- CreateEnum
CREATE TYPE "ChipPlayStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- AlterTable
ALTER TABLE "ChipType"
ADD COLUMN "code" "ChipCode",
ADD COLUMN "effectWindowMatches" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "requiresBottomHalf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "usesSecondaryTeamScore" BOOLEAN NOT NULL DEFAULT false;

-- Backfill chip code values for existing rows (if any).
UPDATE "ChipType"
SET "code" = CASE
  WHEN LOWER(REPLACE("name", ' ', '_')) IN ('double_team', 'doubleteam') THEN 'DOUBLE_TEAM'::"ChipCode"
  WHEN LOWER(REPLACE("name", ' ', '_')) IN ('comeback_kid', 'comebackkid') THEN 'COMEBACK_KID'::"ChipCode"
  ELSE NULL
END;

WITH ranked_chip_types AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS row_no
  FROM "ChipType"
  WHERE "code" IS NULL
)
UPDATE "ChipType" chip_type
SET "code" = CASE
  WHEN ranked_chip_types.row_no = 1 THEN 'DOUBLE_TEAM'::"ChipCode"
  ELSE 'COMEBACK_KID'::"ChipCode"
END
FROM ranked_chip_types
WHERE chip_type.id = ranked_chip_types.id;

ALTER TABLE "ChipType"
ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "ChipType_code_key" ON "ChipType"("code");

-- Normalize known chip defaults.
UPDATE "ChipType"
SET
  "name" = CASE "code"
    WHEN 'DOUBLE_TEAM' THEN 'Double Team'
    WHEN 'COMEBACK_KID' THEN 'Comeback Kid'
    ELSE "name"
  END,
  "description" = CASE "code"
    WHEN 'DOUBLE_TEAM' THEN 'Submit two Dream11 scores for the same match. The higher score is used.'
    WHEN 'COMEBACK_KID' THEN 'Available to bottom-half players. Boosts D11 score by 1.1x for 3 consecutive matches.'
    ELSE "description"
  END,
  "multiplier" = CASE "code"
    WHEN 'DOUBLE_TEAM' THEN 1.0
    WHEN 'COMEBACK_KID' THEN 1.1
    ELSE "multiplier"
  END,
  "maxUsesPerSeason" = 2,
  "effectWindowMatches" = CASE "code"
    WHEN 'DOUBLE_TEAM' THEN 1
    WHEN 'COMEBACK_KID' THEN 3
    ELSE "effectWindowMatches"
  END,
  "requiresBottomHalf" = CASE "code"
    WHEN 'COMEBACK_KID' THEN true
    ELSE false
  END,
  "usesSecondaryTeamScore" = CASE "code"
    WHEN 'DOUBLE_TEAM' THEN true
    ELSE false
  END;

-- AlterTable
ALTER TABLE "ChipPlay" DROP CONSTRAINT "ChipPlay_matchId_fkey";

ALTER TABLE "ChipPlay"
RENAME COLUMN "matchId" TO "startMatchId";

ALTER TABLE "ChipPlay"
ADD COLUMN "status" "ChipPlayStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN "canceledAt" TIMESTAMP(3);

ALTER TABLE "ChipPlay"
DROP COLUMN "playedAt";

ALTER TABLE "ChipPlay"
ADD CONSTRAINT "ChipPlay_startMatchId_fkey"
FOREIGN KEY ("startMatchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ChipPlay_seasonUserId_chipTypeId_startMatchId_key"
ON "ChipPlay"("seasonUserId", "chipTypeId", "startMatchId");

CREATE INDEX "ChipPlay_seasonUserId_idx" ON "ChipPlay"("seasonUserId");
CREATE INDEX "ChipPlay_startMatchId_idx" ON "ChipPlay"("startMatchId");

-- AlterTable
ALTER TABLE "Score"
ADD COLUMN "rawScore" DOUBLE PRECISION,
ADD COLUMN "effectiveScore" DOUBLE PRECISION,
ADD COLUMN "secondaryRawScore" DOUBLE PRECISION;

DROP INDEX IF EXISTS "Score_chipPlayId_key";
CREATE INDEX "Score_chipPlayId_idx" ON "Score"("chipPlayId");
