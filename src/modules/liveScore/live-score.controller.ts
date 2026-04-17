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
}
