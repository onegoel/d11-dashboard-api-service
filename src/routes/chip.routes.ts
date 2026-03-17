import { Router } from "express";
import { chipController } from "../controllers/chip.controller.js";

const chipRouter = Router();

chipRouter.get("/season/:seasonId", chipController.getSeasonPowerups);
chipRouter.post("/season/:seasonId/select", chipController.selectPowerup);
chipRouter.delete("/play/:chipPlayId", chipController.deselectPowerup);

export default chipRouter;