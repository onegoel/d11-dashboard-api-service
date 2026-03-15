-- AlterTable
ALTER TABLE "User"
ADD COLUMN "display_name" TEXT;

-- Backfill display names for existing rows.
UPDATE "User"
SET "display_name" = CASE
  WHEN "first_name" = 'Suryadeepto' THEN 'Suryo'
  WHEN "first_name" = 'Rohan' THEN 'Kanna'
  ELSE "first_name"
END
WHERE "display_name" IS NULL;

-- Make display_name required going forward.
ALTER TABLE "User"
ALTER COLUMN "display_name" SET NOT NULL;

-- Convert old seeded default team names to the new default format.
UPDATE "SeasonUser" AS su
SET "teamName" = u."display_name" || '''s Team'
FROM "User" AS u
WHERE su."userId" = u."id"
  AND (
    su."teamName" = u."user_name" || '''s XI'
    OR su."teamName" = u."first_name" || '''s XI'
  );
