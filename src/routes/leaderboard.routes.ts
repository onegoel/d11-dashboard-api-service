import { Router } from "express";
import { leaderboardController } from "../controllers/leaderboard.controller.js";

const leaderboardRouter = Router();

leaderboardRouter.get(
  "/season/:seasonId",
  leaderboardController.getSeasonLeaderboard,
);
leaderboardRouter.get(
  "/match/:matchId",
  leaderboardController.getMatchLeaderboard,
);

export default leaderboardRouter;
