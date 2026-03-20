import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { UpdateMatchStatusDto } from "./dto/update-match-status.dto.js";
import { MatchService } from "./match.service.js";
import { MatchStatus } from "../../../generated/prisma/client.js";

@Controller("matches")
@ApiTags("matches")
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get("season/:seasonId")
  @ApiOperation({
    summary: "Get all season matches",
    description: "Retrieve all matches for a specific season with optional status filter",
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
    description: "Optional match status filter (NOT_STARTED, IN_PROGRESS, COMPLETED)",
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
      const matchStatus = (typeof status === "string" ? status.toUpperCase() : status) as MatchStatus;
      return this.matchService.getSeasonMatches(seasonId, {
        status: matchStatus,
      });
    }

    return this.matchService.getSeasonMatches(seasonId);
  }

  @Patch(":matchId/status")
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
