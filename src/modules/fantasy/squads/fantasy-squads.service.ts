import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../../common/database/prisma.service.js";
import { WisdenService } from "../../wisden/wisden.service.js";
import {
  BowlingTechnique,
  BowlingStyle,
} from "../../../../generated/prisma/client.js";
import type { WisdenSquadsResponse } from "../../../common/types/wisden.types.js";

const BOWLING_STYLE_MAP: Record<string, BowlingStyle> = {
  pace: BowlingStyle.PACE,
  spin: BowlingStyle.SPIN,
};

function mapBowlingStyle(raw: string | null | undefined): BowlingStyle | null {
  if (!raw) return null;
  return BOWLING_STYLE_MAP[raw.toLowerCase().trim()] ?? null;
}

const BOWLING_TECHNIQUE_MAP: Record<string, BowlingTechnique> = {
  "off break": BowlingTechnique.OFF_BREAK,
  "left orthodox": BowlingTechnique.LEFT_ORTHODOX,
  "right pace": BowlingTechnique.RIGHT_PACE,
  "left pace": BowlingTechnique.LEFT_PACE,
  "leg break": BowlingTechnique.LEG_BREAK,
  "left unorthodox": BowlingTechnique.LEFT_UNORTHODOX,
};

function mapBowlingTechnique(
  raw: string | null | undefined,
): BowlingTechnique | null {
  if (!raw) return null;
  return BOWLING_TECHNIQUE_MAP[raw.toLowerCase().trim()] ?? null;
}

const SYNC_PLAYERS_CRON_END = new Date("2026-06-01T00:00:00Z");

const DEFAULT_CREDIT_VALUE = 8;

type PersistedScorecard = {
  team1?: {
    id?: number | string;
    players?: Array<{
      player_id?: number | string;
      type?: string | null;
    }>;
  };
  team2?: {
    id?: number | string;
    players?: Array<{
      player_id?: number | string;
      type?: string | null;
    }>;
  };
  innings?: Array<{
    batting_team_id?: number | string;
    batting?: Array<{
      player_id?: number | string;
    }>;
  }>;
};

function extractPlayedPlayerIds(
  scorecard: unknown,
  teamWisdenId?: string | null,
): Set<string> {
  if (!scorecard || typeof scorecard !== "object") return new Set();

  const payload = scorecard as PersistedScorecard;
  const teams = [payload.team1, payload.team2].filter(Boolean);
  const matchingTeams = teamWisdenId
    ? teams.filter((team) => String(team?.id ?? "") === teamWisdenId)
    : teams;

  const teamPlayers = matchingTeams.flatMap((team) =>
    (team?.players ?? [])
      .filter((player) => (player.type ?? "") !== "unused")
      .map((player) => String(player.player_id ?? ""))
      .filter(Boolean),
  );

  // Some Wisden scorecard variants do not expose team.players with `type`.
  // In that case, innings batting cards still contain the active XI.
  const inningsPlayers = (payload.innings ?? [])
    .filter((innings) =>
      teamWisdenId
        ? String(innings.batting_team_id ?? "") === teamWisdenId
        : true,
    )
    .flatMap((innings) =>
      (innings.batting ?? [])
        .map((batter) => String(batter.player_id ?? ""))
        .filter(Boolean),
    );

  return new Set([...teamPlayers, ...inningsPlayers]);
}

function extractAnnouncedSquadPlayerIds(
  scorecard: unknown,
  teamWisdenId?: string | null,
): Set<string> {
  if (!scorecard || typeof scorecard !== "object") return new Set();

  const payload = scorecard as PersistedScorecard;
  const teams = [payload.team1, payload.team2].filter(Boolean);
  const matchingTeams = teamWisdenId
    ? teams.filter((team) => String(team?.id ?? "") === teamWisdenId)
    : teams;

  const squadPlayers = matchingTeams.flatMap((team) =>
    (team?.players ?? [])
      .map((player) => String(player.player_id ?? ""))
      .filter(Boolean),
  );

  return new Set(squadPlayers);
}

function splitDisplayName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? displayName;
  const lastName = parts.slice(1).join(" ") || firstName;
  return { firstName, lastName };
}

function mapWisdenRoleToFantasyRole(
  role: string,
  isKeeper: number,
): "BATSMAN" | "BOWLER" | "ALL_ROUNDER" | "WICKET_KEEPER" {
  if (isKeeper) return "WICKET_KEEPER";

  const normalized = role.toLowerCase().trim();
  if (normalized.includes("keeper")) return "WICKET_KEEPER";
  if (normalized.includes("allrounder") || normalized.includes("allround")) {
    return "ALL_ROUNDER";
  }
  if (normalized.includes("bowler")) return "BOWLER";
  return "BATSMAN";
}

