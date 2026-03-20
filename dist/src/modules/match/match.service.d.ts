import { MatchStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
export type GetSeasonMatchesOptions = {
    status?: MatchStatus;
};
export declare class MatchService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSeasonMatches(seasonId: number, options?: GetSeasonMatchesOptions): Promise<({
        homeTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortCode: string;
        };
        awayTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortCode: string;
        };
    } & {
        seasonId: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        matchNo: number;
        matchDate: Date;
        status: MatchStatus;
        homeTeamId: string;
        awayTeamId: string;
    })[]>;
    updateMatchStatus(matchId: string, status: MatchStatus): Promise<{
        homeTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortCode: string;
        };
        awayTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortCode: string;
        };
    } & {
        seasonId: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        matchNo: number;
        matchDate: Date;
        status: MatchStatus;
        homeTeamId: string;
        awayTeamId: string;
    }>;
}
//# sourceMappingURL=match.service.d.ts.map