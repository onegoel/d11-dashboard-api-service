import { UploadScoreDto } from "./dto/upload-score.dto.js";
import { ScoreService } from "./score.service.js";
export declare class ScoreController {
    private readonly scoreService;
    constructor(scoreService: ScoreService);
    getMatchScores(matchId: string): Promise<{
        matchId: string;
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
    uploadMatchScores(matchId: string, scores: UploadScoreDto[]): Promise<{
        message: string;
        scores: {
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
        }[];
    }>;
}
//# sourceMappingURL=score.controller.d.ts.map