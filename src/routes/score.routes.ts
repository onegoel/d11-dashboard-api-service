import { Router } from "express";
import { scoreController } from "../controllers/score.controller.js";

const scoreRouter = Router();

scoreRouter.post("/match/:matchId", scoreController.uploadMatchScores);

export default scoreRouter;
