import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { UploadScoreDto } from "./dto/upload-score.dto.js";
import { ScoreService } from "./score.service.js";

@Controller("scores")
@ApiTags("scores")
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get("match/:matchId")
  @ApiOperation({
    summary: "Get match scores",
    description: "Retrieve all scores for a specific match with powerup/chip assignments",
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
    type: [UploadScoreDto],
    description: "Array of score entries to upload",
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
    @Body(
      new ParseArrayPipe({
        items: UploadScoreDto,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    scores: UploadScoreDto[],
  ) {
    const result = await this.scoreService.submitMatchScoresBulk(matchId, scores);

    return {
      message: "Match scores uploaded successfully",
      scores: result,
    };
  }
}
