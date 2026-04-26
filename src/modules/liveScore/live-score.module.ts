import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { FantasyModule } from "../fantasy/fantasy.module.js";
import { WisdenModule } from "../wisden/wisden.module.js";
import { MatchPollerService } from "./match-poller.service.js";
import { LiveScoreController } from "./live-score.controller.js";
import { LiveScoreService } from "./live-score.service.js";

@Module({
  imports: [AuthModule, FantasyModule, WisdenModule],
  controllers: [LiveScoreController],
  providers: [LiveScoreService, MatchPollerService],
  exports: [LiveScoreService, MatchPollerService],
})
export class LiveScoreModule {}
