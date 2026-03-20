import { ChipCode, ChipPlayStatus, MatchStatus, Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
type PrismaExecutor = Prisma.TransactionClient | PrismaClient;
export type ActiveChipAssignment = {
    seasonUserId: string;
    chipPlayId: string;
    chipCode: ChipCode;
    chipName: string;
    chipShortCode: string;
    multiplier: number;
    windowSize: number;
    windowIndex: number;
    usesSecondaryTeamScore: boolean;
    startMatchId: string;
    startMatchNo: number;
};
type SelectPowerupInput = {
    seasonId: number;
    seasonUserId: string;
    chipCode: ChipCode;
    startMatchId: string;
};
export declare class ChipServiceError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare const resolveActiveChipAssignmentsForMatchTx: (tx: PrismaExecutor, seasonId: number, matchId: string, seasonUserIds?: string[]) => Promise<Map<string, ActiveChipAssignment>>;
export declare class ChipService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSeasonPowerupsOverview(seasonId: number): Promise<{
        seasonId: number;
        chipTypes: {
            id: number;
            code: ChipCode;
            shortCode: string;
            name: string;
            description: string | null;
            multiplier: number;
            maxUsesPerSeason: number;
            effectWindowMatches: number;
            requiresBottomHalf: boolean;
            usesSecondaryTeamScore: boolean;
        }[];
        selectableMatches: {
            id: string;
            matchNo: number;
            matchDate: string;
            status: MatchStatus;
            matchLabel: string;
        }[];
        users: {
            seasonUserId: string;
            displayName: string;
            teamName: string;
            position: number | null;
            chipInventory: {
                chipCode: ChipCode;
                chipShortCode: string;
                chipName: string;
                maxUsesPerSeason: number;
                usedCount: number;
                remainingCount: number;
            }[];
            eligibilityByChipCode: Record<ChipCode, boolean>;
            plays: {
                id: string;
                seasonUserId: string;
                chipCode: ChipCode;
                chipShortCode: string;
                chipName: string;
                status: ChipPlayStatus;
                startMatchId: string;
                startMatchNo: number;
                startMatchDate: string;
                startMatchLabel: string;
                affectedMatches: {
                    id: string;
                    matchNo: number;
                    matchDate: string;
                    matchLabel: string;
                }[];
                canDeselect: boolean;
                hasStarted: boolean;
                canceledAt: string | null;
                createdAt: string;
            }[];
        }[];
        generatedAt: string;
    }>;
    selectPowerupForSeasonMatch(input: SelectPowerupInput): Promise<{
        id: string;
        seasonUserId: string;
        chipCode: ChipCode;
        chipShortCode: string;
        chipName: string;
        status: ChipPlayStatus;
        startMatchId: string;
        startMatchNo: number;
        startMatchDate: string;
        startMatchLabel: string;
        affectedMatches: {
            id: string;
            matchNo: number;
            matchDate: string;
            matchLabel: string;
        }[];
        canDeselect: boolean;
        hasStarted: boolean;
        canceledAt: string | null;
        createdAt: string;
    }>;
    deselectPowerup(chipPlayId: string): Promise<{
        id: string;
        seasonUserId: string;
        chipCode: ChipCode;
        chipShortCode: string;
        chipName: string;
        status: ChipPlayStatus;
        startMatchId: string;
        startMatchNo: number;
        startMatchDate: string;
        startMatchLabel: string;
        affectedMatches: {
            id: string;
            matchNo: number;
            matchDate: string;
            matchLabel: string;
        }[];
        canDeselect: boolean;
        hasStarted: boolean;
        canceledAt: string | null;
        createdAt: string;
    }>;
    resolveActiveChipAssignmentsForMatchTx(tx: PrismaExecutor, seasonId: number, matchId: string, seasonUserIds?: string[]): Promise<Map<string, ActiveChipAssignment>>;
}
export {};
//# sourceMappingURL=chip.service.d.ts.map