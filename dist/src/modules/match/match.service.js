var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from "@nestjs/common";
import { MatchStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { isPrismaRecordNotFoundError } from "../../common/errors/prisma-error.utils.js";
let MatchService = class MatchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSeasonMatches(seasonId, options = {}) {
        return this.prisma.client.match.findMany({
            where: {
                seasonId,
                ...(options.status ? { status: options.status } : {}),
            },
            orderBy: { matchDate: "asc" },
            include: {
                homeTeam: true,
                awayTeam: true,
            },
        });
    }
    async updateMatchStatus(matchId, status) {
        try {
            return await this.prisma.client.match.update({
                where: { id: matchId },
                data: { status },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                },
            });
        }
        catch (error) {
            if (isPrismaRecordNotFoundError(error)) {
                throw new NotFoundException("Match not found");
            }
            throw error;
        }
    }
};
MatchService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], MatchService);
export { MatchService };
//# sourceMappingURL=match.service.js.map