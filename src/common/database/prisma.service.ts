import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import type { PrismaClient } from "../../../generated/prisma/client.js";
import { pool, prisma } from "../../../prisma/client.js";

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly client: PrismaClient = prisma;

  async onModuleDestroy() {
    await this.client.$disconnect();
    await pool.end();
  }
}
