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
import { PrismaService } from "../../common/database/prisma.service.js";
import { isPrismaRecordNotFoundError } from "../../common/errors/prisma-error.utils.js";
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSeasonUsers(seasonId) {
        return this.prisma.client.seasonUser.findMany({
            where: {
                seasonId,
            },
            include: {
                user: true,
            },
        });
    }
    async updateUserDisplayName(userId, displayName) {
        try {
            return await this.prisma.client.user.update({
                where: { id: userId },
                data: { display_name: displayName },
            });
        }
        catch (error) {
            if (isPrismaRecordNotFoundError(error)) {
                throw new NotFoundException("User not found");
            }
            throw error;
        }
    }
    async updateSeasonUserTeamName(seasonUserId, teamName) {
        try {
            return await this.prisma.client.seasonUser.update({
                where: { id: seasonUserId },
                data: { teamName },
                include: {
                    user: true,
                },
            });
        }
        catch (error) {
            if (isPrismaRecordNotFoundError(error)) {
                throw new NotFoundException("Season user not found");
            }
            throw error;
        }
    }
};
UserService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UserService);
export { UserService };
//# sourceMappingURL=user.service.js.map