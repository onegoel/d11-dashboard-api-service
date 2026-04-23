import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { AxiosError } from "axios";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  WISDEN_COMP_ID,
  WISDEN_DEFAULT_EDAK,
  WISDEN_ENDPOINTS,
  WISDEN_HEADERS,
} from "../../common/constants/wisden.constants.js";
import type {
  WisdenCommentaryResponse,
  WisdenScorecardResponse,
  WisdenTableResponse,
  WisdenWagonWheelResponse,
  WisdenPitchmapResponse,
} from "../../common/types/wisden.types.js";

const execFileAsync = promisify(execFile);

interface CachedWisdenResponse {
  data: unknown;
  setAt: number;
}

@Injectable()
export class WisdenService {
  private readonly logger = new Logger(WisdenService.name);
  private readonly maxRetries = 2;
  private readonly inFlightRequests = new Map<string, Promise<unknown>>();
  private readonly cooldownUntilByUrl = new Map<string, number>();
  private readonly cacheByUrl = new Map<string, CachedWisdenResponse>();
  private readonly freshCacheTtlMs = 2 * 60_000;
  private readonly staleCacheMaxAgeMs = 30 * 60_000;

  async getTable(compId = WISDEN_COMP_ID): Promise<WisdenTableResponse> {
    return this.getJson<WisdenTableResponse>(
      WISDEN_ENDPOINTS.table(compId),
      `table:${compId}`,
    );
  }

  async getScorecard(matchGid: string): Promise<WisdenScorecardResponse> {
    return this.getJson<WisdenScorecardResponse>(
      WISDEN_ENDPOINTS.scorecard(matchGid),
      `scorecard:${matchGid}`,
    );
  }

  async getCommentaryBasic(
    matchGid: string,
  ): Promise<WisdenCommentaryResponse> {
    return this.getJson<WisdenCommentaryResponse>(
      WISDEN_ENDPOINTS.commentaryBasic(matchGid),
      `commentary:${matchGid}`,
    );
  }

  async getAdvancedScorecard(
    matchGid: string,
  ): Promise<WisdenScorecardResponse> {
    return this.getJson<WisdenScorecardResponse>(
      WISDEN_ENDPOINTS.advancedScorecard(matchGid),
      `scorecard-advanced:${matchGid}`,
    );
  }

  async getCommentaryAdvanced(
    matchGid: string,
  ): Promise<WisdenCommentaryResponse> {
    return this.getJson<WisdenCommentaryResponse>(
      WISDEN_ENDPOINTS.commentaryAdvanced(matchGid),
      `commentary-advanced:${matchGid}`,
    );
  }

  async getWagonWheel(matchGid: string): Promise<WisdenWagonWheelResponse> {
    return this.getJson<WisdenWagonWheelResponse>(
      WISDEN_ENDPOINTS.wagonWheel(matchGid),
      `wagon-wheel:${matchGid}`,
    );
  }

  async getPitchmap(matchGid: string): Promise<WisdenPitchmapResponse> {
    return this.getJson<WisdenPitchmapResponse>(
      WISDEN_ENDPOINTS.pitchmap(matchGid),
      `pitchmap:${matchGid}`,
    );
  }

