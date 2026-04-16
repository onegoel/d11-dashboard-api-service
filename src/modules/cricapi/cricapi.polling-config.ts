/**
 * CricAPI polling configuration for the current ~100 hits/day budget.
 *
 * Strategy:
 * - no background polling outside the active match window
 * - adaptive intervals while a match is live
 * - one scheduler tick determines which matches are due for refresh
 */
export const CRICAPI_POLLING = {
  /** How often the in-process scheduler wakes up to check due matches. */
  SCHEDULER_TICK_MS: 60_000,

  /**
   * Frontend DB-read endpoint stale threshold base.
   * `isStale` flips after 3x this interval.
   */
  POLL_INTERVAL_MS: 180_000,

  /**
   * Short-lived cache TTL for request fan-out. Kept below the fastest live interval.
   */
  CACHE_TTL_MS: 110_000,

  /** Start considering a scheduled match shortly before kickoff. */
  POLL_START_BUFFER_MS: 5 * 60_000,

  /** Keep considering a completed match briefly for a final confirmation read. */
  POLL_END_GRACE_MS: 2 * 60_000,

  /** Hard stop if provider never marks the match as ended. */
  MAX_MATCH_DURATION_MS: 6 * 60 * 60_000,

  /** Slow cadence while waiting for a scheduled match to actually begin. */
  SCHEDULED_INTERVAL_MS: 5 * 60_000,

  /** Default live cadence for most of the match. */
  LIVE_INTERVAL_MS: 3 * 60_000,

  /** Faster cadence during chase/death-over style statuses. */
  HIGH_PRIORITY_LIVE_INTERVAL_MS: 2 * 60_000,

  /** Slower cadence for innings break / rain / no-play periods. */
  BREAK_INTERVAL_MS: 5 * 60_000,

  /** Additional slowdown when more than one match is simultaneously eligible. */
  MULTI_MATCH_INTERVAL_PENALTY_MS: 60_000,
} as const;
