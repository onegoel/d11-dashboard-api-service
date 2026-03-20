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
import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Query, } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse, } from "@nestjs/swagger";
import { UpdateMatchStatusDto } from "./dto/update-match-status.dto.js";
import { MatchService } from "./match.service.js";
import { MatchStatus } from "../../../generated/prisma/client.js";
let MatchController = class MatchController {
    matchService;
    constructor(matchService) {
        this.matchService = matchService;
    }
    async getSeasonMatches(seasonId, status) {
        if (status) {
            const matchStatus = (typeof status === "string" ? status.toUpperCase() : status);
            return this.matchService.getSeasonMatches(seasonId, {
                status: matchStatus,
            });
        }
        return this.matchService.getSeasonMatches(seasonId);
    }
    async updateMatchStatus(matchId, body) {
        return this.matchService.updateMatchStatus(matchId, body.status);
    }
};
__decorate([
    Get("season/:seasonId"),
    ApiOperation({
        summary: "Get all season matches",
        description: "Retrieve all matches for a specific season with optional status filter",
    }),
    ApiParam({
        name: "seasonId",
        type: "number",
        description: "The season ID",
        example: 1,
    }),
    ApiQuery({
        name: "status",
        required: false,
        description: "Optional match status filter (NOT_STARTED, IN_PROGRESS, COMPLETED)",
        example: "NOT_STARTED",
    }),
    ApiResponse({
        status: 200,
        description: "List of season matches retrieved successfully",
    }),
    __param(0, Param("seasonId", ParseIntPipe)),
    __param(1, Query("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], MatchController.prototype, "getSeasonMatches", null);
__decorate([
    Patch(":matchId/status"),
    ApiOperation({
        summary: "Update match status",
        description: "Update the status of a specific match",
    }),
    ApiParam({
        name: "matchId",
        format: "uuid",
        description: "The match ID",
        example: "550e8400-e29b-41d4-a716-446655440000",
    }),
    ApiBody({
        type: UpdateMatchStatusDto,
        description: "Match status update payload",
    }),
    ApiResponse({
        status: 200,
        description: "Match status updated successfully",
    }),
    __param(0, Param("matchId", ParseUUIDPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateMatchStatusDto]),
    __metadata("design:returntype", Promise)
], MatchController.prototype, "updateMatchStatus", null);
MatchController = __decorate([
    Controller("matches"),
    ApiTags("matches"),
    __metadata("design:paramtypes", [MatchService])
], MatchController);
export { MatchController };
//# sourceMappingURL=match.controller.js.map