@Injectable()
export class FantasySquadsService {
  private readonly logger = new Logger(FantasySquadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wisden: WisdenService,
  ) {}

  async syncPlayersFromWisdenApi(): Promise<{
    teamsSynced: number;
    playersAdded: number;
    playersSkipped: number;
    missingTeams: number;
  }> {
    const payload = await this.wisden.getSquads();

    let teamsSynced = 0;
    let playersAdded = 0;
    let playersSkipped = 0;
    let missingTeams = 0;

    for (const wisdenTeam of payload.teams) {
      const team = await this.prisma.client.team.findFirst({
        where: {
          OR: [
            { wisdenTeamId: String(wisdenTeam.team_id) },
            { name: wisdenTeam.team_name },
          ],
        },
      });

      if (!team) {
        this.logger.warn(`No DB team found for ${wisdenTeam.team_name}`);
        missingTeams++;
        continue;
      }

      if (team.wisdenTeamId !== String(wisdenTeam.team_id)) {
        await this.prisma.client.team.update({
          where: { id: team.id },
          data: { wisdenTeamId: String(wisdenTeam.team_id) },
        });
        teamsSynced++;
      }

      for (const player of wisdenTeam.players) {
        const wisdenPlayerId = String(player.player_id);
        const existing = await this.prisma.client.fantasyPlayer.findUnique({
          where: { wisdenPlayerId },
          select: { id: true },
        });

        if (existing) {
          // Insert-only: existing players are owned by admin. Never overwrite.
          playersSkipped++;
          continue;
        }

        const displayName = player.player_known_as || player.player_name;
        const { firstName, lastName } = splitDisplayName(displayName);
        const role = mapWisdenRoleToFantasyRole(
          player.player_role,
          player.is_keeper,
        );
        const incomingPhotoUrl =
          player.photo_url?.trim() || player.player_image?.trim() || null;

        await this.prisma.client.fantasyPlayer.create({
          data: {
            wisdenPlayerId,
            firstName,
            lastName,
            displayName,
            shortName: player.player_name,
            role,
            teamId: team.id,
            teamWisdenId: String(wisdenTeam.team_id),
            battingHand: player.batting_hand,
            bowlingHand: player.bowling_hand,
            photoUrl: incomingPhotoUrl,
            isActive: true,
          },
        });
        playersAdded++;
      }
    }

    this.logger.log(
      `syncPlayersFromWisdenApi: added=${playersAdded}, skipped=${playersSkipped}, teamsSynced=${teamsSynced}, missingTeams=${missingTeams}`,
    );
    return { teamsSynced, playersAdded, playersSkipped, missingTeams };
  }

