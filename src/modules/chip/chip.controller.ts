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
import { SelectPowerupDto } from "./dto/select-powerup.dto.js";
import { ChipService } from "./chip.service.js";

@Controller("chips")
@ApiTags("chips")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard)
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
    @CurrentAppUser() appUser: AppUserContext,
  ) {
    return this.chipService.selectPowerupForSeasonMatch({
      seasonId,
      seasonUserId: body.seasonUserId,
      chipCode: body.chipCode,
      startMatchId: body.startMatchId,
      actorUserId: appUser.id,
      actorRole: appUser.role,
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
  async deselectPowerup(
    @Param("chipPlayId", ParseUUIDPipe) chipPlayId: string,
    @CurrentAppUser() appUser: AppUserContext,
  ) {
    return this.chipService.deselectPowerup(chipPlayId, {
      userId: appUser.id,
      role: appUser.role,
    });
  }
}
