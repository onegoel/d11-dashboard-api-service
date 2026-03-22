import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { ChipModule } from "../chip/chip.module.js";
import { ScoreController } from "./score.controller.js";
import { ScoreService } from "./score.service.js";

@Module({
  imports: [AuthModule, ChipModule],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}
