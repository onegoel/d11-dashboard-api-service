import { LeaderboardService } from "./leaderboard.service.js";
export declare class LeaderboardController {
    private readonly leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getSeasonPowerRankings(seasonId: number): Promise<{
        seasonId: number;
        windowSize: number;
        weights: number[];
        recentMatches: {
            id: string;
            matchNo: number;
            matchDate: string;
            matchLabel: string;
        }[];
        rankings: {
            seasonUserId: string;
            userId: number;
            userName: string;
            displayName: string;
            teamName: string;
            powerScore: number;
            components: {
                weightedAveragePoints: number;
                baseScore: number;
                playedMatches: number;
                missedMatches: number;
                participationPenalty: number;
                wins: number;
                podiums: number;
                winBonus: number;
                podiumBonus: number;
                trendBonus: number;
            };
            recentWindow: {
                matchId: string;
                matchNo: number;
                matchDate: string;
                matchLabel: string;
                didPlay: boolean;
                rank: number | null;
                points: number;
                weight: number;
                weightedContribution: number;
            }[];
            rank: number;
        }[];
    }>;
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
                didPlay: boolean;
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