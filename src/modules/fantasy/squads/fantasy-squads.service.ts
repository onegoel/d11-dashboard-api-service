import { Injectable, Logger } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaService } from "../../../common/database/prisma.service.js";
import { WisdenService } from "../../wisden/wisden.service.js";

type WisdenSquadsResponse = {
  teams: Array<{
    team_id: number;
    team_name: string;
    players: Array<{
      batting_hand: string | null;
      bowling_hand: string | null;
      is_keeper: number;
      player_id: number;
      player_image: string | null;
      photo_url: string | null;
      player_known_as: string;
      player_name: string;
      player_role: string;
    }>;
  }>;
};

const WISDEN_SQUADS_PATH = path.join(
  process.cwd(),
  "prisma/data/wisden/squads.json",
);

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

  async ingestWisdenSquadsFromFile(filePath = WISDEN_SQUADS_PATH) {
    const raw = await readFile(filePath, "utf8");
    const payload = JSON.parse(raw) as WisdenSquadsResponse;

    let teamsSynced = 0;
    let playersUpserted = 0;
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
        const displayName = player.player_known_as || player.player_name;
        const { firstName, lastName } = splitDisplayName(displayName);
        const role = mapWisdenRoleToFantasyRole(
          player.player_role,
          player.is_keeper,
        );
        const incomingPhotoUrl =
          player.photo_url?.trim() || player.player_image?.trim() || null;

        await this.prisma.client.fantasyPlayer.upsert({
          where: { wisdenPlayerId: String(player.player_id) },
          update: {
            firstName,
            lastName,
            displayName,
            shortName: player.player_name,
            role,
            teamId: team.id,
            teamWisdenId: String(wisdenTeam.team_id),
            battingHand: player.batting_hand,
            bowlingHand: player.bowling_hand,
            ...(incomingPhotoUrl ? { photoUrl: incomingPhotoUrl } : {}),
            isActive: true,
          },
          create: {
            wisdenPlayerId: String(player.player_id),
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
        playersUpserted++;
      }
    }

    return { teamsSynced, playersUpserted, missingTeams };
  }

  async getMatchSquad(matchId: string): Promise<void> {
    this.logger.log(`Loading squad for match ${matchId}`);

    await this.ingestWisdenSquadsFromFile();

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
        wisdenScore: true,
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
        wisdenScore: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeam: { select: { wisdenTeamId: true } },
        awayTeam: { select: { wisdenTeamId: true } },
      },
    });

    const lastPlayedByTeamWisdenId = new Map<string, Set<string>>();
    for (const previousMatch of priorMatches) {
      const candidates = [
        previousMatch.homeTeam?.wisdenTeamId ?? null,
        previousMatch.awayTeam?.wisdenTeamId ?? null,
      ].filter((teamId): teamId is string => Boolean(teamId));

      for (const teamWisdenId of candidates) {
        if (lastPlayedByTeamWisdenId.has(teamWisdenId)) continue;
        lastPlayedByTeamWisdenId.set(
          teamWisdenId,
          extractPlayedPlayerIds(previousMatch.wisdenScore, teamWisdenId),
        );
      }

      if (
        teamWisdenIds.every((teamWisdenId) =>
          lastPlayedByTeamWisdenId.has(teamWisdenId),
        )
      ) {
        break;
      }
    }

    const seasonScoreWhere = matchMeta.seasonId
      ? {
          match: {
            seasonId: matchMeta.seasonId,
            matchDate: { lt: matchMeta.matchDate },
          },
        }
      : {
          match: {
            matchDate: { lt: matchMeta.matchDate },
          },
        };

    const historicalScores =
      await this.prisma.client.fantasyPlayerScore.findMany({
        where: {
          fantasyPlayerId: { in: squadPlayers.map((player) => player.id) },
          ...seasonScoreWhere,
        },
        select: {
          fantasyPlayerId: true,
          points: true,
        },
      });

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

    const seasonPointsByPlayerId = new Map<string, number>();
    for (const score of historicalScores) {
      seasonPointsByPlayerId.set(
        score.fantasyPlayerId,
        (seasonPointsByPlayerId.get(score.fantasyPlayerId) ?? 0) + score.points,
      );
    }

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
          currentSeasonPoints: seasonPointsByPlayerId.get(player.id) ?? 0,
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
          currentSeasonPoints: seasonPointsByPlayerId.get(player.id) ?? 0,
        },
      });
      created++;
    }

    this.logger.log(`Wisden squad ready: ${created} players for ${matchId}`);
  }
}
