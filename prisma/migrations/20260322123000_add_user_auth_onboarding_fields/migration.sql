ALTER TABLE "User"
  ADD COLUMN "full_name" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "photo_url" TEXT,
  ADD COLUMN "auth_provider" TEXT,
  ADD COLUMN "auth_subject" TEXT,
  ADD COLUMN "onboardedAt" TIMESTAMP(3),
  ADD COLUMN "lastLoginAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_auth_subject_key" ON "User"("auth_subject");
