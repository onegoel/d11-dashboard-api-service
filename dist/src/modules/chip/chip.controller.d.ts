import { SelectPowerupDto } from "./dto/select-powerup.dto.js";
import { ChipService } from "./chip.service.js";
export declare class ChipController {
    private readonly chipService;
    constructor(chipService: ChipService);
    getSeasonPowerups(seasonId: number): Promise<{
        seasonId: number;
        chipTypes: {
            id: number;
            code: import("../../../generated/prisma/enums.js").ChipCode;
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
            status: import("../../../generated/prisma/enums.js").MatchStatus;
            matchLabel: string;
        }[];
        users: {
            seasonUserId: string;
            displayName: string;
            teamName: string;
            position: number | null;
            chipInventory: {
                chipCode: import("../../../generated/prisma/enums.js").ChipCode;
                chipShortCode: string;
                chipName: string;
                maxUsesPerSeason: number;
                usedCount: number;
                remainingCount: number;
            }[];
            eligibilityByChipCode: Record<import("../../../generated/prisma/enums.js").ChipCode, boolean>;
            plays: {
                id: string;
                seasonUserId: string;
                chipCode: import("../../../generated/prisma/enums.js").ChipCode;
                chipShortCode: string;
                chipName: string;
                status: import("../../../generated/prisma/enums.js").ChipPlayStatus;
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
    selectPowerup(seasonId: number, body: SelectPowerupDto): Promise<{
        id: string;
        seasonUserId: string;
        chipCode: import("../../../generated/prisma/enums.js").ChipCode;
        chipShortCode: string;
        chipName: string;
        status: import("../../../generated/prisma/enums.js").ChipPlayStatus;
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
        chipCode: import("../../../generated/prisma/enums.js").ChipCode;
        chipShortCode: string;
        chipName: string;
        status: import("../../../generated/prisma/enums.js").ChipPlayStatus;
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
}
//# sourceMappingURL=chip.controller.d.ts.map