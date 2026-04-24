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

  /** Compute a per-player leaderboard for a match under the given scoring system. */
  async getMatchLeaderboard(systemId: string, matchId: string) {
    const system = await this.getById(systemId);
    const cfg = system.config as unknown as FantasyPointSystem;

    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true, matchDate: true, status: true },
    });
    if (!match) throw new NotFoundException("Match not found");

    const rows = await this.prisma.client.fantasyPlayerMatchStats.findMany({
      where: { matchId },
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
    });

    if (rows.length === 0) {
      return {
        system,
        match,
        entries: [] as Array<{
          fantasyPlayerId: string;
          displayName: string;
          shortName: string | null;
          role: string;
          teamId: string | null;
          photoUrl: string | null;
          points: number;
          breakdown: Record<string, number>;
          rank: number;
        }>,
      };
    }

    const playerIds = rows.map((r) => r.fantasyPlayerId);
    const players = await this.prisma.client.fantasyPlayer.findMany({
      where: { id: { in: playerIds } },
      select: {
        id: true,
        displayName: true,
        shortName: true,
        role: true,
        teamId: true,
        photoUrl: true,
      },
    });
    const byId = new Map(players.map((p) => [p.id, p] as const));

    const scored = rows.map((r) => {
      const stats: StoredPlayerMatchStats = r;
      const { points, breakdown } = computeCustomPoints(stats, cfg);
      const p = byId.get(r.fantasyPlayerId);
      return {
        fantasyPlayerId: r.fantasyPlayerId,
        displayName: p?.displayName ?? "Unknown",
        shortName: p?.shortName ?? null,
        role: p?.role ?? "BATSMAN",
        teamId: p?.teamId ?? null,
        photoUrl: p?.photoUrl ?? null,
        points,
        breakdown,
      };
    });

    scored.sort((a, b) => b.points - a.points);
    const entries = scored.map((e, i) => ({ ...e, rank: i + 1 }));

    return { system, match, entries };
  }
}
