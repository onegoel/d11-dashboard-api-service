import { Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "../../../generated/prisma/client.js";
import { AppUserGuard } from "../auth/app-user.guard.js";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { MatchPollerService } from "../liveScore/match-poller.service.js";
import { MatchIngestionService } from "./match-ingestion.service.js";

@Controller("admin/ingestion")
@ApiTags("admin/ingestion")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MatchIngestionController {
  constructor(
    private readonly ingestion: MatchIngestionService,
    private readonly poller: MatchPollerService,
  ) {}

  @Post("wisden-matches")
  @HttpCode(200)
  @ApiOperation({
    summary: "Ingest Wisden match IDs from local fixture seeds",
    description:
      "Loads wisdenMatchGid values from local fixture seed JSON, syncs team IDs from the Wisden table endpoint, and stores wisdenMatchGid on mapped matches.",
  })
  @ApiResponse({ status: 200, description: "Wisden ingestion result" })
  ingestWisdenMatches() {
    return this.ingestion.ingestWisdenMatchIds();
  }

  @Post("polling/status")
  @HttpCode(200)
  @ApiOperation({
    summary: "Get polling status (admin)",
    description:
      "Returns which CA fixture IDs are actively being polled and which are scheduled.",
  })
  @ApiResponse({ status: 200 })
  pollingStatus() {
    return this.poller.getPollingStatus();
  }
}
