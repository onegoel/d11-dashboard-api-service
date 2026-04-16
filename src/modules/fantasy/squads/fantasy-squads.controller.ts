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

  @Post("ingest")
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Ingest Wisden squads from committed JSON",
    description:
      "Upserts fantasy player catalog from prisma/data/wisden/squads.json.",
  })
  @ApiResponse({ status: 200, description: "Wisden squads ingest result" })
  ingestWisdenSquads() {
    return this.squads.ingestWisdenSquadsFromFile();
  }
}
