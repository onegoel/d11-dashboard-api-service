import { Router } from "express";
import { userController } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/season/:seasonId", userController.getSeasonPlayers);

export default userRouter;
