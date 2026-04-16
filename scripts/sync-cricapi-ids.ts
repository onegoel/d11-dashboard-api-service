import "dotenv/config";
import { prisma, pool } from "../prisma/client.js";
import {
  CRICAPI_BASE_URL,
  CRICAPI_ENDPOINTS,
} from "../src/modules/cricapi/cricapi.endpoints.js";
import type {
  MatchList,
  SeriesInfoRes,
} from "../src/modules/cricapi/cricapi.types.js";

type ScriptOptions = {
  seasonId?: number;
  seriesId?: string;
  apply: boolean;
  optional: boolean;
  skipIfComplete: boolean;
};

type DbMatch = {
  id: string;
  matchNo: number;
  matchDate: Date;
  cricApiMatchId: string | null;
  homeTeam: {
    shortCode: string;
    name: string;
  };
  awayTeam: {
    shortCode: string;
    name: string;
  };
};

type PendingUpdate = {
  dbMatchId: string;
  matchNo: number;
  cricApiMatchId: string;
  dbKickoffIso: string;
  matchedBy: "datetime+teams" | "matchNo+teams" | "teams-only";
};

const TEAM_ALIASES: Record<string, string> = {
  "royal challengers bengaluru": "RCB",
  "royal challengers bangalore": "RCB",
};

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseArgs(argv: string[]): ScriptOptions {
  const argMap = new Map<string, string>();

  for (const raw of argv) {
    const [key, value] = raw.split("=");
    if (!value) {
      continue;
    }
    argMap.set(key, value);
  }

  const seasonIdRaw =
    argMap.get("--seasonId") ??
    process.env.CRICAPI_IPL_2026_DB_SEASON_ID ??
    process.env.CRICAPI_DB_SEASON_ID;
  const seriesId =
    argMap.get("--seriesId") ??
    process.env.CRICAPI_IPL_2026_SERIES_ID ??
    process.env.CRICAPI_SERIES_ID ??
    process.env.CRICAPI_2026_SERIES_ID ??
    process.env.CRICAPI_IPL_2026_SEASON_ID;

  const seasonId = seasonIdRaw ? Number(seasonIdRaw) : undefined;
  const apply = argv.includes("--apply");
  const optional = argv.includes("--optional");
  const skipIfComplete = !argv.includes("--no-skip-if-complete");

  if (
    seasonId !== undefined &&
    (!Number.isInteger(seasonId) || seasonId <= 0)
  ) {
    throw new Error("--seasonId must be a positive integer");
  }

  return {
    seasonId,
    seriesId: seriesId?.trim(),
    apply,
    optional,
    skipIfComplete,
  };
}

async function resolveSeasonId(candidateSeasonId?: number): Promise<number> {
  if (candidateSeasonId) {
    return candidateSeasonId;
  }

  const activeSeasons = await prisma.season.findMany({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
    take: 2,
  });

  if (activeSeasons.length === 1) {
    return activeSeasons[0].id;
  }

  if (activeSeasons.length === 0) {
    throw new Error(
      "No active season found. Pass --seasonId=<id> or set CRICAPI_DB_SEASON_ID",
    );
  }

  throw new Error(
    "Multiple active seasons found. Pass --seasonId=<id> or set CRICAPI_DB_SEASON_ID",
  );
}

function resolveBaseUrl(): string {
  return CRICAPI_BASE_URL;
}

function toUtcEpochMs(dateTimeGMT: string): number {
  // CricAPI marks this field as GMT but often omits timezone suffix, so force UTC.
  const iso = dateTimeGMT.endsWith("Z") ? dateTimeGMT : `${dateTimeGMT}Z`;
  const ts = Date.parse(iso);

  if (Number.isNaN(ts)) {
    throw new Error(`Unable to parse CricAPI datetime: ${dateTimeGMT}`);
  }

  return ts;
}

function buildTeamCodeResolver(dbMatches: DbMatch[]) {
  const teamNameToCode = new Map<string, string>();

  for (const match of dbMatches) {
    teamNameToCode.set(
      normalizeName(match.homeTeam.name),
      match.homeTeam.shortCode,
    );
    teamNameToCode.set(
      normalizeName(match.awayTeam.name),
      match.awayTeam.shortCode,
    );
  }

  return (teamName: string): string | null => {
    const normalized = normalizeName(teamName);
    const direct = teamNameToCode.get(normalized);

    if (direct) {
      return direct;
    }

    const aliasCode = TEAM_ALIASES[normalized];
    return aliasCode ?? null;
  };
}