  private async getJson<T>(url: string, label: string): Promise<T> {
    if (this.shouldUseResilientCache(label)) {
      const fresh = this.getCachedIfFresh<T>(url);
      if (fresh !== undefined) {
        return fresh;
      }
    }

    const cooldownUntil = this.cooldownUntilByUrl.get(url) ?? 0;
    if (cooldownUntil > Date.now()) {
      if (this.shouldUseResilientCache(label)) {
        const stale = this.getCachedIfStaleAllowed<T>(url);
        if (stale !== undefined) {
          this.logger.warn(
            `Serving stale ${label} cache during cooldown window`,
          );
          return stale;
        }
      }

      throw new HttpException(
        "Wisden rate limit reached. Please retry shortly.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const inFlight = this.inFlightRequests.get(url);
    if (inFlight) {
      return inFlight as Promise<T>;
    }

    const requestPromise = this.fetchJsonWithRetry<T>(url, label)
      .then((data) => {
        if (this.shouldUseResilientCache(label)) {
          this.cacheByUrl.set(url, { data, setAt: Date.now() });
        }
        return data;
      })
      .catch((error: unknown) => {
        if (
          this.shouldUseResilientCache(label) &&
          this.isThrottleOrUpstreamUnavailable(error)
        ) {
          const stale = this.getCachedIfStaleAllowed<T>(url);
          if (stale !== undefined) {
            this.logger.warn(
              `Serving stale ${label} cache due to upstream throttle/unavailability`,
            );
            return stale;
          }
        }

        throw error;
      })
      .finally(() => {
        this.inFlightRequests.delete(url);
      });

    this.inFlightRequests.set(url, requestPromise as Promise<unknown>);
    return requestPromise;
  }

  private async fetchJsonWithRetry<T>(url: string, label: string): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.getJsonViaCurl<T>(url);
      } catch (error) {
        const axiosError = error instanceof AxiosError ? error : null;
        const status = this.extractStatusCode(error, axiosError);
        const blockedByPayload =
          status === 403 &&
          this.extractErrorMessage(error, axiosError)
            .toLowerCase()
            .includes("service not found / not available to user");
        const retryable =
          status === 429 ||
          blockedByPayload ||
          (status !== undefined && status >= 500);
        const isLastAttempt = attempt === this.maxRetries;

        if (!isLastAttempt && retryable) {
          const retryAfterMs =
            this.getRetryAfterMs(axiosError) ?? 500 * (attempt + 1);
          this.logger.warn(
            `Wisden request retry for ${label}: status=${status ?? "unknown"} attempt=${attempt + 1}/${this.maxRetries} wait=${retryAfterMs}ms`,
          );
          await this.delay(retryAfterMs);
          continue;
        }

        const message = this.extractErrorMessage(error, axiosError);
        this.logger.error(`Wisden request failed for ${label}: ${message}`);

        if (this.isCurlBinaryMissing(error)) {
          throw new ServiceUnavailableException(
            "Wisden client misconfigured in runtime: curl binary not found.",
          );
        }

        if (status === 429) {
          const retryAfterMs =
            this.getRetryAfterMs(axiosError, error) ?? 30_000;
          this.cooldownUntilByUrl.set(url, Date.now() + retryAfterMs);
          throw new HttpException(
            "Wisden rate limit reached. Please retry shortly.",
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        if (status !== undefined && status >= 500) {
          throw new ServiceUnavailableException(
            "Wisden upstream service is temporarily unavailable.",
          );
        }

        if (status !== undefined && status >= 400) {
          throw new BadGatewayException(
            `Wisden request failed with status ${status}.`,
          );
        }

        throw new ServiceUnavailableException(
          "Wisden request failed due to a network error.",
        );
      }
    }

    throw new ServiceUnavailableException("Wisden request failed.");
  }

  private async getJsonViaCurl<T>(url: string): Promise<T> {
    const primaryHeaders = this.toMutableHeaders(WISDEN_HEADERS);
    const primaryResponse = await this.runCurl(url, primaryHeaders);

    if (primaryResponse.statusCode >= 200 && primaryResponse.statusCode < 300) {
      const parsedPrimary = this.parseJsonBody<T>(primaryResponse.body);
      if (!this.isWisdenErrorPayload(parsedPrimary)) {
        return parsedPrimary;
      }

      // If env EDAK is stale/malformed but default token still works, retry once.
      if ((primaryHeaders.edak ?? "") !== WISDEN_DEFAULT_EDAK) {
        const fallbackHeaders = {
          ...primaryHeaders,
          edak: WISDEN_DEFAULT_EDAK,
        };

        const fallbackResponse = await this.runCurl(url, fallbackHeaders);
        if (
          fallbackResponse.statusCode >= 200 &&
          fallbackResponse.statusCode < 300
        ) {
          const parsedFallback = this.parseJsonBody<T>(fallbackResponse.body);
          if (!this.isWisdenErrorPayload(parsedFallback)) {
            this.logger.warn(
              "Wisden request succeeded only with default EDAK fallback; update WISDEN_EDAK env value.",
            );
            return parsedFallback;
          }
        }
      }

      throw {
        statusCode: 403,
        message: this.getWisdenPayloadError(parsedPrimary),
      };
    }

    const checkpointBlocked = this.isVercelCheckpointHtml(primaryResponse.body);

    throw {
      statusCode: checkpointBlocked ? 429 : primaryResponse.statusCode,
      message: checkpointBlocked
        ? "Wisden endpoint blocked by Vercel Security Checkpoint. Add WISDEN_COOKIE from a validated browser session."
        : primaryResponse.body ||
          `Wisden curl request failed with status ${primaryResponse.statusCode}`,
      retryAfterMs:
        primaryResponse.statusCode === 429 || checkpointBlocked
          ? 30_000
          : undefined,
    };
  }

  private async runCurl(
    url: string,
    headers: Record<string, string>,
  ): Promise<{ statusCode: number; body: string }> {
    const args = [
      "-sS",
      "--http2",
      "--compressed",
      "--connect-timeout",
      "8",
      "--max-time",
      "15",
      "-w",
      "\n__STATUS__:%{http_code}",
      url,
    ];

    for (const [key, value] of Object.entries(headers)) {
      args.push("-H", `${key}: ${value}`);
    }

    const { stdout } = await execFileAsync("curl", args);
    const marker = "\n__STATUS__:";
    const markerIndex = stdout.lastIndexOf(marker);

    if (markerIndex < 0) {
      throw new ServiceUnavailableException(
        "Wisden curl response missing status marker.",
      );
    }

    const body = stdout.slice(0, markerIndex);
    const statusStr = stdout.slice(markerIndex + marker.length).trim();
    const statusCode = Number(statusStr);

    if (!Number.isFinite(statusCode)) {
      throw new ServiceUnavailableException(
        "Wisden curl response had invalid status code.",
      );
    }

    return { statusCode, body };
  }

  private parseJsonBody<T>(body: string): T {
    try {
      return JSON.parse(body) as T;
    } catch {
      throw new BadGatewayException("Wisden curl response was not valid JSON.");
    }
  }

  private toMutableHeaders(
    headers: Record<string, string>,
  ): Record<string, string> {
    return Object.fromEntries(Object.entries(headers));
  }

  private extractStatusCode(
    error: unknown,
    axiosError: AxiosError | null,
  ): number | undefined {
    if (axiosError?.response?.status !== undefined) {
      return axiosError.response.status;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as { statusCode?: unknown }).statusCode === "number"
    ) {
      return (error as { statusCode: number }).statusCode;
    }

    return undefined;
  }

