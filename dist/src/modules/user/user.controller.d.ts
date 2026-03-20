import { UpdateDisplayNameDto } from "./dto/update-display-name.dto.js";
import { UpdateTeamNameDto } from "./dto/update-team-name.dto.js";
import { UserService } from "./user.service.js";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getSeasonPlayers(seasonId: number): Promise<({
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
    updateDisplayName(userId: number, body: UpdateDisplayNameDto): Promise<{
        id: number;
        displayName: string;
    }>;
    updateTeamName(seasonUserId: string, body: UpdateTeamNameDto): Promise<{
        id: string;
        teamName: string;
        userId: number;
        displayName: string;
    }>;
}
//# sourceMappingURL=user.controller.d.ts.map