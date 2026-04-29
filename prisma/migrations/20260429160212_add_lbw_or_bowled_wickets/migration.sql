-- AlterTable: add lbwOrBowledWickets to FantasyPlayerMatchStats so the
-- Scoring Lab (and any non-live re-scoring path) can apply the
-- lbw_bowled_bonus from the configured points system.
ALTER TABLE "FantasyPlayerMatchStats"
ADD COLUMN     "lbwOrBowledWickets" INTEGER NOT NULL DEFAULT 0;
