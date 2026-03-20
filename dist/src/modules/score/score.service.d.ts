import { PrismaService } from "../../common/database/prisma.service.js";
import { ChipService } from "../chip/chip.service.js";
export interface MatchScore {
    seasonUserId: string;
    rank: number;
    points?: number;
}
export declare class ScoreService {
    private readonly prisma;
    private readonly chipService;
    constructor(prisma: PrismaService, chipService: ChipService);
    getMatchScores(matchId: string): Promise<{
        scores: {
            matchId: string;
            seasonUserId: string;
            points: number;
            rank: number;
            chipPlayId: string | null;
            chipCode: import("../../../generated/prisma/enums.js").ChipCode | null;
        }[];
        chipAssignments: {
            seasonUserId: string;
            chipPlayId: string;
            chipCode: import("../../../generated/prisma/enums.js").ChipCode;
            chipName: string;
            chipShortCode: string;
            multiplier: number;
            windowSize: number;
            windowIndex: number;
            usesSecondaryTeamScore: boolean;
            startMatchId: string;
            startMatchNo: number;
        }[];
    }>;
    submitMatchScoresBulk(matchId: string, scores: MatchScore[]): Promise<{
        seasonUserId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        matchId: string;
        points: number;
        rank: number;
        rawScore: number | null;
        effectiveScore: number | null;
        secondaryRawScore: number | null;
        captainPoints: number | null;
        benchPoints: number | null;
        chipPlayId: string | null;
    }[]>;
}
//# sourceMappingURL=score.service.d.ts.map