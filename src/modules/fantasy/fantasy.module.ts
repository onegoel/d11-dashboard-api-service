import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { WisdenModule } from "../wisden/wisden.module.js";
import { ScoreModule } from "../score/score.module.js";
import { FantasyMatchesController } from "./matches/fantasy-matches.controller.js";
import { FantasyMatchesService } from "./matches/fantasy-matches.service.js";
import { FantasyLineupService } from "./lineup/fantasy-lineup.service.js";
import { FantasyScoringService } from "./scoring/fantasy-scoring.service.js";
import { FantasySquadsController } from "./squads/fantasy-squads.controller.js";
import { FantasySquadsService } from "./squads/fantasy-squads.service.js";

@Module({
  imports: [AuthModule, WisdenModule, ScoreModule],
  controllers: [FantasySquadsController, FantasyMatchesController],
  providers: [
    FantasySquadsService,
    FantasyMatchesService,
    FantasyLineupService,
    FantasyScoringService,
  ],
  exports: [FantasyScoringService, FantasySquadsService, FantasyLineupService],
})
export class FantasyModule {}
