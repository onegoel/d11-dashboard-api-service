import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AppUserGuard } from "../auth/app-user.guard.js";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard.js";
import { RecordsService } from "./records.service.js";

@Controller("records")
@ApiTags("records")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get("season/:seasonId")
  @ApiOperation({
    summary: "Get season records",
    description:
      "Returns IPL standings plus top batting, bowling, and fielding season records with leaderboard leaders",
  })
  @ApiParam({
    name: "seasonId",
    type: "number",
    description: "The season ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Season records payload returned successfully",
  })
  async getSeasonRecords(@Param("seasonId", ParseIntPipe) seasonId: number) {
    return this.recordsService.getSeasonRecords(seasonId);
  }
}