  private getRetryAfterMs(
    error: AxiosError | null,
    rawError?: unknown,
  ): number | null {
    const retryAfter =
      error?.response?.headers?.["retry-after"] ??
      (typeof rawError === "object" &&
      rawError !== null &&
      "retryAfterMs" in rawError
        ? String((rawError as { retryAfterMs?: unknown }).retryAfterMs)
        : undefined);
    if (typeof retryAfter === "string") {
      const seconds = Number(retryAfter);
      if (Number.isFinite(seconds) && seconds > 0) {
        return seconds * 1000;
      }

      const millis = Number(retryAfter);
      if (Number.isFinite(millis) && millis > 0) {
        return millis;
      }
    }
    return null;
  }

  private extractErrorMessage(
    error: unknown,
    axiosError: AxiosError | null,
  ): string {
    if (axiosError?.message) {
      return axiosError.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      return this.truncateError((error as { message: string }).message);
    }

    return this.truncateError(String(error));
  }

  private isCurlBinaryMissing(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    const err = error as { code?: unknown; syscall?: unknown; path?: unknown };
    return (
      err.code === "ENOENT" &&
      typeof err.path === "string" &&
      err.path === "curl"
    );
  }

  private truncateError(message: string): string {
    if (message.length <= 320) {
      return message;
    }

    return `${message.slice(0, 320)}...(truncated)`;
  }

  private isWisdenErrorPayload(payload: unknown): boolean {
    if (typeof payload !== "object" || payload === null) {
      return false;
    }

    const error = (payload as { error?: unknown }).error;
    if (typeof error !== "string") {
      return false;
    }

    const normalized = error.toLowerCase();
    return (
      normalized.includes("service not found / not available to user") ||
      normalized.includes("service not available to user")
    );
  }

  private isVercelCheckpointHtml(body: string): boolean {
    const normalized = body.toLowerCase();
    return (
      normalized.includes("vercel security checkpoint") ||
      normalized.includes("we're verifying your browser")
    );
  }

  private getWisdenPayloadError(payload: unknown): string {
    if (typeof payload === "object" && payload !== null) {
      const error = (payload as { error?: unknown }).error;
      if (typeof error === "string") {
        return this.truncateError(error);
      }
    }

    return "service not found / not available to user";
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldUseResilientCache(label: string): boolean {
    return label.startsWith("table:");
  }

  private getCachedIfFresh<T>(url: string): T | undefined {
    const cached = this.cacheByUrl.get(url);
    if (!cached) {
      return undefined;
    }

    if (Date.now() - cached.setAt >= this.freshCacheTtlMs) {
      return undefined;
    }

    return cached.data as T;
  }

  private getCachedIfStaleAllowed<T>(url: string): T | undefined {
    const cached = this.cacheByUrl.get(url);
    if (!cached) {
      return undefined;
    }

    if (Date.now() - cached.setAt > this.staleCacheMaxAgeMs) {
      return undefined;
    }

    return cached.data as T;
  }

  private isThrottleOrUpstreamUnavailable(error: unknown): boolean {
    if (error instanceof HttpException) {
      const status = error.getStatus();
      return status === 429 || status === 502 || status === 503;
    }

    if (error instanceof AxiosError) {
      const status = error.response?.status;
      return status === 429 || status === 502 || status === 503;
    }

    const status = this.extractStatusCode(error, null);
    return status === 429 || status === 502 || status === 503;
  }
}
