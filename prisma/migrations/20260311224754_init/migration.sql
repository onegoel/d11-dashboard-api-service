-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "winnerUserId" INTEGER,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonUser" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "finalRank" INTEGER,
    "totalPoints" INTEGER,

    CONSTRAINT "SeasonUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "matchNo" INTEGER NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChipType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "maxUsesPerSeason" INTEGER NOT NULL,

    CONSTRAINT "ChipType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChipPlay" (
    "id" SERIAL NOT NULL,
    "seasonUserId" INTEGER NOT NULL,
    "chipTypeId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChipPlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "seasonUserId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "chipPlayId" INTEGER,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeasonUser_seasonId_userId_key" ON "SeasonUser"("seasonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_seasonId_matchNo_key" ON "Match"("seasonId", "matchNo");

-- CreateIndex
CREATE UNIQUE INDEX "Score_chipPlayId_key" ON "Score"("chipPlayId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_seasonUserId_matchId_key" ON "Score"("seasonUserId", "matchId");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_winnerUserId_fkey" FOREIGN KEY ("winnerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonUser" ADD CONSTRAINT "SeasonUser_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonUser" ADD CONSTRAINT "SeasonUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChipPlay" ADD CONSTRAINT "ChipPlay_seasonUserId_fkey" FOREIGN KEY ("seasonUserId") REFERENCES "SeasonUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChipPlay" ADD CONSTRAINT "ChipPlay_chipTypeId_fkey" FOREIGN KEY ("chipTypeId") REFERENCES "ChipType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChipPlay" ADD CONSTRAINT "ChipPlay_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_seasonUserId_fkey" FOREIGN KEY ("seasonUserId") REFERENCES "SeasonUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_chipPlayId_fkey" FOREIGN KEY ("chipPlayId") REFERENCES "ChipPlay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
