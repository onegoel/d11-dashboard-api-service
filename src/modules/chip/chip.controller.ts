import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
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
import { SelectPowerupDto } from "./dto/select-powerup.dto.js";
import { ChipService } from "./chip.service.js";

@Controller("chips")
@ApiTags("chips")
export class ChipController {
  constructor(private readonly chipService: ChipService) {}

  @Get("season/:seasonId")
  @ApiOperation({
    summary: "Get season powerups overview",
    description: "Retrieve all available powerups and their eligibility information for a season",
  })
  @ApiParam({
    name: "seasonId",
    type: "number",
    description: "The season ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Powerups overview retrieved successfully",
  })
  async getSeasonPowerups(@Param("seasonId", ParseIntPipe) seasonId: number) {
    return this.chipService.getSeasonPowerupsOverview(seasonId);
  }

  @Post("season/:seasonId/select")
  @HttpCode(200)
  @ApiOperation({
    summary: "Select a powerup",
    description: "Select and activate a powerup for a season user at a specific match",
  })
  @ApiParam({
    name: "seasonId",
    type: "number",
    description: "The season ID",
    example: 1,
  })
  @ApiBody({
    type: SelectPowerupDto,
    description: "Powerup selection payload",
  })
  @ApiResponse({
    status: 200,
    description: "Powerup selected successfully",
  })
  async selectPowerup(
    @Param("seasonId", ParseIntPipe) seasonId: number,
    @Body() body: SelectPowerupDto,
  ) {
    return this.chipService.selectPowerupForSeasonMatch({
      seasonId,
      seasonUserId: body.seasonUserId,
      chipCode: body.chipCode,
      startMatchId: body.startMatchId,
    });
  }

  @Delete("play/:chipPlayId")
  @ApiOperation({
    summary: "Deselect a powerup",
    description: "Deactivate/cancel a previously selected powerup",
  })
  @ApiParam({
    name: "chipPlayId",
    format: "uuid",
    description: "The chip play ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Powerup deselected successfully",
  })
  async deselectPowerup(@Param("chipPlayId", ParseUUIDPipe) chipPlayId: string) {
    return this.chipService.deselectPowerup(chipPlayId);
  }
}
