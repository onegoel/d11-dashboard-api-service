import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { LiveScoreService } from "./live-score.service.js";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard.js";
import { AppUserGuard } from "../auth/app-user.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { UserRole } from "../../../generated/prisma/client.js";

@UseGuards(FirebaseAuthGuard, AppUserGuard)
@Controller("live-score")
export class LiveScoreController {
  constructor(private readonly liveScoreService: LiveScoreService) {}

  @Get("matches/:matchId/scorecard")
  getWisdenScorecard(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.liveScoreService.getWisdenScorecard(matchId);
  }

  @Get("matches/:matchId/commentary")
  getWisdenCommentary(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.liveScoreService.getWisdenCommentary(matchId);
  }

  @Post("backfill")
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  backfillHistoricalMatches() {
    return this.liveScoreService.backfillHistoricalMatches();
  }

  @Post("backfill/match-stats")
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  backfillMatchStats() {
    return this.liveScoreService.backfillMatchStats();
  }

  @Post("backfill/recalculate-fantasy-points")
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  backfillRecalculateFantasyPoints() {
    return this.liveScoreService.backfillRecalculateFantasyPoints();
  }

  @Post("backfill/player-profiles")
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  backfillPlayerProfiles() {
    return this.liveScoreService.backfillPlayerProfiles();
  }
}
