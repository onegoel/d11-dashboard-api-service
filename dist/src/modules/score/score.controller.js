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
import { Body, Controller, Get, HttpCode, Param, ParseArrayPipe, ParseUUIDPipe, Post, } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, } from "@nestjs/swagger";
import { UploadScoreDto } from "./dto/upload-score.dto.js";
import { ScoreService } from "./score.service.js";
let ScoreController = class ScoreController {
    scoreService;
    constructor(scoreService) {
        this.scoreService = scoreService;
    }
    async getMatchScores(matchId) {
        const response = await this.scoreService.getMatchScores(matchId);
        return {
            matchId,
            scores: response.scores,
            chipAssignments: response.chipAssignments,
        };
    }
    async uploadMatchScores(matchId, scores) {
        const result = await this.scoreService.submitMatchScoresBulk(matchId, scores);
        return {
            message: "Match scores uploaded successfully",
            scores: result,
        };
    }
};
__decorate([
    Get("match/:matchId"),
    ApiOperation({
        summary: "Get match scores",
        description: "Retrieve all scores for a specific match with powerup/chip assignments",
    }),
    ApiParam({
        name: "matchId",
        format: "uuid",
        description: "The match ID",
        example: "550e8400-e29b-41d4-a716-446655440000",
    }),
    ApiResponse({
        status: 200,
        description: "Match scores retrieved successfully",
    }),
    __param(0, Param("matchId", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScoreController.prototype, "getMatchScores", null);
__decorate([
    Post("match/:matchId"),
    HttpCode(200),
    ApiOperation({
        summary: "Upload match scores",
        description: "Submit scores for all players in a match as an array",
    }),
    ApiParam({
        name: "matchId",
        format: "uuid",
        description: "The match ID",
        example: "550e8400-e29b-41d4-a716-446655440000",
    }),
    ApiBody({
        type: [UploadScoreDto],
        description: "Array of score entries to upload",
    }),
    ApiResponse({
        status: 200,
        description: "Match scores uploaded successfully",
        schema: {
            example: {
                message: "Match scores uploaded successfully",
                scores: [],
            },
        },
    }),
    __param(0, Param("matchId", ParseUUIDPipe)),
    __param(1, Body(new ParseArrayPipe({
        items: UploadScoreDto,
        whitelist: true,
        forbidNonWhitelisted: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ScoreController.prototype, "uploadMatchScores", null);
ScoreController = __decorate([
    Controller("scores"),
    ApiTags("scores"),
    __metadata("design:paramtypes", [ScoreService])
], ScoreController);
export { ScoreController };
//# sourceMappingURL=score.controller.js.map