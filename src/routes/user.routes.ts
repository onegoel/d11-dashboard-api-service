import { Router } from "express";
import { userController } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/season/:seasonId", userController.getSeasonPlayers);
userRouter.patch("/:userId/display-name", userController.updateDisplayName);
userRouter.patch("/season-user/:seasonUserId/team-name", userController.updateTeamName);

export default userRouter;
