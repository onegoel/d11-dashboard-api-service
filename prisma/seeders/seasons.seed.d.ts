import { PrismaClient } from "../../generated/prisma/client.js";
export declare function seedSeason(prisma: PrismaClient): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    year: number;
    isActive: boolean;
    startDate: Date | null;
    endDate: Date | null;
    winnerUserId: number | null;
}>;
//# sourceMappingURL=seasons.seed.d.ts.map