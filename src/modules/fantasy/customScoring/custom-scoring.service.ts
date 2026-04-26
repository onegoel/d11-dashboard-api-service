import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service.js";
import { FANTASY_T20_POINT_SYSTEM } from "../../../common/constants/fantasy-point-rule.constants.js";
import {
  computeCustomPoints,
  type FantasyPointSystem,
  type StoredPlayerMatchStats,
} from "./compute-custom-points.js";
import type {
  CreateCustomScoringSystemDto,
  UpdateCustomScoringSystemDto,
} from "./dto/custom-scoring.dto.js";

@Injectable()
export class CustomScoringService {
  constructor(private readonly prisma: PrismaService) {}

  /** Shape-validate a submitted config against FantasyPointSystem. */
  private validateConfig(raw: unknown): FantasyPointSystem {
    if (!raw || typeof raw !== "object") {
      throw new BadRequestException("config must be an object");
    }
    const cfg = raw as Partial<FantasyPointSystem>;
    const required = ["batting", "bowling", "fielding", "other"] as const;
    for (const k of required) {
      if (!cfg[k] || typeof cfg[k] !== "object") {
        throw new BadRequestException(`config.${k} is required`);
      }
    }
    if (!cfg.batting?.strike_rate || typeof cfg.batting.strike_rate !== "object") {
      throw new BadRequestException("config.batting.strike_rate is required");
    }
    if (!cfg.bowling?.economy_rate || typeof cfg.bowling.economy_rate !== "object") {
      throw new BadRequestException("config.bowling.economy_rate is required");
    }
    // Deeper shape matches runtime duck-typing; wrong numbers just produce 0.
    return cfg as FantasyPointSystem;
  }

  /** Expose the default (production) config so the UI can prefill forms. */
  getDefaultConfig(): FantasyPointSystem {
    return FANTASY_T20_POINT_SYSTEM;
  }

