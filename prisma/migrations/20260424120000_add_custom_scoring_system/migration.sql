-- CreateTable
CREATE TABLE "CustomScoringSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomScoringSystem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomScoringSystem_createdById_idx" ON "CustomScoringSystem"("createdById");

-- AddForeignKey
ALTER TABLE "CustomScoringSystem" ADD CONSTRAINT "CustomScoringSystem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
