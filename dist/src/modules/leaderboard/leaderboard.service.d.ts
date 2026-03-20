import { ChipCode } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
export declare class LeaderboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
                chipCode: ChipCode | null;
            }[];
            history: {
                matchId: string;
                matchNo: number;
                matchDate: string;
                matchLabel: string;
                points: number;
                rank: number | null;
                chipCode: ChipCode | null;
                chipName: string | null;
                cumulativePoints: number;
                didPlay: boolean;
            }[];
            powerups: {
                chipCode: ChipCode;
                chipShortCode: string;
                chipName: string;
                usedCount: number;
                maxUsesPerSeason: number;
                remainingCount: number;
            }[];
        }[];
    }>;
    getMatchLeaderboard(matchId: string): Promise<{
        name: string;
        teamName: string;
        points: number;
        rank: number;
        chipCode: ChipCode | null;
    }[]>;
}
//# sourceMappingURL=leaderboard.service.d.ts.map