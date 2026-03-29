import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { GetMatchScoreResponseDto } from "./dto/get-match-score-response.dto.js";
import { UpdateMatchStatusDto } from "./dto/update-match-status.dto.js";
import { MatchService } from "./match.service.js";
import { MatchStatus, UserRole } from "../../../generated/prisma/client.js";
import { AppUserGuard } from "../auth/app-user.guard.js";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";

@Controller("matches")
@ApiTags("matches")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get("season/:seasonId")
  @ApiOperation({
    summary: "Get all season matches",
    description:
      "Retrieve all matches for a specific season with optional status filter",
  })
  @ApiParam({
    name: "seasonId",
    type: "number",
    description: "The season ID",
    example: 1,
  })
  @ApiQuery({
    name: "status",
    required: false,
    description:
      "Optional match status filter (NOT_STARTED, IN_PROGRESS, COMPLETED)",
    example: "NOT_STARTED",
  })
  @ApiResponse({
    status: 200,
    description: "List of season matches retrieved successfully",
  })
  async getSeasonMatches(
    @Param("seasonId", ParseIntPipe) seasonId: number,
    @Query("status") status?: string,
  ) {
    if (status) {
      const matchStatus = (
        typeof status === "string" ? status.toUpperCase() : status
      ) as MatchStatus;
      return this.matchService.getSeasonMatches(seasonId, {
        status: matchStatus,
      });
    }

    return this.matchService.getSeasonMatches(seasonId);
  }

  @Get(":matchId/score")
  @ApiOperation({
    summary: "Get match score snapshot",
    description:
      "Returns the latest persisted CricAPI score snapshot from DB (no direct CricAPI hit).",
  })
  @ApiParam({
    name: "matchId",
    format: "uuid",
    description: "The match ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Match score snapshot retrieved successfully",
    type: GetMatchScoreResponseDto,
  })
  async getMatchScore(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.matchService.getMatchScore(matchId);
  }

  @Post(":matchId/score/sync")
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Sync match score from CricAPI",
    description:
      "Fetches one score snapshot from configured source (mock/live) and persists it in DB.",
  })
  @ApiParam({
    name: "matchId",
    format: "uuid",
    description: "The match ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Match score synced successfully",
    type: GetMatchScoreResponseDto,
  })
  async syncMatchScore(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.matchService.syncMatchScore(matchId);
  }

  @Patch(":matchId/status")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Update match status",
    description: "Update the status of a specific match",
  })
  @ApiParam({
    name: "matchId",
    format: "uuid",
    description: "The match ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiBody({
    type: UpdateMatchStatusDto,
    description: "Match status update payload",
  })
  @ApiResponse({
    status: 200,
    description: "Match status updated successfully",
  })
  async updateMatchStatus(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Body() body: UpdateMatchStatusDto,
  ) {
    return this.matchService.updateMatchStatus(matchId, body.status);
  }
}
