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

  @Get("matches/:matchId/scoring-breakdown")
  getScoringBreakdown(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.liveScoreService.getScoringBreakdown(matchId);
  }

  @Get("matches/:matchId/winviz")
  getWinViz(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.liveScoreService.getWinViz(matchId);
  }

  @Get("matches/:matchId/manhattan")
  getManhattan(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.liveScoreService.getManhattan(matchId);
  }

  @Get("matches/:matchId/wagon")
  getWagonWheel(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.liveScoreService.getWagonWheel(matchId);
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

  @Post("backfill/delayed-impact")
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  backfillDelayedImpactScores() {
    return this.liveScoreService.backfillDelayedImpactScores();
  }
}
