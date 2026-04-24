import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AppUserContext } from "../../auth/auth.types.js";
import { AppUserGuard } from "../../auth/app-user.guard.js";
import { CurrentAppUser } from "../../auth/current-app-user.decorator.js";
import { FirebaseAuthGuard } from "../../auth/firebase-auth.guard.js";
import { Roles } from "../../auth/roles.decorator.js";
import { RolesGuard } from "../../auth/roles.guard.js";
import { UserRole } from "../../../../generated/prisma/client.js";
import { CustomScoringService } from "./custom-scoring.service.js";
import {
  CreateCustomScoringSystemDto,
  UpdateCustomScoringSystemDto,
} from "./dto/custom-scoring.dto.js";

/**
 * Scoring Lab (alpha) — admin-only while in testing.
 *
 * To open this up to all users: remove `RolesGuard` and `@Roles(UserRole.ADMIN)`
 * from the class-level guards below. Everything else stays the same.
 */
@Controller("fantasy/custom-scoring")
@ApiTags("fantasy/custom-scoring")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CustomScoringController {
  constructor(private readonly service: CustomScoringService) {}

  @Get("default-config")
  @ApiOperation({ summary: "Get the default (production) points config — used to prefill the form" })
  getDefaultConfig() {
    return this.service.getDefaultConfig();
  }

  @Get("systems")
  @ApiOperation({ summary: "List all active custom scoring systems" })
  list() {
    return this.service.list();
  }

  @Post("systems")
  @ApiOperation({ summary: "Create a new custom scoring system" })
  create(
    @CurrentAppUser() appUser: AppUserContext,
    @Body() dto: CreateCustomScoringSystemDto,
  ) {
    return this.service.create(appUser.id, dto);
  }

  @Get("systems/:id")
  @ApiOperation({ summary: "Get a custom scoring system by id" })
  getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.getById(id);
  }

  @Patch("systems/:id")
  @ApiOperation({ summary: "Update a custom scoring system (creator only)" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentAppUser() appUser: AppUserContext,
    @Body() dto: UpdateCustomScoringSystemDto,
  ) {
    return this.service.update(id, appUser.id, dto);
  }

  @Delete("systems/:id")
  @ApiOperation({ summary: "Soft-delete a custom scoring system (creator only)" })
  delete(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentAppUser() appUser: AppUserContext,
  ) {
    return this.service.delete(id, appUser.id);
  }

  @Get("systems/:id/match-leaderboard")
  @ApiOperation({ summary: "Per-player leaderboard for a match under this scoring system" })
  getMatchLeaderboard(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("matchId", ParseUUIDPipe) matchId: string,
  ) {
    return this.service.getMatchLeaderboard(id, matchId);
  }
}
