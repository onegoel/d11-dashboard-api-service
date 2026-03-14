import { Router } from "express";
import { matchController } from "../controllers/match.controller.js";

const matchRouter = Router();

matchRouter.get("/season/:seasonId", matchController.getSeasonMatches);
matchRouter.patch("/:matchId/status", matchController.updateMatchStatus);

export default matchRouter;
