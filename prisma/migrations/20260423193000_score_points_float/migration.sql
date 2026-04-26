-- Allow fractional rank points for tie-splitting (e.g., 8.5 for shared 1st)
ALTER TABLE "Score"
ALTER COLUMN "points" TYPE DOUBLE PRECISION;