function parseMatchNoFromApiName(name: string): number | null {
  const match = name.match(/\b(\d{1,3})(?:st|nd|rd|th)\s+Match\b/i);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isSameTeamSet(
  match: DbMatch,
  teamCodeA: string,
  teamCodeB: string,
): boolean {
  const dbSet = new Set([match.homeTeam.shortCode, match.awayTeam.shortCode]);
  return dbSet.has(teamCodeA) && dbSet.has(teamCodeB);
}

async function fetchSeriesInfo(
  seriesId: string,
  baseUrl: string,
): Promise<SeriesInfoRes> {
  const endpoint = CRICAPI_ENDPOINTS.SERIES_INFO(seriesId);
  const url = `${baseUrl}/${endpoint}`;

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CricAPI series_info failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as SeriesInfoRes;

  if (payload.status !== "success") {
    throw new Error(
      `CricAPI returned non-success status: ${payload.status} (${JSON.stringify(payload.info)})`,
    );
  }

  return payload;
}

function planMatchUpdates(
  dbMatches: DbMatch[],
  apiMatches: MatchList[],
): {
  updates: PendingUpdate[];
  alreadyMapped: number;
  conflicts: string[];
  unmatchedApi: string[];
  unresolvedTeamNames: string[];
} {
  const updates: PendingUpdate[] = [];
  const conflicts: string[] = [];
  const unmatchedApi: string[] = [];
  const unresolvedTeamNames: string[] = [];

  let alreadyMapped = 0;

  const byKickoff = new Map<number, DbMatch[]>();
  const byTeamSet = new Map<string, DbMatch[]>();

  const toTeamSetKey = (a: string, b: string) => [a, b].sort().join("|");

  for (const dbMatch of dbMatches) {
    const key = dbMatch.matchDate.getTime();
    const existing = byKickoff.get(key) ?? [];
    existing.push(dbMatch);
    byKickoff.set(key, existing);

    const teamKey = toTeamSetKey(
      dbMatch.homeTeam.shortCode,
      dbMatch.awayTeam.shortCode,
    );
    const teamExisting = byTeamSet.get(teamKey) ?? [];
    teamExisting.push(dbMatch);
    byTeamSet.set(teamKey, teamExisting);
  }

  const resolveTeamCode = buildTeamCodeResolver(dbMatches);
  const assignedDbMatchIds = new Set<string>();

  for (const apiMatch of apiMatches) {
    let kickoffUtcMs: number;
    try {
      kickoffUtcMs = toUtcEpochMs(apiMatch.dateTimeGMT);
    } catch {
      unmatchedApi.push(
        `${apiMatch.id} | ${apiMatch.name} | invalid dateTimeGMT: ${apiMatch.dateTimeGMT}`,
      );
      continue;
    }

    const apiTeamCodes = apiMatch.teams.map((teamName) =>
      resolveTeamCode(teamName),
    );

    if (apiTeamCodes.some((code) => !code)) {
      unresolvedTeamNames.push(
        `${apiMatch.id} | ${apiMatch.name} | teams=${apiMatch.teams.join(" vs ")}`,
      );
      continue;
    }

    const [teamCodeA, teamCodeB] = apiTeamCodes as [string, string];

    const teamKey = toTeamSetKey(teamCodeA, teamCodeB);
    const kickoffCandidates = byKickoff.get(kickoffUtcMs) ?? [];
    let candidates = kickoffCandidates.filter((dbMatch) =>
      isSameTeamSet(dbMatch, teamCodeA, teamCodeB),
    );

    let matchedBy: PendingUpdate["matchedBy"] = "datetime+teams";

    if (candidates.length !== 1) {
      const parsedMatchNo = parseMatchNoFromApiName(apiMatch.name);
      if (parsedMatchNo) {
        const byMatchNoCandidates = dbMatches.filter(
          (dbMatch) =>
            dbMatch.matchNo === parsedMatchNo &&
            isSameTeamSet(dbMatch, teamCodeA, teamCodeB) &&
            !assignedDbMatchIds.has(dbMatch.id),
        );

        if (byMatchNoCandidates.length === 1) {
          candidates = byMatchNoCandidates;
          matchedBy = "matchNo+teams";
        }
      }
    }

    if (candidates.length !== 1) {
      const teamOnlyCandidates = (byTeamSet.get(teamKey) ?? []).filter(
        (dbMatch) => !assignedDbMatchIds.has(dbMatch.id),
      );

      if (teamOnlyCandidates.length === 1) {
        candidates = teamOnlyCandidates;
        matchedBy = "teams-only";
      }
    }

    if (candidates.length !== 1) {
      unmatchedApi.push(
        `${apiMatch.id} | ${apiMatch.name} | kickoff=${new Date(kickoffUtcMs).toISOString()} | candidates=${candidates.length}`,
      );
      continue;
    }

    const dbMatch = candidates[0];

    if (dbMatch.cricApiMatchId === apiMatch.id) {
      alreadyMapped += 1;
      assignedDbMatchIds.add(dbMatch.id);
      continue;
    }

    if (dbMatch.cricApiMatchId && dbMatch.cricApiMatchId !== apiMatch.id) {
      conflicts.push(
        `matchNo=${dbMatch.matchNo} db=${dbMatch.cricApiMatchId} api=${apiMatch.id}`,
      );
      continue;
    }

    updates.push({
      dbMatchId: dbMatch.id,
      matchNo: dbMatch.matchNo,
      cricApiMatchId: apiMatch.id,
      dbKickoffIso: dbMatch.matchDate.toISOString(),
      matchedBy,
    });
    assignedDbMatchIds.add(dbMatch.id);
  }

  return {
    updates,
    alreadyMapped,
    conflicts,
    unmatchedApi,
    unresolvedTeamNames,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const seasonId = await resolveSeasonId(options.seasonId);

  const seriesId = options.seriesId?.trim();
  const baseUrl = resolveBaseUrl();
  const apiKey = (process.env.CRICAPI_API_KEY ?? "").trim();

  if (!seriesId || !apiKey) {
    if (options.optional) {
      const missing: string[] = [];
      if (!seriesId) {
        missing.push("series ID (CRICAPI_IPL_2026_SERIES_ID)");
      }
      if (!apiKey) {
        missing.push("api key (CRICAPI_API_KEY)");
      }

      console.log(`Skipping CricAPI sync: missing ${missing.join(", ")}.`);
      return;
    }

    throw new Error("Missing required CricAPI config for sync");
  }

  console.log("---------------- CricAPI ID Sync ----------------");
  console.log(`Season ID: ${seasonId}`);
  console.log(`Series ID: ${seriesId}`);
  console.log(`Mode: ${options.apply ? "APPLY" : "DRY RUN"}`);

  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    select: {
      id: true,
      name: true,
      cricApiSeriesId: true,
    },
  });

  if (!season) {
    throw new Error(`Season ${seasonId} not found`);
  }

  if (season.cricApiSeriesId && season.cricApiSeriesId !== seriesId) {
    throw new Error(
      `Season already linked to a different CricAPI series ID (${season.cricApiSeriesId})`,
    );
  }

  const dbMatches = await prisma.match.findMany({
    where: { seasonId },
    select: {
      id: true,
      matchNo: true,
      matchDate: true,
      cricApiMatchId: true,
      homeTeam: {
        select: {
          shortCode: true,
          name: true,
        },
      },
      awayTeam: {
        select: {
          shortCode: true,
          name: true,
        },
      },
    },
    orderBy: { matchNo: "asc" },
  });

  if (dbMatches.length === 0) {
    throw new Error(`No matches found for season ${seasonId}`);
  }

  const allMapped = dbMatches.every((match) => match.cricApiMatchId);
  const seasonAlreadyLinked = season.cricApiSeriesId === seriesId;

  if (options.skipIfComplete && seasonAlreadyLinked && allMapped) {
    console.log(
      "Sync skipped: season already linked and all season matches already have CricAPI IDs.",
    );
    return;
  }

  const seriesPayload = await fetchSeriesInfo(seriesId, baseUrl);
  const apiMatches = seriesPayload.data.matchList;

  const {
    updates,
    alreadyMapped,
    conflicts,
    unmatchedApi,
    unresolvedTeamNames,
  } = planMatchUpdates(dbMatches as DbMatch[], apiMatches);

  console.log(
    `CricAPI hits used: ${seriesPayload.info.hitsUsed}/${seriesPayload.info.hitsLimit}`,
  );
  console.log(`DB matches in season: ${dbMatches.length}`);
  console.log(`CricAPI matches in series: ${apiMatches.length}`);
  console.log(`Already mapped: ${alreadyMapped}`);
  console.log(`Planned updates: ${updates.length}`);
  console.log(`Conflicts: ${conflicts.length}`);
  console.log(`Unmatched CricAPI matches: ${unmatchedApi.length}`);
  console.log(`Unresolved team names: ${unresolvedTeamNames.length}`);

  if (conflicts.length > 0) {
    console.log("\nConflicts:");
    for (const conflict of conflicts) {
      console.log(` - ${conflict}`);
    }
  }

  if (unresolvedTeamNames.length > 0) {
    console.log("\nUnresolved team names:");
    for (const item of unresolvedTeamNames) {
      console.log(` - ${item}`);
    }
  }

  if (unmatchedApi.length > 0) {
    console.log("\nUnmatched CricAPI matches:");
    for (const item of unmatchedApi) {
      console.log(` - ${item}`);
    }
  }

  if (!options.apply) {
    console.log("\nDry run complete. No DB writes performed.");
    return;
  }

  if (conflicts.length > 0) {
    throw new Error(
      "Aborting apply due to conflicts. Resolve conflicts and rerun.",
    );
  }

  await prisma.$transaction(async (tx) => {
    if (!season.cricApiSeriesId) {
      await tx.season.update({
        where: { id: seasonId },
        data: { cricApiSeriesId: seriesId },
      });
    }

    for (const update of updates) {
      await tx.match.update({
        where: { id: update.dbMatchId },
        data: { cricApiMatchId: update.cricApiMatchId },
      });
    }
  });

  console.log("\nApply complete.");
  console.log(
    `Updated season series ID: ${season.cricApiSeriesId ? "already set" : "set now"}`,
  );
  console.log(`Updated match rows: ${updates.length}`);

  if (updates.length > 0) {
    console.log("\nSample updates (first 10):");
    for (const update of updates.slice(0, 10)) {
      console.log(
        ` - matchNo=${update.matchNo} kickoff=${update.dbKickoffIso} cricApiMatchId=${update.cricApiMatchId} matchedBy=${update.matchedBy}`,
      );
    }
  }
}

main()
  .catch((error) => {
    console.error("CricAPI ID sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
