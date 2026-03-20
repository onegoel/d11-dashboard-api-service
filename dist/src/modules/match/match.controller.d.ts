import { UpdateMatchStatusDto } from "./dto/update-match-status.dto.js";
import { MatchService } from "./match.service.js";
import { MatchStatus } from "../../../generated/prisma/client.js";
export declare class MatchController {
    private readonly matchService;
    constructor(matchService: MatchService);
    getSeasonMatches(seasonId: number, status?: string): Promise<({
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
    updateMatchStatus(matchId: string, body: UpdateMatchStatusDto): Promise<{
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
//# sourceMappingURL=match.controller.d.ts.map