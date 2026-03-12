import { Router } from "express";
import leaderboardRouter from "./leaderboard.routes.js";
import userRouter from "./user.routes.js";
import scoreRouter from "./score.routes.js";
import matchRouter from "./match.routes.js";

const router = Router();

router.use("/leaderboard", leaderboardRouter);
router.use("/users", userRouter);
router.use("/scores", scoreRouter);
router.use("/matches", matchRouter);

export default router;
