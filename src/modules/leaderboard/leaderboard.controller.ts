import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";
import { LeaderboardService } from "./leaderboard.service.js";

@Controller("leaderboard")
@ApiTags("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get("season/:seasonId/power-rankings")
  @ApiOperation({
    summary: "Get season power rankings",
    description:
      "Retrieve weighted power rankings based on each player's recent 5-match performance",
  })
  @ApiParam({
    name: "seasonId",
    type: "number",
    description: "The season ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Season power rankings retrieved successfully",
  })
  async getSeasonPowerRankings(
    @Param("seasonId", ParseIntPipe) seasonId: number,
  ) {
    return this.leaderboardService.getSeasonPowerRankings(seasonId);
  }

  @Get("season/:seasonId")
  @ApiOperation({
    summary: "Get season leaderboard",
    description: "Retrieve the leaderboard for a specific season with player rankings",
  })
  @ApiParam({
    name: "seasonId",
    type: "number",
    description: "The season ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Season leaderboard retrieved successfully",
  })
  async getSeasonLeaderboard(@Param("seasonId", ParseIntPipe) seasonId: number) {
    return this.leaderboardService.getSeasonLeaderboard(seasonId);
  }

  @Get("match/:matchId")
  @ApiOperation({
    summary: "Get match leaderboard",
    description: "Retrieve the leaderboard for a specific match with player rankings",
  })
  @ApiParam({
    name: "matchId",
    format: "uuid",
    description: "The match ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Match leaderboard retrieved successfully",
  })
  async getMatchLeaderboard(@Param("matchId", ParseUUIDPipe) matchId: string) {
    const leaderboard = await this.leaderboardService.getMatchLeaderboard(matchId);

    return {
      matchId,
      leaderboard,
    };
  }
}
