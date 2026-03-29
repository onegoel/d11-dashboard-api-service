import { Injectable, Logger } from "@nestjs/common";
import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { MatchStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { CRICAPI_POLLING } from "../cricapi/cricapi.polling-config.js";
import { CRICAPI_ENABLE_SCORE_POLLER } from "../cricapi/cricapi.source-config.js";
import { MatchService } from "./match.service.js";

@Injectable()
export class MatchScorePollerService implements OnModuleInit, OnModuleDestroy {
  private static readonly LOCK_KEY = 27032026;
  private readonly logger = new Logger(MatchScorePollerService.name);
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly matchService: MatchService,
  ) {}

  onModuleInit() {
    if (!CRICAPI_ENABLE_SCORE_POLLER) {
      this.logger.log("Match score poller disabled for this environment");
      return;
    }

    this.timer = setInterval(() => {
      void this.runTick();
    }, CRICAPI_POLLING.SCHEDULER_TICK_MS);

    void this.runTick();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async runTick() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      const [lockResult] = await this.prisma.client.$queryRaw<
        Array<{ acquired: boolean }>
      >`
        SELECT pg_try_advisory_lock(${MatchScorePollerService.LOCK_KEY}) AS acquired
      `;

      if (!lockResult?.acquired) {
        return;
      }

      const candidates = await this.getCandidates();
      if (candidates.length === 0) {
        return;
      }

      const dueMatches = candidates.filter((match) =>
        this.isDue(match, candidates.length),
      );
      for (const match of dueMatches) {
        try {
          await this.matchService.syncMatchScore(match.id);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `Score sync failed for match ${match.id}: ${message}`,
          );
        }
      }
    } finally {
      await this.prisma.client.$queryRaw`
        SELECT pg_advisory_unlock(${MatchScorePollerService.LOCK_KEY})
      `;
      this.isRunning = false;
    }
  }

  private async getCandidates() {
    const now = Date.now();
    const earliest = new Date(
      now -
        CRICAPI_POLLING.MAX_MATCH_DURATION_MS -
        CRICAPI_POLLING.POLL_END_GRACE_MS,
    );
    const latest = new Date(now + CRICAPI_POLLING.POLL_START_BUFFER_MS);

    return this.prisma.client.match.findMany({
      where: {
        cricApiMatchId: { not: null },
        matchDate: {
          gte: earliest,
          lte: latest,
        },
        status: {
          in: [MatchStatus.SCHEDULED, MatchStatus.LIVE],
        },
      },
      select: {
        id: true,
        matchDate: true,
        status: true,
        cricApiStatus: true,
        cricApiLastSyncedAt: true,
      },
      orderBy: [{ status: "desc" }, { matchDate: "asc" }],
    });
  }

  private isDue(
    match: {
      id: string;
      matchDate: Date;
      status: MatchStatus;
      cricApiStatus: string | null;
      cricApiLastSyncedAt: Date | null;
    },
    concurrentCount: number,
  ) {
    const intervalMs = this.getIntervalMs(
      match.status,
      match.cricApiStatus,
      concurrentCount,
    );
    const ageMs = match.cricApiLastSyncedAt
      ? Date.now() - match.cricApiLastSyncedAt.getTime()
      : Number.POSITIVE_INFINITY;

    if (match.status === MatchStatus.SCHEDULED) {
      const matchStartDeltaMs = match.matchDate.getTime() - Date.now();
      if (matchStartDeltaMs > CRICAPI_POLLING.POLL_START_BUFFER_MS) {
        return false;
      }
    }

    return ageMs >= intervalMs;
  }

  private getIntervalMs(
    status: MatchStatus,
    cricApiStatus: string | null,
    concurrentCount: number,
  ) {
    const normalized = (cricApiStatus ?? "").toLowerCase();

    let intervalMs = CRICAPI_POLLING.LIVE_INTERVAL_MS;
    if (status === MatchStatus.SCHEDULED) {
      intervalMs = CRICAPI_POLLING.SCHEDULED_INTERVAL_MS;
    } else if (this.isBreakStatus(normalized)) {
      intervalMs = CRICAPI_POLLING.BREAK_INTERVAL_MS;
    } else if (this.isHighPriorityLiveStatus(normalized)) {
      intervalMs = CRICAPI_POLLING.HIGH_PRIORITY_LIVE_INTERVAL_MS;
    }

    if (concurrentCount > 1) {
      intervalMs +=
        (concurrentCount - 1) * CRICAPI_POLLING.MULTI_MATCH_INTERVAL_PENALTY_MS;
    }

    return intervalMs;
  }

  private isHighPriorityLiveStatus(status: string) {
    return (
      status.includes("need") ||
      status.includes("runs in") ||
      status.includes("balls")
    );
  }

  private isBreakStatus(status: string) {
    return (
      status.includes("break") ||
      status.includes("rain") ||
      status.includes("delayed") ||
      status.includes("interruption")
    );
  }
}
