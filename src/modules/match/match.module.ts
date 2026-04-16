import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { CricapiModule } from "../cricapi/cricapi.module.js";
import { MatchController } from "./match.controller.js";
import { MatchScorePollerService } from "./match-score-poller.service.js";
import { MatchService } from "./match.service.js";

@Module({
  imports: [AuthModule, CricapiModule],
  controllers: [MatchController],
  providers: [MatchService, MatchScorePollerService],
})
export class MatchModule {}
