import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { AppUserContext } from "../../auth/auth.types.js";
import { AppUserGuard } from "../../auth/app-user.guard.js";
import { CurrentAppUser } from "../../auth/current-app-user.decorator.js";
import { FirebaseAuthGuard } from "../../auth/firebase-auth.guard.js";
import { Roles } from "../../auth/roles.decorator.js";
import { RolesGuard } from "../../auth/roles.guard.js";
import { UserRole } from "../../../../generated/prisma/client.js";
import {
  ExtendContestDeadlineDto,
  SubmitEntryDto,
} from "../dto/fantasy.dto.js";
import { FantasyMatchesService } from "./fantasy-matches.service.js";
import { FantasyScoringService } from "../scoring/fantasy-scoring.service.js";

@Controller("fantasy/matches")
@ApiTags("fantasy/matches")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard)
export class FantasyMatchesController {
  constructor(
    private readonly service: FantasyMatchesService,
    private readonly scoring: FantasyScoringService,
  ) {}

  @Get(":matchId/players")
  @ApiOperation({ summary: "Get player pool for a match" })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiResponse({ status: 200, description: "Player pool for the match" })
  getPlayerPool(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.service.getPlayerPool(matchId);
  }

  @Get(":matchId/player-scores")
  @ApiOperation({ summary: "Get per-player fantasy points for a match" })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiResponse({ status: 200, description: "Per-player points" })
  getPlayerScores(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.service.getPlayerScores(matchId);
  }

  @Get(":matchId/my-entries")
  @ApiOperation({
    summary: "Get the current user's fantasy entries for a match",
  })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiResponse({ status: 200, description: "User's contest entries" })
  getMyEntries(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @CurrentAppUser() appUser: AppUserContext,
  ) {
    return this.service.getMyEntries(matchId, appUser.id);
  }

  @Get(":matchId/admin/users/:userId/entries")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Get a specific user's fantasy entries for a match (admin only)",
  })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiParam({ name: "userId", example: 1 })
  @ApiResponse({ status: 200, description: "Target user's contest entries" })
  getEntriesForUser(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Param("userId", ParseIntPipe) userId: number,
  ) {
    return this.service.getEntriesForUser(matchId, userId);
  }

  @Get(":matchId/entries/:entryId")
  @ApiOperation({
    summary: "Get a specific contest entry with players for preview",
  })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiParam({ name: "entryId", format: "uuid" })
  @ApiResponse({ status: 200, description: "Contest entry detail" })
  getEntryDetail(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @CurrentAppUser() appUser: AppUserContext,
  ) {
    return this.service.getContestEntryDetail(matchId, entryId, appUser.id);
  }

  @Post(":matchId/entries")
  @ApiOperation({ summary: "Submit or update a fantasy entry for a match" })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiResponse({ status: 201, description: "Entry created or updated" })
  submitEntry(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @CurrentAppUser() appUser: AppUserContext,
    @Body() dto: SubmitEntryDto,
  ) {
    return this.service.submitEntry(matchId, appUser.id, dto);
  }

  @Post(":matchId/admin/users/:userId/entries")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Submit or update a user's fantasy entry for a match (admin only)",
  })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiParam({ name: "userId", example: 1 })
  @ApiResponse({ status: 201, description: "Entry created or updated" })
  submitEntryAsAdmin(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Param("userId", ParseIntPipe) userId: number,
    @Body() dto: SubmitEntryDto,
  ) {
    return this.service.submitEntryAsAdmin(matchId, userId, dto);
  }

  @Post(":matchId/sync")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Sync player pool from My11Circle for a match (admin only)",
  })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiResponse({ status: 200, description: "Sync triggered" })
  syncMatch(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.service.syncMatch(matchId);
  }

  @Post(":matchId/score")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      "Score a completed match and finalize contest rankings (admin only)",
  })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiResponse({ status: 200, description: "Scored and ranked" })
  scoreMatch(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.scoring.scoreMatch(matchId);
  }

  @Get(":matchId/player-selections")
  @ApiOperation({
    summary:
      "Get per-player contest selection breakdown (locked contests only)",
  })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiResponse({
    status: 200,
    description: "Player selections aggregated across the contest",
  })
  getPlayerSelections(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.service.getPlayerSelections(matchId);
  }

  @Post(":matchId/extend-deadline")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Extend contest deadline for a match (admin only)",
  })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiBody({ type: ExtendContestDeadlineDto })
  @ApiResponse({ status: 200, description: "Deadline extended" })
  extendDeadline(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Body() dto: ExtendContestDeadlineDto,
  ) {
    return this.service.extendContestDeadline(matchId, dto.extendByMinutes);
  }

  @Get(":matchId/leaderboard")
  @ApiOperation({ summary: "Get contest leaderboard for a match" })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiResponse({ status: 200, description: "Contest leaderboard" })
  getLeaderboard(@Param("matchId", ParseUUIDPipe) matchId: string) {
    return this.service.getLeaderboard(matchId);
  }
}
