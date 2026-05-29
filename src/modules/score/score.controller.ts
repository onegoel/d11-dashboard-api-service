import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import type { AppUserContext } from "../auth/auth.types.js";
import { AppUserGuard } from "../auth/app-user.guard.js";
import { CurrentAppUser } from "../auth/current-app-user.decorator.js";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard.js";
import { SubmitMatchScoresDto } from "./dto/submit-match-scores.dto.js";
import { ScoreService } from "./score.service.js";

@Controller("scores")
@ApiTags("scores")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard)
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get("match/:matchId")
  @ApiOperation({
    summary: "Get match scores",
    description:
      "Retrieve all scores for a specific match with powerup/chip assignments",
  })
  @ApiParam({
    name: "matchId",
    format: "uuid",
    description: "The match ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Match scores retrieved successfully",
  })
  async getMatchScores(@Param("matchId", ParseUUIDPipe) matchId: string) {
    const response = await this.scoreService.getMatchScores(matchId);

    return {
      matchId,
      matchResult: response.matchResult,
      scores: response.scores,
      chipAssignments: response.chipAssignments,
    };
  }

  @Post("match/:matchId")
  @HttpCode(200)
  @ApiOperation({
    summary: "Upload match scores",
    description: "Submit scores for all players in a match as an array",
  })
  @ApiParam({
    name: "matchId",
    format: "uuid",
    description: "The match ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiBody({
    type: SubmitMatchScoresDto,
    description: "Score entries and match result",
  })
  @ApiResponse({
    status: 200,
    description: "Match scores uploaded successfully",
    schema: {
      example: {
        message: "Match scores uploaded successfully",
        scores: [],
      },
    },
  })
  async uploadMatchScores(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Body() body: SubmitMatchScoresDto,
    @CurrentAppUser() appUser: AppUserContext,
  ) {
    const result = await this.scoreService.submitMatchScoresBulk(
      matchId,
      body.scores,
      body.matchResult,
      appUser.id,
    );

    return {
      message: "Match scores uploaded successfully",
      scores: result,
    };
  }
}
