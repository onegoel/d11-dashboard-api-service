import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { WisdenModule } from "../wisden/wisden.module.js";
import { LiveScoreModule } from "../liveScore/live-score.module.js";
import { MatchIngestionController } from "./match-ingestion.controller.js";
import { MatchIngestionService } from "./match-ingestion.service.js";

@Module({
  imports: [AuthModule, LiveScoreModule, WisdenModule],
  controllers: [MatchIngestionController],
  providers: [MatchIngestionService],
})
export class MatchIngestionModule {}
