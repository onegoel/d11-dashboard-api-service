/* eslint-disable quotes */
const sanitizeHeaderValue = (value: string) => {
  const trimmed = value.trim();
  const unquoted = trimmed
    .replace(/^"(.*)"$/u, "$1")
    .replace(/^'(.*)'$/u, "$1");
  return unquoted.replace(/;+\s*$/u, "");
};

export const WISDEN_DEFAULT_EDAK = "4lFA@pe3Ohen";

const WISDEN_EDAK = sanitizeHeaderValue(
  process.env.WISDEN_EDAK ?? WISDEN_DEFAULT_EDAK,
);

const WISDEN_COOKIE = process.env.WISDEN_COOKIE
  ? process.env.WISDEN_COOKIE.trim().replace(/^"(.*)"$/u, "$1")
  : undefined;

export const WISDEN_COMP_ID = 8903;

const WISDEN_BASE_HEADERS = {
  accept: "*/*",
  "accept-encoding": "gzip, deflate, br, zstd",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  "content-type": "application/json",
  edak: WISDEN_EDAK,
  origin: "https://www.wisden.com",
  priority: "u=1, i",
  referer: "https://www.wisden.com/",
  "sec-ch-ua": '"Not(A:Brand";v="8", "Chromium";v="144", "Brave";v="144"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "sec-gpc": "1",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
} as const;

export const WISDEN_HEADERS: Readonly<Record<string, string>> = WISDEN_COOKIE
  ? { ...WISDEN_BASE_HEADERS, cookie: WISDEN_COOKIE }
  : WISDEN_BASE_HEADERS;

export const WISDEN_ENDPOINTS = {
  table: (compId = WISDEN_COMP_ID) =>
    `https://epr.ellipsedata.com/redirect/1/comp/${compId}/table`,
  scorecard: (matchGid: string) =>
    `https://epr.ellipsedata.com/redirect/1/match/${matchGid}/scorecard?lang=&advanced=false&partnerships=false`,
  advancedScorecard: (matchGid: string) =>
    `https://epr.ellipsedata.com/redirect/1/match/${matchGid}/scorecard?lang=&advanced=true&partnerships=true`,
  commentaryBasic: (matchGid: string) =>
    `https://epr.ellipsedata.com/redirect/1/match/${matchGid}/commentary?type=basic`,
  commentaryAdvanced: (matchGid: string) =>
    `https://epr.ellipsedata.com/redirect/1/match/${matchGid}/commentary?type=advanced`,
  wagonWheel: (matchGid: string) =>
    `https://epr.ellipsedata.com/redirect/1/match/${matchGid}/wagon`,
  pitchmap: (matchGid: string) =>
    `https://epr.ellipsedata.com/redirect/1/match/${matchGid}/pitchmap`,
  standings: (compId = WISDEN_COMP_ID) =>
    `https://epr.ellipsedata.com/redirect/1/comp/${compId}/table`,
} as const;
