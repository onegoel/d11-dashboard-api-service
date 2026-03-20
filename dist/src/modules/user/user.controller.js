var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, } from "@nestjs/swagger";
import { UpdateDisplayNameDto } from "./dto/update-display-name.dto.js";
import { UpdateTeamNameDto } from "./dto/update-team-name.dto.js";
import { UserService } from "./user.service.js";
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async getSeasonPlayers(seasonId) {
        return this.userService.getSeasonUsers(seasonId);
    }
    async updateDisplayName(userId, body) {
        const updatedUser = await this.userService.updateUserDisplayName(userId, body.displayName);
        return {
            id: updatedUser.id,
            displayName: updatedUser.display_name,
        };
    }
    async updateTeamName(seasonUserId, body) {
        const updatedSeasonUser = await this.userService.updateSeasonUserTeamName(seasonUserId, body.teamName);
        return {
            id: updatedSeasonUser.id,
            teamName: updatedSeasonUser.teamName,
            userId: updatedSeasonUser.userId,
            displayName: updatedSeasonUser.user.display_name,
        };
    }
};
__decorate([
    Get("season/:seasonId"),
    ApiOperation({
        summary: "Get all season users",
        description: "Retrieve all users for a specific season with their display names",
    }),
    ApiParam({
        name: "seasonId",
        type: "number",
        description: "The season ID",
        example: 1,
    }),
    ApiResponse({
        status: 200,
        description: "List of season users retrieved successfully",
    }),
    __param(0, Param("seasonId", ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getSeasonPlayers", null);
__decorate([
    Patch(":userId/display-name"),
    ApiOperation({
        summary: "Update user display name",
        description: "Update the display name for a specific user",
    }),
    ApiParam({
        name: "userId",
        type: "number",
        description: "The user ID",
        example: 1,
    }),
    ApiBody({
        type: UpdateDisplayNameDto,
        description: "Display name update payload",
    }),
    ApiResponse({
        status: 200,
        description: "Display name updated successfully",
        schema: {
            example: {
                id: 1,
                displayName: "Virat Kohli",
            },
        },
    }),
    __param(0, Param("userId", ParseIntPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateDisplayNameDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateDisplayName", null);
__decorate([
    Patch("season-user/:seasonUserId/team-name"),
    ApiOperation({
        summary: "Update season user team name",
        description: "Update the team name for a specific season user",
    }),
    ApiParam({
        name: "seasonUserId",
        format: "uuid",
        description: "The season user ID",
        example: "550e8400-e29b-41d4-a716-446655440000",
    }),
    ApiBody({
        type: UpdateTeamNameDto,
        description: "Team name update payload",
    }),
    ApiResponse({
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
    }),
    __param(0, Param("seasonUserId", ParseUUIDPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTeamNameDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateTeamName", null);
UserController = __decorate([
    Controller("users"),
    ApiTags("users"),
    __metadata("design:paramtypes", [UserService])
], UserController);
export { UserController };
//# sourceMappingURL=user.controller.js.map