  async create(userId: number, dto: CreateCustomScoringSystemDto) {
    const config = this.validateConfig(dto.config);
    return this.prisma.client.customScoringSystem.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        createdById: userId,
        config: config as unknown as object,
      },
      include: { createdBy: { select: { id: true, display_name: true, user_name: true } } },
    });
  }

  async list() {
    return this.prisma.client.customScoringSystem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { id: true, display_name: true, user_name: true } } },
    });
  }

  async getById(id: string) {
    const system = await this.prisma.client.customScoringSystem.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, display_name: true, user_name: true } } },
    });
    if (!system) throw new NotFoundException("Scoring system not found");
    return system;
  }

  async update(id: string, userId: number, dto: UpdateCustomScoringSystemDto) {
    const existing = await this.prisma.client.customScoringSystem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Scoring system not found");
    if (existing.createdById !== userId) {
      throw new BadRequestException("Only the creator can edit this scoring system");
    }
    const data: {
      name?: string;
      description?: string | null;
      config?: object;
      isActive?: boolean;
    } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.config !== undefined) data.config = this.validateConfig(dto.config) as unknown as object;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.client.customScoringSystem.update({
      where: { id },
      data,
      include: { createdBy: { select: { id: true, display_name: true, user_name: true } } },
    });
  }

  async delete(id: string, userId: number) {
    const existing = await this.prisma.client.customScoringSystem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Scoring system not found");
    if (existing.createdById !== userId) {
      throw new BadRequestException("Only the creator can delete this scoring system");
    }
    // Soft delete — keep for audit, just mark inactive.
    return this.prisma.client.customScoringSystem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Compute a per-user-team leaderboard for a match under the given scoring system.
   * Mirrors the real contest leaderboard: each user's picked 11 players' custom points
   * are summed with captain/VC multipliers from the custom config.
   *
   * Alpha limitations (vs. real scoring pipeline):
   *  - No chip effects applied (Swapper, DoubleTeam, Anchor, TeamForm).
   *  - No auto-substitution of benched players for zero-scorers.
   */
  async getMatchLeaderboard(systemId: string, matchId: string) {
    const system = await this.getById(systemId);
    const cfg = system.config as unknown as FantasyPointSystem;

    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true, matchDate: true, status: true },
    });
    if (!match) throw new NotFoundException("Match not found");

    const contest = await this.prisma.client.fantasyContest.findUnique({
      where: { matchId },
      include: {
        entries: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
                user_name: true,
                photo_url: true,
              },
            },
            players: {
              where: { isBench: false },
              select: {
                fantasyPlayerId: true,
                isCaptain: true,
                isViceCaptain: true,
              },
            },
          },
        },
      },
    });

    if (!contest || contest.entries.length === 0) {
      return { system, match, entries: [] };
    }

    // All distinct player ids referenced by any starter in any entry.
    const starterIds = Array.from(
      new Set(
        contest.entries.flatMap((e) => e.players.map((p) => p.fantasyPlayerId)),
      ),
    );

    const [statRows, playerRows] = await Promise.all([
      this.prisma.client.fantasyPlayerMatchStats.findMany({
        where: { matchId, fantasyPlayerId: { in: starterIds } },
        select: {
          fantasyPlayerId: true,
          runs: true,
          ballsFaced: true,
          fours: true,
          sixes: true,
          wickets: true,
          ballsBowled: true,
          runsConceded: true,
          maidens: true,
          dotBalls: true,
          catches: true,
          stumpings: true,
          runOutDirect: true,
          runOutAssist: true,
          played: true,
        },
      }),
      this.prisma.client.fantasyPlayer.findMany({
        where: { id: { in: starterIds } },
        select: {
          id: true,
          displayName: true,
          shortName: true,
          role: true,
          photoUrl: true,
        },
      }),
    ]);

    const rawPointsById = new Map<string, number>();
    const statsRowById = new Map<string, StoredPlayerMatchStats>();
    for (const r of statRows) {
      const stats: StoredPlayerMatchStats = r;
      statsRowById.set(r.fantasyPlayerId, stats);
      const { points } = computeCustomPoints(stats, cfg);
      rawPointsById.set(r.fantasyPlayerId, points);
    }
    const playerById = new Map(playerRows.map((p) => [p.id, p] as const));

    const captainMult = cfg.other.captain_multiplier;
    const viceCaptainMult = cfg.other.vice_captain_multiplier;

    const aggregated = contest.entries.map((entry) => {
      let total = 0;
      const breakdown = entry.players.map((ep) => {
        const raw = rawPointsById.get(ep.fantasyPlayerId) ?? 0;
        const mult = ep.isCaptain
          ? captainMult
          : ep.isViceCaptain
            ? viceCaptainMult
            : 1;
        const finalPoints = raw * mult;
        total += finalPoints;
        const p = playerById.get(ep.fantasyPlayerId);
        return {
          fantasyPlayerId: ep.fantasyPlayerId,
          displayName: p?.displayName ?? "Unknown",
          shortName: p?.shortName ?? null,
          role: p?.role ?? "BATSMAN",
          photoUrl: p?.photoUrl ?? null,
          rawPoints: raw,
          multiplier: mult,
          finalPoints,
          isCaptain: ep.isCaptain,
          isViceCaptain: ep.isViceCaptain,
          played: statsRowById.get(ep.fantasyPlayerId)?.played ?? false,
        };
      });

      return {
        entryId: entry.id,
        userId: entry.userId,
        displayName: entry.user.display_name,
        userName: entry.user.user_name,
        photoUrl: entry.user.photo_url,
        teamNo: entry.teamNo,
        chipCode: entry.chipCode,
        points: Math.round(total * 10) / 10,
        breakdown,
      };
    });

    aggregated.sort((a, b) => b.points - a.points);
    // Dense-rank ties at same points.
    let rank = 1;
    let prev: number | null = null;
    const entries = aggregated.map((e, i) => {
      if (prev == null || e.points !== prev) {
        rank = i + 1;
        prev = e.points;
      }
      return { ...e, rank };
    });

    return { system, match, entries };
  }
}
