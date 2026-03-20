import type { OnModuleDestroy } from "@nestjs/common";
import type { PrismaClient } from "../../../generated/prisma/client.js";
export declare class PrismaService implements OnModuleDestroy {
    readonly client: PrismaClient;
    onModuleDestroy(): Promise<void>;
}
//# sourceMappingURL=prisma.service.d.ts.map