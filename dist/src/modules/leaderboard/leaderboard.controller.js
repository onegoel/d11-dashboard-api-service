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
import { Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiResponse, } from "@nestjs/swagger";
import { LeaderboardService } from "./leaderboard.service.js";
let LeaderboardController = class LeaderboardController {
    leaderboardService;
    constructor(leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
    async getSeasonLeaderboard(seasonId) {
        return this.leaderboardService.getSeasonLeaderboard(seasonId);
    }
    async getMatchLeaderboard(matchId) {
        const leaderboard = await this.leaderboardService.getMatchLeaderboard(matchId);
        return {
            matchId,
            leaderboard,
        };
    }
};
__decorate([
    Get("season/:seasonId"),
    ApiOperation({
        summary: "Get season leaderboard",
        description: "Retrieve the leaderboard for a specific season with player rankings",
    }),
    ApiParam({
        name: "seasonId",
        type: "number",
        description: "The season ID",
        example: 1,
    }),
    ApiResponse({
        status: 200,
        description: "Season leaderboard retrieved successfully",
    }),
    __param(0, Param("seasonId", ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getSeasonLeaderboard", null);
__decorate([
    Get("match/:matchId"),
    ApiOperation({
        summary: "Get match leaderboard",
        description: "Retrieve the leaderboard for a specific match with player rankings",
    }),
    ApiParam({
        name: "matchId",
        format: "uuid",
        description: "The match ID",
        example: "550e8400-e29b-41d4-a716-446655440000",
    }),
    ApiResponse({
        status: 200,
        description: "Match leaderboard retrieved successfully",
    }),
    __param(0, Param("matchId", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getMatchLeaderboard", null);
LeaderboardController = __decorate([
    Controller("leaderboard"),
    ApiTags("leaderboard"),
    __metadata("design:paramtypes", [LeaderboardService])
], LeaderboardController);
export { LeaderboardController };
//# sourceMappingURL=leaderboard.controller.js.map