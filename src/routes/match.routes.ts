import { Router } from "express";
import { matchController } from "../controllers/match.controller.js";

const matchRouter = Router();

matchRouter.get("/season/:seasonId", matchController.getSeasonMatches);

export default matchRouter;