  // Daily 14:30 IST until 31 May 2026 (final IPL 2026 squad lock).
  @Cron("30 14 * * *", { timeZone: "Asia/Kolkata" })
  async syncPlayersDaily(): Promise<void> {
    if (Date.now() >= SYNC_PLAYERS_CRON_END.getTime()) {
      return;
    }
    try {
      await this.syncPlayersFromWisdenApi();
    } catch (err) {
      this.logger.error(
        `Daily syncPlayersFromWisdenApi failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  async getMatchSquad(matchId: string): Promise<void> {
    this.logger.log(`Loading squad for match ${matchId}`);

    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          select: { wisdenTeamId: true },
        },
        awayTeam: {
          select: { wisdenTeamId: true },
        },
      },
    });

    if (!match) {
      this.logger.warn(`Match not found: ${matchId}`);
      return;
    }

    const homeTeamWisdenId = match.homeTeam?.wisdenTeamId ?? null;
    const awayTeamWisdenId = match.awayTeam?.wisdenTeamId ?? null;

    if (!homeTeamWisdenId || !awayTeamWisdenId) {
      this.logger.warn(
        `Match ${matchId} missing Wisden team IDs; cannot build player pool`,
      );
      return;
    }

    await this.buildWisdenPlayerPool(match.id, match.wisdenMatchGid, [
      homeTeamWisdenId,
      awayTeamWisdenId,
    ]);
  }

  async getAnnouncedSquadPlayerIdsForMatch(
    wisdenMatchGid: string | null,
    teamWisdenIds: string[],
  ): Promise<Set<string> | null> {
    if (!wisdenMatchGid || teamWisdenIds.length === 0) {
      return null;
    }

    try {
      const scorecard = await this.wisden.getScorecard(wisdenMatchGid);
      const announcedIds = new Set<string>();
      for (const teamWisdenId of teamWisdenIds) {
        for (const id of extractAnnouncedSquadPlayerIds(
          scorecard,
          teamWisdenId,
        )) {
          announcedIds.add(id);
        }
      }
      return announcedIds.size > 0 ? announcedIds : null;
    } catch (error) {
      this.logger.warn(
        `Unable to fetch announced squad for wisdenMatchGid=${wisdenMatchGid}. ${String(error)}`,
      );
      return null;
    }
  }

  private async buildWisdenPlayerPool(
    matchId: string,
    wisdenMatchGid: string | null,
    teamWisdenIds: string[],
  ): Promise<void> {
    const matchMeta = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        seasonId: true,
        matchDate: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeam: { select: { wisdenTeamId: true } },
        awayTeam: { select: { wisdenTeamId: true } },
      },
    });

    if (!matchMeta) {
      this.logger.warn(`Match ${matchId} not found while building player pool`);
      return;
    }

    const squadPlayers = await this.prisma.client.fantasyPlayer.findMany({
      where: {
        teamWisdenId: { in: teamWisdenIds },
        isActive: true,
      },
    });

    if (!squadPlayers.length) {
      this.logger.warn(
        `No Wisden squad players available for match ${matchId}`,
      );
      return;
    }

    const priorMatches = await this.prisma.client.match.findMany({
      where: {
        status: "COMPLETED",
        matchDate: { lt: matchMeta.matchDate },
        OR: [
          { homeTeamId: { in: [matchMeta.homeTeamId, matchMeta.awayTeamId] } },
          { awayTeamId: { in: [matchMeta.homeTeamId, matchMeta.awayTeamId] } },
        ],
      },
      orderBy: { matchDate: "desc" },
      select: {
        id: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeam: { select: { wisdenTeamId: true } },
        awayTeam: { select: { wisdenTeamId: true } },
      },
    });

    // Map each team's last completed match. Walk priorMatches in date-desc order
    // and record the most recent match per team.
    const lastMatchIdByTeamWisdenId = new Map<string, string>();
    for (const previousMatch of priorMatches) {
      const candidates = [
        previousMatch.homeTeam?.wisdenTeamId ?? null,
        previousMatch.awayTeam?.wisdenTeamId ?? null,
      ].filter((teamId): teamId is string => Boolean(teamId));

      for (const teamWisdenId of candidates) {
        if (lastMatchIdByTeamWisdenId.has(teamWisdenId)) continue;
        lastMatchIdByTeamWisdenId.set(teamWisdenId, previousMatch.id);
      }

      if (
        teamWisdenIds.every((teamWisdenId) =>
          lastMatchIdByTeamWisdenId.has(teamWisdenId),
        )
      ) {
        break;
      }
    }

    // Source of truth for "did the player play": FantasyPlayerMatchStats.played
    // (set by the scoring pipeline). Reading from wisdenScore JSON is unreliable
    // because pre-fix snapshots may include unused squad members.
    const relevantLastMatchIds = Array.from(
      new Set(lastMatchIdByTeamWisdenId.values()),
    );
    const lastPlayedRows = relevantLastMatchIds.length
      ? await this.prisma.client.fantasyPlayerMatchStats.findMany({
          where: {
            matchId: { in: relevantLastMatchIds },
            played: true,
          },
          select: {
            matchId: true,
            fantasyPlayer: {
              select: { wisdenPlayerId: true, teamWisdenId: true },
            },
          },
        })
      : [];

    const lastPlayedByTeamWisdenId = new Map<string, Set<string>>();
    for (const [teamWisdenId, lastMatchId] of lastMatchIdByTeamWisdenId) {
      const set = new Set<string>();
      for (const row of lastPlayedRows) {
        if (row.matchId !== lastMatchId) continue;
        const wisdenPlayerId = row.fantasyPlayer.wisdenPlayerId;
        const playerTeamWisdenId = row.fantasyPlayer.teamWisdenId;
        if (!wisdenPlayerId) continue;
        if (playerTeamWisdenId && playerTeamWisdenId !== teamWisdenId) continue;
        set.add(wisdenPlayerId);
      }
      lastPlayedByTeamWisdenId.set(teamWisdenId, set);
    }

    // Use the canonical season stats table instead of summing raw scores.
    const seasonStatsRows = matchMeta.seasonId
      ? await this.prisma.client.fantasyPlayerSeasonStats.findMany({
          where: {
            fantasyPlayerId: { in: squadPlayers.map((player) => player.id) },
            seasonId: matchMeta.seasonId,
          },
          select: { fantasyPlayerId: true, fantasyPointsTotal: true },
        })
      : [];
    const seasonStatsByPlayerId = new Map(
      seasonStatsRows.map((s) => [s.fantasyPlayerId, s.fantasyPointsTotal]),
    );

    let effectiveScorecard: unknown = null;

    // API-only source for XI/sub flags.
    if (wisdenMatchGid) {
      try {
        const liveScorecard = await this.wisden.getScorecard(wisdenMatchGid);
        effectiveScorecard = liveScorecard;
      } catch (error) {
        this.logger.warn(
          `Unable to fetch live Wisden scorecard for ${matchId}; XI/sub flags left unchanged for this sync. ${String(error)}`,
        );
      }
    }

    const currentPlayingXi = extractPlayedPlayerIds(effectiveScorecard);
    const currentPlayingXiKnown = currentPlayingXi.size > 0;

    let created = 0;
    for (const player of squadPlayers) {
      const creditValue = DEFAULT_CREDIT_VALUE;
      const isLastMatchPlayed = Boolean(
        player.wisdenPlayerId &&
        player.teamWisdenId &&
        lastPlayedByTeamWisdenId
          .get(player.teamWisdenId)
          ?.has(player.wisdenPlayerId),
      );
      const isInPlayingXI = Boolean(
        currentPlayingXiKnown &&
        player.wisdenPlayerId &&
        currentPlayingXi.has(player.wisdenPlayerId),
      );

      const xiDelta = currentPlayingXiKnown
        ? {
            isInPlayingXI,
            playerIn: isInPlayingXI && !isLastMatchPlayed,
            playerOut: !isInPlayingXI && isLastMatchPlayed,
          }
        : {};

      await this.prisma.client.fantasyMatchPlayer.upsert({
        where: {
          matchId_fantasyPlayerId: {
            matchId,
            fantasyPlayerId: player.id,
          },
        },
        update: {
          creditValue,
          wisdenMatchGid,
          wisdenPlayerId: player.wisdenPlayerId,
          teamWisdenId: player.teamWisdenId,
          ...xiDelta,
          isLastMatchPlayed,
          inLastMatchBestXI: false,
          currentSeasonPoints: seasonStatsByPlayerId.get(player.id) ?? 0,
        },
        create: {
          matchId,
          fantasyPlayerId: player.id,
          creditValue,
          wisdenMatchGid,
          wisdenPlayerId: player.wisdenPlayerId,
          teamWisdenId: player.teamWisdenId,
          isInPlayingXI,
          playerIn: isInPlayingXI && !isLastMatchPlayed,
          playerOut:
            currentPlayingXiKnown && !isInPlayingXI && isLastMatchPlayed,
          isLastMatchPlayed,
          inLastMatchBestXI: false,
          currentSeasonPoints: seasonStatsByPlayerId.get(player.id) ?? 0,
        },
      });
      created++;
    }

    this.logger.log(`Wisden squad ready: ${created} players for ${matchId}`);
  }

  async enrichPlayersFromPitchmap(matchGid: string): Promise<number> {
    const pitchmap = await this.wisden.getPitchmap(matchGid);
    let updated = 0;
    for (const team of pitchmap.teams ?? []) {
      for (const p of team.players ?? []) {
        const wisdenPlayerId = String(p.id);
        if (!wisdenPlayerId) continue;

        const existing = await this.prisma.client.fantasyPlayer.findUnique({
          where: { wisdenPlayerId },
          select: {
            id: true,
            bowlingTechnique: true,
            bowlingStyle: true,
            battingHand: true,
            bowlingHand: true,
          },
        });
        if (!existing) continue;

        // Only fill fields that are currently null/empty/invalid. Never overwrite
        // values an admin has set via the admin panel.
        const data: {
          bowlingTechnique?: BowlingTechnique;
          bowlingStyle?: BowlingStyle;
          battingHand?: string;
          bowlingHand?: string;
        } = {};

        if (!existing.bowlingTechnique) {
          const mapped = mapBowlingTechnique(p.bowling_technique);
          if (mapped) data.bowlingTechnique = mapped;
        }
        if (!existing.bowlingStyle) {
          const mapped = mapBowlingStyle(p.bowling_type_simple);
          if (mapped) data.bowlingStyle = mapped;
        }
        if (!existing.battingHand?.trim()) {
          const raw = p.batting_hand?.trim();
          if (raw) data.battingHand = raw;
        }
        if (!existing.bowlingHand?.trim()) {
          const raw = p.bowling_hand?.trim();
          if (raw) data.bowlingHand = raw;
        }

        if (Object.keys(data).length === 0) continue;

        await this.prisma.client.fantasyPlayer.update({
          where: { id: existing.id },
          data,
        });
        updated++;
      }
    }
    this.logger.log(
      `enrichPlayersFromPitchmap(${matchGid}): ${updated} player(s) updated`,
    );
    return updated;
  }
}
