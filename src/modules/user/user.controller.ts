import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { UpdateDisplayNameDto } from "./dto/update-display-name.dto.js";
import { UpdateTeamNameDto } from "./dto/update-team-name.dto.js";
import { UserService } from "./user.service.js";

@Controller("users")
@ApiTags("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("season/:seasonId")
  @ApiOperation({
    summary: "Get all season users",
    description: "Retrieve all users for a specific season with their display names",
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
  ) {
    const updatedUser = await this.userService.updateUserDisplayName(
      userId,
      body.displayName,
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
  ) {
    const updatedSeasonUser = await this.userService.updateSeasonUserTeamName(
      seasonUserId,
      body.teamName,
    );

    return {
      id: updatedSeasonUser.id,
      teamName: updatedSeasonUser.teamName,
      userId: updatedSeasonUser.userId,
      displayName: updatedSeasonUser.user.display_name,
    };
  }
}
