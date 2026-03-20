import { LeaderboardService } from "./leaderboard.service.js";
export declare class LeaderboardController {
    private readonly leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getSeasonLeaderboard(seasonId: number): Promise<{
        seasonId: number;
        completedMatches: {
            id: string;
            matchNo: number;
            matchDate: string;
            matchLabel: string;
        }[];
        leaderboard: {
            id: string;
            name: string;
            displayName: string;
            userName: string;
            fullName: string;
            teamName: string;
            team: string;
            points: number;
            gamesDropCount: number;
            finalPoints: number;
            played: number;
            wins: number;
            averageRank: number | null;
            recentForm: {
                matchId: string;
                matchNo: number;
                rank: number;
                chipCode: import("../../../generated/prisma/enums.js").ChipCode | null;
            }[];
            history: {
                matchId: string;
                matchNo: number;
                matchDate: string;
                matchLabel: string;
                points: number;
                rank: number | null;
                chipCode: import("../../../generated/prisma/enums.js").ChipCode | null;
                chipName: string | null;
                cumulativePoints: number;
                didPlay: boolean;
            }[];
            powerups: {
                chipCode: import("../../../generated/prisma/enums.js").ChipCode;
                chipShortCode: string;
                chipName: string;
                usedCount: number;
                maxUsesPerSeason: number;
                remainingCount: number;
            }[];
        }[];
    }>;
    getMatchLeaderboard(matchId: string): Promise<{
        matchId: string;
        leaderboard: {
            name: string;
            teamName: string;
            points: number;
            rank: number;
            chipCode: import("../../../generated/prisma/enums.js").ChipCode | null;
        }[];
    }>;
}
//# sourceMappingURL=leaderboard.controller.d.ts.map