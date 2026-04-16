import { HttpException, Injectable, Logger } from "@nestjs/common";
import { AxiosError } from "axios";
import type {
  WisdenCommentaryResponse,
  WisdenScorecardResponse,
} from "../../common/types/wisden.types.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { WisdenService } from "../wisden/wisden.service.js";

interface CacheEntry {
  data: unknown;
  setAt: number;
}

// TTL for on-demand cache hits; poller refreshes more frequently
const ON_DEMAND_TTL_MS = 90_000;

@Injectable()
export class LiveScoreService {
  private readonly logger = new Logger(LiveScoreService.name);

  private readonly scorecardCache = new Map<string, CacheEntry>();
  private readonly commentaryCache = new Map<string, CacheEntry>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly wisden: WisdenService,
  ) {}

  // ── Public read APIs ──────────────────────────────────────────────────────

  async getWisdenScorecard(matchId: string): Promise<unknown> {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { wisdenMatchGid: true, wisdenScore: true },
    });

    if (!match) return null;

    const storedScorecard = match.wisdenScore ?? null;
    const wisdenMatchGid = match.wisdenMatchGid;

    // Match GID is now managed via fixture-seed ingestion; no runtime lookup needed.
    if (!wisdenMatchGid) {
      if (storedScorecard !== null) {
        this.logger.warn(
          `Serving stored scorecard snapshot for matchId=${matchId} because wisdenMatchGid is missing`,
        );
        return storedScorecard;
      }
      return null;
    }

    const key = `wisden:scorecard:${wisdenMatchGid}`;
    const cached = this.getIfFresh(this.scorecardCache, key);
    if (cached !== undefined) return cached;

    const stale = this.getAny(this.scorecardCache, key);
    try {
      const data = await this.wisden.getScorecard(wisdenMatchGid);
      this.setCache(this.scorecardCache, key, data);
      return data;
    } catch (error) {
      if (stale !== undefined && this.isThrottleOrUpstreamUnavailable(error)) {
        this.logger.warn(
          `Serving stale scorecard cache for ${wisdenMatchGid} due to upstream throttle/unavailability`,
        );
        return stale;
      }
      throw error;
    }
  }

  async getWisdenCommentary(matchId: string): Promise<unknown> {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { wisdenMatchGid: true },
    });

    const wisdenMatchGid = match?.wisdenMatchGid ?? null;
    if (!wisdenMatchGid) return null;

    const key = `wisden:commentary:${wisdenMatchGid}`;
    const cached = this.getIfFresh(this.commentaryCache, key);
    if (cached !== undefined) return cached;

    const stale = this.getAny(this.commentaryCache, key);
    try {
      const data = await this.wisden.getCommentaryBasic(wisdenMatchGid);
      this.setCache(this.commentaryCache, key, data);
      return data;
    } catch (error) {
      if (stale !== undefined && this.isThrottleOrUpstreamUnavailable(error)) {
        this.logger.warn(
          `Serving stale commentary cache for ${wisdenMatchGid} due to upstream throttle/unavailability`,
        );
        return stale;
      }
      throw error;
    }
  }

  async pollAndCacheWisdenMatch(matchGid: string): Promise<{
    scorecard: WisdenScorecardResponse | null;
    commentary: WisdenCommentaryResponse | null;
  }> {
    const [scorecard, commentary] = await Promise.allSettled([
      this.fetchAndCacheWisdenScorecard(matchGid),
      this.fetchAndCacheWisdenCommentary(matchGid),
    ]);

    return {
      scorecard: scorecard.status === "fulfilled" ? scorecard.value : null,
      commentary: commentary.status === "fulfilled" ? commentary.value : null,
    };
  }

  evictWisdenMatch(matchGid: string): void {
    this.scorecardCache.delete(`wisden:scorecard:${matchGid}`);
    this.commentaryCache.delete(`wisden:commentary:${matchGid}`);
  }

  private async fetchAndCacheWisdenScorecard(
    matchGid: string,
  ): Promise<WisdenScorecardResponse> {
    try {
      const data = await this.wisden.getScorecard(matchGid);
      this.setCache(this.scorecardCache, `wisden:scorecard:${matchGid}`, data);
      return data;
    } catch (err) {
      const msg = err instanceof AxiosError ? err.message : String(err);
      this.logger.error(
        `Wisden scorecard fetch failed for ${matchGid}: ${msg}`,
      );
      throw err;
    }
  }

  private async fetchAndCacheWisdenCommentary(
    matchGid: string,
  ): Promise<WisdenCommentaryResponse> {
    try {
      const data = await this.wisden.getCommentaryBasic(matchGid);
      this.setCache(
        this.commentaryCache,
        `wisden:commentary:${matchGid}`,
        data,
      );
      return data;
    } catch (err) {
      const msg = err instanceof AxiosError ? err.message : String(err);
      this.logger.error(
        `Wisden commentary fetch failed for ${matchGid}: ${msg}`,
      );
      throw err;
    }
  }

  private getIfFresh(
    cache: Map<string, CacheEntry>,
    key: string,
  ): unknown | undefined {
    const cached = cache.get(key);
    if (!cached) return undefined;
    if (Date.now() - cached.setAt >= ON_DEMAND_TTL_MS) return undefined;
    return cached.data;
  }

  private getAny(
    cache: Map<string, CacheEntry>,
    key: string,
  ): unknown | undefined {
    return cache.get(key)?.data;
  }

  private setCache(
    cache: Map<string, CacheEntry>,
    key: string,
    data: unknown,
  ): void {
    cache.set(key, { data, setAt: Date.now() });
  }

  private isThrottleOrUpstreamUnavailable(error: unknown): boolean {
    if (error instanceof HttpException) {
      const status = error.getStatus();
      return status === 429 || status === 503;
    }

    if (error instanceof AxiosError) {
      const status = error.response?.status;
      return status === 429 || status === 503;
    }

    return false;
  }
}
