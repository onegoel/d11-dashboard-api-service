import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { WisdenModule } from "../wisden/wisden.module.js";
import { FantasyMatchesController } from "./matches/fantasy-matches.controller.js";
import { FantasyMatchesService } from "./matches/fantasy-matches.service.js";
import { FantasyScoringService } from "./scoring/fantasy-scoring.service.js";
import { FantasySquadsController } from "./squads/fantasy-squads.controller.js";
import { FantasySquadsService } from "./squads/fantasy-squads.service.js";

@Module({
  imports: [AuthModule, WisdenModule],
  controllers: [FantasySquadsController, FantasyMatchesController],
  providers: [
    FantasySquadsService,
    FantasyMatchesService,
    FantasyScoringService,
  ],
  exports: [FantasyScoringService, FantasySquadsService],
})
export class FantasyModule {}
