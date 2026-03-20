import { Module } from "@nestjs/common";
import { ChipModule } from "../chip/chip.module.js";
import { ScoreController } from "./score.controller.js";
import { ScoreService } from "./score.service.js";

@Module({
  imports: [ChipModule],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}
