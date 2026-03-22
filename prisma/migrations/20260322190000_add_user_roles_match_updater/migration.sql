CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

ALTER TABLE "User"
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

ALTER TABLE "Match"
  ADD COLUMN "updatedByUserId" INTEGER;

CREATE INDEX "Match_updatedByUserId_idx" ON "Match"("updatedByUserId");

ALTER TABLE "Match"
  ADD CONSTRAINT "Match_updatedByUserId_fkey"
  FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
