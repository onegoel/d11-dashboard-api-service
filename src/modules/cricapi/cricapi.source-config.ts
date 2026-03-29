export type CricApiScoreSource = "auto" | "mock" | "live";

function parseOptionalBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  return undefined;
}

function resolveCricApiScoreSource(): Exclude<CricApiScoreSource, "auto"> {
  const configured = (process.env.CRICAPI_SCORE_SOURCE ?? "auto")
    .trim()
    .toLowerCase();

  if (configured === "mock" || configured === "live") {
    return configured;
  }

  // Default behavior: non-production uses mock data, production uses live CricAPI.
  return process.env.NODE_ENV === "production" ? "live" : "mock";
}

export const CRICAPI_SCORE_SOURCE = resolveCricApiScoreSource();
export const CRICAPI_USE_MOCK_SCORE = CRICAPI_SCORE_SOURCE === "mock";

// Poller is production-only by default; can be overridden explicitly.
export const CRICAPI_ENABLE_SCORE_POLLER =
  parseOptionalBoolean(process.env.CRICAPI_ENABLE_SCORE_POLLER) ??
  process.env.NODE_ENV === "production";

// Dev/mock score fallback is disabled by default to avoid showing faux live scores.
export const CRICAPI_ENABLE_MOCK_SCORE_FALLBACK =
  parseOptionalBoolean(process.env.CRICAPI_ENABLE_MOCK_SCORE_FALLBACK) ?? false;

export const CRICAPI_MATCH_INFO_MOCK_FILE = new URL(
  "./mocks/cricapi-match-info-mock.json",
  import.meta.url,
);
