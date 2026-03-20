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
import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, ParseUUIDPipe, Post, } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, } from "@nestjs/swagger";
import { SelectPowerupDto } from "./dto/select-powerup.dto.js";
import { ChipService } from "./chip.service.js";
let ChipController = class ChipController {
    chipService;
    constructor(chipService) {
        this.chipService = chipService;
    }
    async getSeasonPowerups(seasonId) {
        return this.chipService.getSeasonPowerupsOverview(seasonId);
    }
    async selectPowerup(seasonId, body) {
        return this.chipService.selectPowerupForSeasonMatch({
            seasonId,
            seasonUserId: body.seasonUserId,
            chipCode: body.chipCode,
            startMatchId: body.startMatchId,
        });
    }
    async deselectPowerup(chipPlayId) {
        return this.chipService.deselectPowerup(chipPlayId);
    }
};
__decorate([
    Get("season/:seasonId"),
    ApiOperation({
        summary: "Get season powerups overview",
        description: "Retrieve all available powerups and their eligibility information for a season",
    }),
    ApiParam({
        name: "seasonId",
        type: "number",
        description: "The season ID",
        example: 1,
    }),
    ApiResponse({
        status: 200,
        description: "Powerups overview retrieved successfully",
    }),
    __param(0, Param("seasonId", ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChipController.prototype, "getSeasonPowerups", null);
__decorate([
    Post("season/:seasonId/select"),
    HttpCode(200),
    ApiOperation({
        summary: "Select a powerup",
        description: "Select and activate a powerup for a season user at a specific match",
    }),
    ApiParam({
        name: "seasonId",
        type: "number",
        description: "The season ID",
        example: 1,
    }),
    ApiBody({
        type: SelectPowerupDto,
        description: "Powerup selection payload",
    }),
    ApiResponse({
        status: 200,
        description: "Powerup selected successfully",
    }),
    __param(0, Param("seasonId", ParseIntPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, SelectPowerupDto]),
    __metadata("design:returntype", Promise)
], ChipController.prototype, "selectPowerup", null);
__decorate([
    Delete("play/:chipPlayId"),
    ApiOperation({
        summary: "Deselect a powerup",
        description: "Deactivate/cancel a previously selected powerup",
    }),
    ApiParam({
        name: "chipPlayId",
        format: "uuid",
        description: "The chip play ID",
        example: "550e8400-e29b-41d4-a716-446655440000",
    }),
    ApiResponse({
        status: 200,
        description: "Powerup deselected successfully",
    }),
    __param(0, Param("chipPlayId", ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChipController.prototype, "deselectPowerup", null);
ChipController = __decorate([
    Controller("chips"),
    ApiTags("chips"),
    __metadata("design:paramtypes", [ChipService])
], ChipController);
export { ChipController };
//# sourceMappingURL=chip.controller.js.map