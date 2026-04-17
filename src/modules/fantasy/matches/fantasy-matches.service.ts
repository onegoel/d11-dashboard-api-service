import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { FantasyContestStatus } from "../../../../generated/prisma/client.js";
import { PrismaService } from "../../../common/database/prisma.service.js";
import { FantasySquadsService } from "../squads/fantasy-squads.service.js";
import type { SubmitEntryDto } from "../dto/fantasy.dto.js";

@Injectable()
export class FantasyMatchesService {
  private readonly logger = new Logger(FantasyMatchesService.name);
  private static readonly BUDGET_CAP = 100;
  private static readonly DEV_UNLOCK_TEAM_VISIBILITY = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly squads: FantasySquadsService,
  ) {}

  // ── Player pool ──────────────────────────────────────────────────────────

  async getPlayerPool(matchId: string) {
    await this.assertMatchExists(matchId);

    const [existingPoolCount, existingXiCount] = await Promise.all([
      this.prisma.client.fantasyMatchPlayer.count({
        where: { matchId },
      }),
      this.prisma.client.fantasyMatchPlayer.count({
        where: { matchId, isInPlayingXI: true },
      }),
    ]);

    if (existingPoolCount === 0) {
      await this.squads.getMatchSquad(matchId);
    } else if (existingXiCount === 0) {
      await this.squads.getMatchSquad(matchId);
    }

    const [match, contest, matchPlayers, playerScores] = await Promise.all([
      this.prisma.client.match.findUniqueOrThrow({
        where: { id: matchId },
        select: {
          status: true,
          matchDate: true,
          wisdenMatchGid: true,
          homeTeam: { select: { wisdenTeamId: true } },
          awayTeam: { select: { wisdenTeamId: true } },
        },
      }),
      this.prisma.client.fantasyContest.findUnique({
        where: { matchId },
        select: { id: true, status: true },
      }),
      this.prisma.client.fantasyMatchPlayer.findMany({
        where: { matchId },
        include: {
          fantasyPlayer: {
            select: {
              id: true,
              displayName: true,
              role: true,
              photoUrl: true,
              teamId: true,
              shortName: true,
              team: {
                select: {
                  shortCode: true,
                },
              },
            },
          },
        },
        orderBy: [{ isInPlayingXI: "desc" }, { creditValue: "desc" }],
      }),
      this.prisma.client.fantasyPlayerScore.findMany({
        where: { matchId },
        select: {
          fantasyPlayerId: true,
          points: true,
          breakdown: true,
          isFinalized: true,
        },
      }),
    ]);

    const teamWisdenIds = [
      match.homeTeam?.wisdenTeamId,
      match.awayTeam?.wisdenTeamId,
    ].filter((teamId): teamId is string => Boolean(teamId));

    const announcedSquadIds =
      await this.squads.getAnnouncedSquadPlayerIdsForMatch(
        match.wisdenMatchGid,
        teamWisdenIds,
      );

    const announcedSquadKnown = Boolean(announcedSquadIds?.size);

    const lockTimeReached = Date.now() >= new Date(match.matchDate).getTime();
    const shouldRevealSelectionData =
      FantasyMatchesService.DEV_UNLOCK_TEAM_VISIBILITY ||
      lockTimeReached ||
      contest?.status !== FantasyContestStatus.OPEN;

    const scoreByPlayerId = new Map(
      playerScores.map((score) => [score.fantasyPlayerId, score]),
    );

    const selectedEntryCountByPlayerId = new Map<string, number>();
    const selectedByUsersByPlayerId = new Map<
      string,
      Map<
        number,
        {
          userId: number;
          displayName: string;
          userName: string;
          photoUrl: string | null;
          teamNos: number[];
        }
      >
    >();

    if (contest) {
      const entries = await this.prisma.client.fantasyContestEntry.findMany({
        where: { contestId: contest.id },
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
            select: { fantasyPlayerId: true },
          },
        },
      });

      for (const entry of entries) {
        for (const player of entry.players) {
          selectedEntryCountByPlayerId.set(
            player.fantasyPlayerId,
            (selectedEntryCountByPlayerId.get(player.fantasyPlayerId) ?? 0) + 1,
          );

          const usersForPlayer =
            selectedByUsersByPlayerId.get(player.fantasyPlayerId) ?? new Map();
          const existingUser = usersForPlayer.get(entry.user.id);

          if (existingUser) {
            if (!existingUser.teamNos.includes(entry.teamNo)) {
              existingUser.teamNos.push(entry.teamNo);
              existingUser.teamNos.sort((a: number, b: number) => a - b);
            }
          } else {
            usersForPlayer.set(entry.user.id, {
              userId: entry.user.id,
              displayName: entry.user.display_name,
              userName: entry.user.user_name,
              photoUrl: entry.user.photo_url,
              teamNos: [entry.teamNo],
            });
          }

          selectedByUsersByPlayerId.set(player.fantasyPlayerId, usersForPlayer);
        }
      }

      const totalEntries = entries.length;

      return matchPlayers.map((matchPlayer) => {
        const selectedEntryCount =
          selectedEntryCountByPlayerId.get(matchPlayer.fantasyPlayerId) ?? 0;
        const playerScore = scoreByPlayerId.get(matchPlayer.fantasyPlayerId);

        return {
          ...matchPlayer,
          teamShortCode: matchPlayer.fantasyPlayer.team?.shortCode ?? null,
          isInAnnouncedSquad: announcedSquadKnown
            ? Boolean(
                matchPlayer.wisdenPlayerId &&
                announcedSquadIds?.has(matchPlayer.wisdenPlayerId),
              )
            : null,
          selectedEntryCount: shouldRevealSelectionData
            ? selectedEntryCount
            : 0,
          selectedByUsers: shouldRevealSelectionData
            ? Array.from(
                selectedByUsersByPlayerId
                  .get(matchPlayer.fantasyPlayerId)
                  ?.values() ?? [],
              )
            : [],
          selectionPct:
            shouldRevealSelectionData && totalEntries > 0
              ? Number(((selectedEntryCount / totalEntries) * 100).toFixed(1))
              : null,
          points: playerScore?.points ?? null,
          pointsBreakdown:
            (playerScore?.breakdown as
              | Record<string, number>
              | null
              | undefined) ?? null,
          isScoreFinalized: playerScore?.isFinalized ?? false,
        };
      });
    }

    return matchPlayers.map((matchPlayer) => {
      const playerScore = scoreByPlayerId.get(matchPlayer.fantasyPlayerId);
      return {
        ...matchPlayer,
        teamShortCode: matchPlayer.fantasyPlayer.team?.shortCode ?? null,
        isInAnnouncedSquad: announcedSquadKnown
          ? Boolean(
              matchPlayer.wisdenPlayerId &&
              announcedSquadIds?.has(matchPlayer.wisdenPlayerId),
            )
          : null,
        selectedEntryCount: 0,
        selectedByUsers: [],
        selectionPct: null,
        points: playerScore?.points ?? null,
        pointsBreakdown:
          (playerScore?.breakdown as
            | Record<string, number>
            | null
            | undefined) ?? null,
        isScoreFinalized: playerScore?.isFinalized ?? false,
      };
    });
  }

  // ── Player scores ─────────────────────────────────────────────────────────

  async getPlayerScores(matchId: string) {
    await this.assertMatchExists(matchId);
    return this.prisma.client.fantasyPlayerScore.findMany({
      where: { matchId },
      select: { fantasyPlayerId: true, points: true, breakdown: true },
    });
  }

  // ── My entries ───────────────────────────────────────────────────────────

  async getMyEntries(matchId: string, userId: number) {
    await this.assertMatchExists(matchId);

    const contest = await this.prisma.client.fantasyContest.findUnique({
      where: { matchId },
    });

    if (!contest) return [];

    return this.prisma.client.fantasyContestEntry.findMany({
      where: { contestId: contest.id, userId },
      include: { players: true },
    });
  }

  // ── Submit entry ─────────────────────────────────────────────────────────

  async submitEntry(matchId: string, userId: number, dto: SubmitEntryDto) {
    await this.assertMatchExists(matchId);

    const matchMeta = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { matchDate: true },
    });

    if (!matchMeta) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    const now = new Date();
    if (now >= new Date(matchMeta.matchDate)) {
      await this.prisma.client.fantasyContest.updateMany({
        where: { matchId, status: FantasyContestStatus.OPEN },
        data: { status: FantasyContestStatus.LOCKED, lockedAt: now },
      });
      throw new BadRequestException(
        "Contest deadline passed. Team edits are locked at match start.",
      );
    }

    // Recover from accidental early lock (e.g. temporary bad matchDate during dev seeding)
    await this.prisma.client.fantasyContest.updateMany({
      where: { matchId, status: FantasyContestStatus.LOCKED },
      data: { status: FantasyContestStatus.OPEN, lockedAt: null },
    });

    // Validate exactly one captain, one vice-captain
    const captains = dto.players.filter((p) => p.isCaptain);
    const viceCaptains = dto.players.filter((p) => p.isViceCaptain);
    const starters = dto.players.filter((p) => !p.isBench);
    const bench = dto.players.filter((p) => p.isBench);

    const fantasyPlayerIds = dto.players.map((p) => p.fantasyPlayerId);
    const uniqueFantasyPlayerIds = new Set(fantasyPlayerIds);

    if (uniqueFantasyPlayerIds.size !== fantasyPlayerIds.length) {
      throw new BadRequestException("Duplicate players are not allowed");
    }

    if (captains.length !== 1) {
      throw new BadRequestException("Exactly one captain required");
    }
    if (viceCaptains.length !== 1) {
      throw new BadRequestException("Exactly one vice-captain required");
    }
    if (starters.length !== 11) {
      throw new BadRequestException("Exactly 11 starters required");
    }
    if (bench.length > 4) {
      throw new BadRequestException("Maximum 4 bench players allowed");
    }
    if (captains[0]?.isBench || viceCaptains[0]?.isBench) {
      throw new BadRequestException(
        "Captain and vice-captain must be in starting XI",
      );
    }

    // Look up fantasyPlayer records for denormalization + validations
    const fantasyPlayers = await this.prisma.client.fantasyPlayer.findMany({
      where: { id: { in: fantasyPlayerIds } },
      select: {
        id: true,
        wisdenPlayerId: true,
        role: true,
        teamId: true,
      },
    });

    if (fantasyPlayers.length !== uniqueFantasyPlayerIds.size) {
      throw new BadRequestException("One or more selected players are invalid");
    }

    // Verify all players exist in match + validate XI budget (only starters count toward 100 cap)
    const starterPlayerIds = starters.map((starter) => starter.fantasyPlayerId);
    const starterMatchPlayers =
      await this.prisma.client.fantasyMatchPlayer.findMany({
        where: {
          matchId,
          fantasyPlayerId: { in: starterPlayerIds },
        },
        select: {
          fantasyPlayerId: true,
          creditValue: true,
          teamWisdenId: true,
          fantasyPlayer: {
            select: {
              teamId: true,
            },
          },
        },
      });

    if (starterMatchPlayers.length !== starterPlayerIds.length) {
      throw new BadRequestException(
        "One or more selected starter players are not in this match pool",
      );
    }

    // Verify bench players exist in match (no budget check for bench)
    const benchPlayerIds = bench.map((b) => b.fantasyPlayerId);
    if (benchPlayerIds.length > 0) {
      const benchMatchPlayers =
        await this.prisma.client.fantasyMatchPlayer.findMany({
          where: {
            matchId,
            fantasyPlayerId: { in: benchPlayerIds },
          },
          select: { fantasyPlayerId: true },
        });
      if (benchMatchPlayers.length !== benchPlayerIds.length) {
        throw new BadRequestException(
          "One or more selected bench players are not in this match pool",
        );
      }
    }

    // Check XI (starters only) budget
    const xiTotalCredits = starterMatchPlayers.reduce(
      (sum, player) => sum + player.creditValue,
      0,
    );
    if (xiTotalCredits > FantasyMatchesService.BUDGET_CAP + 0.001) {
      throw new BadRequestException(
        `XI credit cap exceeded: ${xiTotalCredits.toFixed(1)}/${FantasyMatchesService.BUDGET_CAP}`,
      );
    }

    const fpMap = new Map(fantasyPlayers.map((fp) => [fp.id, fp]));

    const roleCounts = {
      WICKET_KEEPER: 0,
      BATSMAN: 0,
      ALL_ROUNDER: 0,
      BOWLER: 0,
    };

    const starterTeamKeyByPlayerId = new Map(
      starterMatchPlayers.map((item) => [
        item.fantasyPlayerId,
        item.teamWisdenId ?? item.fantasyPlayer.teamId,
      ]),
    );

    const teamCounts = new Map<string, number>();

    for (const starter of starters) {
      const fp = fpMap.get(starter.fantasyPlayerId);
      if (!fp) {
        throw new BadRequestException(
          "One or more selected players are invalid",
        );
      }
      roleCounts[fp.role] += 1;
      const teamKey =
        starterTeamKeyByPlayerId.get(starter.fantasyPlayerId) ??
        (fp.teamId as string);
      teamCounts.set(teamKey, (teamCounts.get(teamKey) ?? 0) + 1);
    }

    if (
      roleCounts.WICKET_KEEPER < 1 ||
      roleCounts.BATSMAN < 1 ||
      roleCounts.ALL_ROUNDER < 1 ||
      roleCounts.BOWLER < 1
    ) {
      throw new BadRequestException(
        "Minimum 1 player required from each role (WKB, BAT, ALL, BWL)",
      );
    }

    const maxFromAnyTeam = Math.max(0, ...teamCounts.values());
    if (maxFromAnyTeam > 8) {
      throw new BadRequestException("Maximum 8 players allowed from one team");
    }

    return this.prisma.client.$transaction(async (tx) => {
      // Get or create the contest
      const contest = await tx.fantasyContest.upsert({
        where: { matchId },
        update: {},
        create: { matchId, status: FantasyContestStatus.OPEN },
      });

      if (contest.status !== FantasyContestStatus.OPEN) {
        throw new BadRequestException(
          `Contest is ${contest.status} — entries are no longer accepted`,
        );
      }

      // Check if entry for this teamNo already exists
      const existing = await tx.fantasyContestEntry.findUnique({
        where: {
          contestId_userId_teamNo: {
            contestId: contest.id,
            userId,
            teamNo: dto.teamNo,
          },
        },
      });

      if (!existing) {
        // Check user hasn't used up both team slots
        const entryCount = await tx.fantasyContestEntry.count({
          where: { contestId: contest.id, userId },
        });
        if (entryCount >= 2) {
          throw new BadRequestException("Maximum of 2 teams per match allowed");
        }
      }

      let entryId: string;

      if (existing) {
        // Replace entry row to avoid touching potentially stale FK state.
        await tx.fantasyEntryPlayer.deleteMany({
          where: { entryId: existing.id },
        });

        await tx.fantasyContestEntry.delete({
          where: { id: existing.id },
        });

        const recreated = await tx.fantasyContestEntry.create({
          data: {
            contestId: contest.id,
            userId,
            teamNo: dto.teamNo,
            chipCode: dto.chipCode ?? null,
          },
        });

        entryId = recreated.id;
      } else {
        const entry = await tx.fantasyContestEntry.create({
          data: {
            contestId: contest.id,
            userId,
            teamNo: dto.teamNo,
            chipCode: dto.chipCode ?? null,
          },
        });
        entryId = entry.id;
      }

      await tx.fantasyEntryPlayer.createMany({
        data: dto.players.map((p) => {
          const fp = fpMap.get(p.fantasyPlayerId);
          return {
            entryId,
            fantasyPlayerId: p.fantasyPlayerId,
            wisdenPlayerId: fp?.wisdenPlayerId ?? null,
            isCaptain: p.isCaptain,
            isViceCaptain: p.isViceCaptain,
            isBench: p.isBench,
            benchPriority: p.benchPriority ?? null,
          };
        }),
      });

      return tx.fantasyContestEntry.findUniqueOrThrow({
        where: { id: entryId },
        include: { players: true },
      });
    });
  }

  // ── Sync match players ───────────────────────────────────────────────────

  async syncMatch(matchId: string) {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true },
    });

    if (!match) throw new NotFoundException(`Match ${matchId} not found`);

    await this.squads.getMatchSquad(matchId);

    this.logger.log(`Sync triggered for matchId=${matchId}`);
    return { success: true, matchId };
  }

  // ── Leaderboard ──────────────────────────────────────────────────────────

  async getLeaderboard(matchId: string) {
    await this.assertMatchExists(matchId);

    const contest = await this.prisma.client.fantasyContest.findUnique({
      where: { matchId },
    });

    if (!contest) return { entries: [], status: "No entries" };

    const entries = await this.prisma.client.fantasyContestEntry.findMany({
      where: { contestId: contest.id },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            user_name: true,
            photo_url: true,
          },
        },
      },
      orderBy: [{ rank: "asc" }, { totalPoints: "desc" }],
    });

    return {
      status: contest.status,
      entries: entries.map((e) => ({
        id: e.id,
        teamNo: e.teamNo,
        totalPoints: e.totalPoints,
        rank: e.rank,
        userId: e.userId,
        displayName: e.user.display_name,
        userName: e.user.user_name,
        photoUrl: e.user.photo_url,
      })),
    };
  }

  async getContestEntryDetail(
    matchId: string,
    entryId: string,
    requesterUserId: number,
  ) {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true, matchDate: true },
    });
    if (!match) throw new NotFoundException(`Match ${matchId} not found`);

    const contest = await this.prisma.client.fantasyContest.findUnique({
      where: { matchId },
      select: { id: true, status: true },
    });
    if (!contest) throw new NotFoundException("Contest not found");

    const entry = await this.prisma.client.fantasyContestEntry.findUnique({
      where: { id: entryId },
      include: {
        players: true,
        user: {
          select: {
            id: true,
            display_name: true,
            user_name: true,
            photo_url: true,
          },
        },
      },
    });

    if (!entry || entry.contestId !== contest.id) {
      throw new NotFoundException("Contest entry not found");
    }

    const isOwner = entry.userId === requesterUserId;
    const lockTimeReached = Date.now() >= new Date(match.matchDate).getTime();
    const isLockedOrBeyond = contest.status !== FantasyContestStatus.OPEN;

    if (
      !FantasyMatchesService.DEV_UNLOCK_TEAM_VISIBILITY &&
      !isOwner &&
      !lockTimeReached &&
      !isLockedOrBeyond
    ) {
      throw new ForbiddenException(
        "Other user teams are visible only after contest lock",
      );
    }

    return {
      id: entry.id,
      contestId: entry.contestId,
      userId: entry.userId,
      teamNo: entry.teamNo,
      totalPoints: entry.totalPoints,
      rank: entry.rank,
      user: {
        id: entry.user.id,
        displayName: entry.user.display_name,
        userName: entry.user.user_name,
        photoUrl: entry.user.photo_url,
      },
      players: entry.players,
    };
  }

  // ── Internal helpers ─────────────────────────────────────────────────────

  private async assertMatchExists(matchId: string) {
    const exists = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Match ${matchId} not found`);
  }
}
