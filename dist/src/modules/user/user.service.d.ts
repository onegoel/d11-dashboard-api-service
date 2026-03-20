import { PrismaService } from "../../common/database/prisma.service.js";
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSeasonUsers(seasonId: number): Promise<({
        user: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            last_name: string;
            first_name: string;
            display_name: string;
            user_name: string;
        };
    } & {
        seasonId: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        teamName: string;
        finalRank: number | null;
        totalPoints: number;
    })[]>;
    updateUserDisplayName(userId: number, displayName: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        last_name: string;
        first_name: string;
        display_name: string;
        user_name: string;
    }>;
    updateSeasonUserTeamName(seasonUserId: string, teamName: string): Promise<{
        user: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            last_name: string;
            first_name: string;
            display_name: string;
            user_name: string;
        };
    } & {
        seasonId: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        teamName: string;
        finalRank: number | null;
        totalPoints: number;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map