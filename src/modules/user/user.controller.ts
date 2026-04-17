import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
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
import { AppUserGuard } from "../auth/app-user.guard.js";
import { CurrentAppUser } from "../auth/current-app-user.decorator.js";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard.js";
import type { AppUserContext } from "../auth/auth.types.js";
import { CreateProfilePhotoUploadDto } from "./dto/create-profile-photo-upload.dto.js";
import { UpdateDisplayNameDto } from "./dto/update-display-name.dto.js";
import { UpdateTeamNameDto } from "./dto/update-team-name.dto.js";
import { UserService } from "./user.service.js";

@Controller("users")
@ApiTags("users")
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, AppUserGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("season/:seasonId")
  @ApiOperation({
    summary: "Get all season users",
    description:
      "Retrieve all users for a specific season with their display names",
  })
  @ApiParam({
    name: "seasonId",
    type: "number",
    description: "The season ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "List of season users retrieved successfully",
  })
  async getSeasonPlayers(@Param("seasonId", ParseIntPipe) seasonId: number) {
    return this.userService.getSeasonUsers(seasonId);
  }

  @Post(":userId/profile-photo-upload-url")
  @ApiOperation({
    summary: "Create signed upload URL for a profile photo",
    description:
      "Returns a short-lived signed URL for direct image upload to Cloud Storage",
  })
  @ApiParam({
    name: "userId",
    type: "number",
    description: "The user ID",
    example: 1,
  })
  @ApiBody({
    type: CreateProfilePhotoUploadDto,
    description: "Profile photo upload metadata",
  })
  @ApiResponse({
    status: 201,
    description: "Signed upload URL created",
  })
  async createProfilePhotoUploadUrl(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() body: CreateProfilePhotoUploadDto,
    @CurrentAppUser() appUser: AppUserContext,
  ) {
    return this.userService.createProfilePhotoUploadUrl(
      userId,
      body.contentType,
      body.sizeBytes,
      {
        id: appUser.id,
        role: appUser.role,
      },
    );
  }

  @Patch(":userId/display-name")
  @ApiOperation({
    summary: "Update user display name",
    description: "Update the display name for a specific user",
  })
  @ApiParam({
    name: "userId",
    type: "number",
    description: "The user ID",
    example: 1,
  })
  @ApiBody({
    type: UpdateDisplayNameDto,
    description: "Display name update payload",
  })
  @ApiResponse({
    status: 200,
    description: "Display name updated successfully",
    schema: {
      example: {
        id: 1,
        displayName: "Virat Kohli",
      },
    },
  })
  async updateDisplayName(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() body: UpdateDisplayNameDto,
    @CurrentAppUser() appUser: AppUserContext,
  ) {
    const updatedUser = await this.userService.updateUserDisplayName(
      userId,
      body.displayName,
      body.photoUrl,
      {
        id: appUser.id,
        role: appUser.role,
      },
    );

    return {
      id: updatedUser.id,
      displayName: updatedUser.display_name,
    };
  }

  @Patch("season-user/:seasonUserId/team-name")
  @ApiOperation({
    summary: "Update season user team name",
    description: "Update the team name for a specific season user",
  })
  @ApiParam({
    name: "seasonUserId",
    format: "uuid",
    description: "The season user ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiBody({
    type: UpdateTeamNameDto,
    description: "Team name update payload",
  })
  @ApiResponse({
    status: 200,
    description: "Team name updated successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        teamName: "Mumbai Knights",
        userId: 1,
        displayName: "Aryan Goel",
      },
    },
  })
  async updateTeamName(
    @Param("seasonUserId", ParseUUIDPipe) seasonUserId: string,
    @Body() body: UpdateTeamNameDto,
    @CurrentAppUser() appUser: AppUserContext,
  ) {
    const updatedSeasonUser = await this.userService.updateSeasonUserTeamName(
      seasonUserId,
      body.teamName,
      {
        id: appUser.id,
        role: appUser.role,
      },
    );

    return {
      id: updatedSeasonUser.id,
      teamName: updatedSeasonUser.teamName,
      userId: updatedSeasonUser.userId,
      displayName: updatedSeasonUser.user.display_name,
    };
  }
}
