import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "../../../generated/prisma/client.js";
import { AppUserGuard } from "../auth/app-user.guard.js";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { AdminService } from "./admin.service.js";
import {
  AddSeasonUserDto,
  AuditLogQueryDto,
  BulkCreateAdminMatchesDto,
  CreateAdminMatchDto,
  CreateSeasonDto,
  DeleteAdminMatchDto,
  ReassignChipPlayDto,
  ReopenMatchDto,
  RemoveSeasonUserDto,
  ReplaceMatchScoresDto,
  ReverseChipPlayDto,
  UpdateUserRoleDto,
  UpdateAdminMatchDto,
  UpdateScoreRankDto,
  UpdateSeasonDto,
} from "./dto/admin.dto.js";

@Controller("admin")
@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("seasons")
  @ApiOperation({ summary: "Get all seasons for admin workflows" })
  getSeasons() {
    return this.adminService.getSeasons();
  }

  @Get("teams")
  @ApiOperation({ summary: "Get all teams for admin workflows" })
  getTeams() {
    return this.adminService.getTeams();
  }

  @Get("users")
  @ApiOperation({ summary: "Get all users for admin workflows" })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch("users/:userId/role")
  @ApiOperation({ summary: "Update a user's role" })
  @ApiParam({ name: "userId", example: 1 })
  @ApiBody({ type: UpdateUserRoleDto })
  updateUserRole(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() body: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, body.role, body.reason);
  }

  @Get("audit-log")
  @ApiOperation({ summary: "Get admin audit log" })
  @ApiQuery({ name: "limit", required: false, example: 50 })
  @ApiQuery({ name: "entityType", required: false, example: "match" })
  @ApiQuery({ name: "entityId", required: false, example: "550e8400-e29b-41d4-a716-446655440000" })
  getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.adminService.getAuditLogs(query);
  }

  @Post("matches")
  @ApiOperation({ summary: "Create a match" })
  @ApiBody({ type: CreateAdminMatchDto })
  createMatch(@Body() body: CreateAdminMatchDto) {
    return this.adminService.createMatch(body);
  }

  @Post("matches/bulk")
  @ApiOperation({ summary: "Bulk create matches" })
  @ApiBody({ type: BulkCreateAdminMatchesDto })
  bulkCreateMatches(@Body() body: BulkCreateAdminMatchesDto) {
    return this.adminService.bulkCreateMatches(body);
  }

  @Patch("matches/:matchId")
  @ApiOperation({ summary: "Update a match" })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiBody({ type: UpdateAdminMatchDto })
  updateMatch(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Body() body: UpdateAdminMatchDto,
  ) {
    return this.adminService.updateMatch(matchId, body);
  }

  @Delete("matches/:matchId")
  @ApiOperation({ summary: "Delete a match" })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiBody({ type: DeleteAdminMatchDto, required: false })
  deleteMatch(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Body() body: DeleteAdminMatchDto,
  ) {
    return this.adminService.deleteMatch(matchId, body ?? {});
  }

  @Post("matches/:matchId/reopen")
  @ApiOperation({ summary: "Reopen a completed match for correction" })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiBody({ type: ReopenMatchDto, required: false })
  reopenMatch(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Body() body: ReopenMatchDto,
  ) {
    return this.adminService.reopenMatch(matchId, body ?? {});
  }

  @Post("matches/:matchId/scores/replace")
  @ApiOperation({ summary: "Replace the full score table for a match" })
  @ApiParam({ name: "matchId", format: "uuid" })
  @ApiBody({ type: ReplaceMatchScoresDto })
  replaceMatchScores(
    @Param("matchId", ParseUUIDPipe) matchId: string,
    @Body() body: ReplaceMatchScoresDto,
  ) {
    return this.adminService.replaceMatchScores(matchId, body);
  }

  @Patch("scores/:scoreId")
  @ApiOperation({ summary: "Change a single score's rank and re-sequence the match" })
  @ApiParam({ name: "scoreId", format: "uuid" })
  @ApiBody({ type: UpdateScoreRankDto })
  updateScoreRank(
    @Param("scoreId", ParseUUIDPipe) scoreId: string,
    @Body() body: UpdateScoreRankDto,
  ) {
    return this.adminService.updateScoreRank(scoreId, body);
  }

  @Delete("scores/:scoreId")
  @ApiOperation({ summary: "Delete a score and mark that player as DNP for the match" })
  @ApiParam({ name: "scoreId", format: "uuid" })
  @ApiBody({ type: ReverseChipPlayDto, required: false })
  deleteScore(
    @Param("scoreId", ParseUUIDPipe) scoreId: string,
    @Body() body: ReverseChipPlayDto,
  ) {
    return this.adminService.deleteScore(scoreId, body?.reason);
  }

  @Post("chips/:chipPlayId/reverse")
  @ApiOperation({ summary: "Reverse/cancel a powerup even after deadline" })
  @ApiParam({ name: "chipPlayId", format: "uuid" })
  @ApiBody({ type: ReverseChipPlayDto, required: false })
  reverseChipPlay(
    @Param("chipPlayId", ParseUUIDPipe) chipPlayId: string,
    @Body() body: ReverseChipPlayDto,
  ) {
    return this.adminService.reverseChipPlay(chipPlayId, body ?? {});
  }

  @Post("chips/:chipPlayId/reassign")
  @ApiOperation({ summary: "Reassign a chip play to a different chip/player/start match" })
  @ApiParam({ name: "chipPlayId", format: "uuid" })
  @ApiBody({ type: ReassignChipPlayDto })
  reassignChipPlay(
    @Param("chipPlayId", ParseUUIDPipe) chipPlayId: string,
    @Body() body: ReassignChipPlayDto,
  ) {
    return this.adminService.reassignChipPlay(chipPlayId, body);
  }

  @Post("seasons")
  @ApiOperation({ summary: "Create a season" })
  @ApiBody({ type: CreateSeasonDto })
  createSeason(@Body() body: CreateSeasonDto) {
    return this.adminService.createSeason(body);
  }

  @Patch("seasons/:seasonId")
  @ApiOperation({ summary: "Update a season" })
  @ApiParam({ name: "seasonId", example: 1 })
  @ApiBody({ type: UpdateSeasonDto })
  updateSeason(
    @Param("seasonId", ParseIntPipe) seasonId: number,
    @Body() body: UpdateSeasonDto,
  ) {
    return this.adminService.updateSeason(seasonId, body);
  }

  @Post("seasons/:seasonId/users")
  @ApiOperation({ summary: "Add a user to a season" })
  @ApiParam({ name: "seasonId", example: 1 })
  @ApiBody({ type: AddSeasonUserDto })
  addSeasonUser(
    @Param("seasonId", ParseIntPipe) seasonId: number,
    @Body() body: AddSeasonUserDto,
  ) {
    return this.adminService.addSeasonUser(seasonId, body);
  }

  @Delete("season-users/:seasonUserId")
  @ApiOperation({ summary: "Remove a user from a season" })
  @ApiParam({ name: "seasonUserId", format: "uuid" })
  @ApiBody({ type: RemoveSeasonUserDto, required: false })
  removeSeasonUser(
    @Param("seasonUserId", ParseUUIDPipe) seasonUserId: string,
    @Body() body: RemoveSeasonUserDto,
  ) {
    return this.adminService.removeSeasonUser(seasonUserId, body ?? {});
  }
}