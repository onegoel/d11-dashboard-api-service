import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FirebaseAuthGuard } from "../../auth/firebase-auth.guard.js";
import { AppUserGuard } from "../../auth/app-user.guard.js";
import { Roles } from "../../auth/roles.decorator.js";
import { RolesGuard } from "../../auth/roles.guard.js";
import { FantasySquadsService } from "./fantasy-squads.service.js";
import { UserRole } from "../../../../generated/prisma/client.js";

@Controller("fantasy/squads")
@ApiTags("fantasy/squads")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard)
export class FantasySquadsController {
  constructor(private readonly squads: FantasySquadsService) {}

  @Get(":matchId")
  @ApiOperation({
    summary: "Build player pool for a match",
    description:
      "Builds fantasy player pool for a given match using Wisden squads when available.",
  })
  @ApiResponse({ status: 200, description: "Fantasy player pool sync result" })
  async getMatchSquad(@Param("matchId") matchId: string): Promise<unknown> {
    return this.squads.getMatchSquad(matchId);
  }

  @Post("sync-players")
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Sync fantasy players from Wisden squads API",
    description:
      "Fetches the live Wisden squads endpoint and inserts only players that do not yet exist. Existing players are never overwritten.",
  })
  @ApiResponse({ status: 200, description: "Wisden squads sync result" })
  syncPlayers() {
    return this.squads.syncPlayersFromWisdenApi();
  }
}
