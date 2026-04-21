import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  ChipPlayStatus,
  FantasyContestStatus,
  MatchStatus,
} from "../../../../generated/prisma/client.js";
import { PrismaService } from "../../../common/database/prisma.service.js";
import { FantasyLineupService } from "../lineup/fantasy-lineup.service.js";
import { FantasySquadsService } from "../squads/fantasy-squads.service.js";
import type { SubmitEntryDto } from "../dto/fantasy.dto.js";

@Injectable()
export class FantasyMatchesService {
  private readonly logger = new Logger(FantasyMatchesService.name);
  private static readonly BUDGET_CAP = 100;
  private static readonly DEV_UNLOCK_TEAM_VISIBILITY = false;

  private getMatchStartMs(matchDate: Date | string): number {
    return new Date(matchDate).getTime();
  }

  private hasMatchStarted(matchDate: Date | string): boolean {
    return Date.now() >= this.getMatchStartMs(matchDate);
  }

  private async syncContestLockState(
    matchId: string,
    matchDate: Date | string,
  ): Promise<void> {
    const hasStarted = this.hasMatchStarted(matchDate);
    const lockAt = new Date(this.getMatchStartMs(matchDate));

    if (hasStarted) {
      await this.prisma.client.fantasyContest.updateMany({
        where: { matchId, status: FantasyContestStatus.OPEN },
        data: { status: FantasyContestStatus.LOCKED, lockedAt: lockAt },
      });
      return;
    }

    await this.prisma.client.fantasyContest.updateMany({
      where: { matchId, status: FantasyContestStatus.LOCKED },
      data: { status: FantasyContestStatus.OPEN, lockedAt: null },
    });
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly squads: FantasySquadsService,
    private readonly lineup: FantasyLineupService,
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

    const lockTimeReached = this.hasMatchStarted(match.matchDate);
    const shouldRevealSelectionData =
      FantasyMatchesService.DEV_UNLOCK_TEAM_VISIBILITY || lockTimeReached;

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

  // ── Player selections (contest-wide) ─────────────────────────────────────

  async getPlayerSelections(matchId: string) {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true, matchDate: true },
    });
    if (!match) throw new NotFoundException(`Match ${matchId} not found`);

    const contest = await this.prisma.client.fantasyContest.findUnique({
      where: { matchId },
      select: { id: true, status: true },
    });

    const lockTimeReached = this.hasMatchStarted(match.matchDate);
    const isLocked =
      FantasyMatchesService.DEV_UNLOCK_TEAM_VISIBILITY || lockTimeReached;

    if (!contest || !isLocked) {
      throw new ForbiddenException(
        "Player selections are visible only after contest lock",
      );
    }

    const [entries, matchPlayers, playerScores] = await Promise.all([
      this.prisma.client.fantasyContestEntry.findMany({
        where: { contestId: contest.id },
        select: {
          id: true,
          teamNo: true,
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
      }),
      this.prisma.client.fantasyMatchPlayer.findMany({
        where: { matchId },
        select: {
          fantasyPlayerId: true,
          fantasyPlayer: {
            select: {
              id: true,
              displayName: true,
              role: true,
              photoUrl: true,
              team: { select: { shortCode: true } },
            },
          },
        },
      }),
      this.prisma.client.fantasyPlayerScore.findMany({
        where: { matchId },
        select: {
          fantasyPlayerId: true,
          points: true,
          isFinalized: true,
        },
      }),
    ]);

    const totalEntries = entries.length;

    const scoreByPlayerId = new Map(
      playerScores.map((score) => [score.fantasyPlayerId, score]),
    );

    type PickedByEntry = {
      entryId: string;
      userId: number;
      displayName: string;
      userName: string;
      photoUrl: string | null;
      teamNo: number;
      isCaptain: boolean;
      isViceCaptain: boolean;
    };

    const pickedByByPlayerId = new Map<string, PickedByEntry[]>();
    const captainCountByPlayerId = new Map<string, number>();
    const viceCaptainCountByPlayerId = new Map<string, number>();

    for (const entry of entries) {
      for (const player of entry.players) {
        const pickedBy = pickedByByPlayerId.get(player.fantasyPlayerId) ?? [];
        pickedBy.push({
          entryId: entry.id,
          userId: entry.user.id,
          displayName: entry.user.display_name,
          userName: entry.user.user_name,
          photoUrl: entry.user.photo_url,
          teamNo: entry.teamNo,
          isCaptain: player.isCaptain,
          isViceCaptain: player.isViceCaptain,
        });
        pickedByByPlayerId.set(player.fantasyPlayerId, pickedBy);

        if (player.isCaptain) {
          captainCountByPlayerId.set(
            player.fantasyPlayerId,
            (captainCountByPlayerId.get(player.fantasyPlayerId) ?? 0) + 1,
          );
        }
        if (player.isViceCaptain) {
          viceCaptainCountByPlayerId.set(
            player.fantasyPlayerId,
            (viceCaptainCountByPlayerId.get(player.fantasyPlayerId) ?? 0) + 1,
          );
        }
      }
    }

    const players = matchPlayers
      .map((matchPlayer) => {
        const pickedBy =
          pickedByByPlayerId.get(matchPlayer.fantasyPlayerId) ?? [];
        const score = scoreByPlayerId.get(matchPlayer.fantasyPlayerId);
        const pickedCount = pickedBy.length;
        const selectionPct =
          totalEntries > 0
            ? Number(((pickedCount / totalEntries) * 100).toFixed(1))
            : 0;

        return {
          fantasyPlayerId: matchPlayer.fantasyPlayer.id,
          displayName: matchPlayer.fantasyPlayer.displayName,
          role: matchPlayer.fantasyPlayer.role,
          teamShortCode: matchPlayer.fantasyPlayer.team?.shortCode ?? null,
          photoUrl: matchPlayer.fantasyPlayer.photoUrl ?? null,
          pickedCount,
          captainCount:
            captainCountByPlayerId.get(matchPlayer.fantasyPlayerId) ?? 0,
          viceCaptainCount:
            viceCaptainCountByPlayerId.get(matchPlayer.fantasyPlayerId) ?? 0,
          selectionPct,
          points: score?.points ?? null,
          isScoreFinalized: score?.isFinalized ?? false,
          pickedBy,
        };
      })
      .sort((a, b) => b.selectionPct - a.selectionPct);

    return {
      totalEntries,
      contestStatus: contest.status,
      players,
    };
  }

  // ── My entries ───────────────────────────────────────────────────────────

  async getMyEntries(matchId: string, userId: number) {
    await this.assertMatchExists(matchId);

    const contest = await this.prisma.client.fantasyContest.findUnique({
      where: { matchId },
    });

    if (!contest) return [];

    const entries = await this.prisma.client.fantasyContestEntry.findMany({
      where: { contestId: contest.id, userId },
      include: { players: true },
    });

    const effectivePlayersByEntryId =
      await this.lineup.getEffectivePlayersForEntries(matchId, entries);

    return entries.map((entry) => ({
      ...entry,
      effectivePlayers:
        effectivePlayersByEntryId.get(entry.id) ??
        entry.players.map((player) => ({ ...player })),
    }));
  }

  async getEntriesForUser(matchId: string, userId: number) {
    return this.getMyEntries(matchId, userId);
  }

  // ── Submit entry ─────────────────────────────────────────────────────────

  async submitEntry(
    matchId: string,
    userId: number,
    dto: SubmitEntryDto,
    options: {
      bypassDeadlineGate?: boolean;
      bypassContestStatusGate?: boolean;
    } = {},
  ) {
    await this.assertMatchExists(matchId);

    const matchMeta = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { matchDate: true, status: true },
    });

    if (!matchMeta) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (matchMeta.status === MatchStatus.COMPLETED) {
      throw new BadRequestException(
        "Match is COMPLETED — entries can no longer be edited.",
      );
    }

    await this.syncContestLockState(matchId, matchMeta.matchDate);

    const lockAt = new Date(this.getMatchStartMs(matchMeta.matchDate));
    const deadlineReached = this.hasMatchStarted(matchMeta.matchDate);
    // Deadline is purely matchDate vs wall clock — match.status (set by the
    // Wisden poller) must never influence whether the gate is open.
    if (!options.bypassDeadlineGate && deadlineReached) {
      await this.prisma.client.fantasyContest.updateMany({
        where: { matchId, status: FantasyContestStatus.OPEN },
        data: { status: FantasyContestStatus.LOCKED, lockedAt: lockAt },
      });
      throw new BadRequestException(
        "Contest deadline passed. Team edits are locked at match start.",
      );
    }

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

      // Before the deadline, always accept entries regardless of contest status —
      // the status can be LOCKED or LIVE due to the live scorer/poller running
      // early.  After the deadline only an explicit admin bypass opens it.
      const canAcceptEntries =
        options.bypassContestStatusGate ||
        !deadlineReached ||
        contest.status !== FantasyContestStatus.COMPLETED; // admin path: COMPLETED is the hard stop

      if (!canAcceptEntries) {
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

  async submitEntryAsAdmin(
    matchId: string,
    userId: number,
    dto: SubmitEntryDto,
  ) {
    this.logger.warn(
      `ADMIN override submit on matchId=${matchId} for userId=${userId}`,
    );

    return this.submitEntry(matchId, userId, dto, {
      bypassDeadlineGate: true,
      bypassContestStatusGate: true,
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

  async extendContestDeadline(matchId: string, extendByMinutes: number) {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true, matchDate: true, status: true },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    // Deadline extension is blocked only once the match is fully COMPLETED.
    // A LIVE match (poller started early / toss happened) can still have its
    // deadline extended as long as the new deadline is in the future.
    if (match.status === MatchStatus.COMPLETED) {
      throw new BadRequestException(
        "Deadline cannot be extended after the match has completed",
      );
    }

    const previousDeadline = new Date(match.matchDate);
    const nextDeadline = new Date(
      previousDeadline.getTime() + extendByMinutes * 60_000,
    );

    if (nextDeadline.getTime() <= Date.now()) {
      throw new BadRequestException(
        "Extended deadline is still in the past. Increase extension minutes.",
      );
    }

    const contest = await this.prisma.client.fantasyContest.findUnique({
      where: { matchId },
      select: { id: true, status: true },
    });

    // Only block once scoring is finalised; a LIVE contest was set prematurely
    // by the live-scorer and can be re-opened by extending the deadline.
    if (contest?.status === FantasyContestStatus.COMPLETED) {
      throw new BadRequestException(
        "Contest scoring is finalised; deadline cannot be extended",
      );
    }

    await this.prisma.client.match.update({
      where: { id: matchId },
      data: { matchDate: nextDeadline },
    });

    // Reopen the contest if it was locked or set to LIVE prematurely by the
    // live scorer before the actual contest deadline.
    let reopenedContest = false;
    if (
      contest &&
      (contest.status === FantasyContestStatus.LOCKED ||
        contest.status === FantasyContestStatus.LIVE)
    ) {
      await this.prisma.client.fantasyContest.update({
        where: { id: contest.id },
        data: { status: FantasyContestStatus.OPEN, lockedAt: null },
      });
      reopenedContest = true;
    }

    this.logger.log(
      `Extended contest deadline for matchId=${matchId} by ${extendByMinutes}m (${previousDeadline.toISOString()} -> ${nextDeadline.toISOString()})`,
    );

    return {
      success: true,
      matchId,
      extendByMinutes,
      previousDeadline: previousDeadline.toISOString(),
      newDeadline: nextDeadline.toISOString(),
      reopenedContest,
    };
  }

  // ── Leaderboard ──────────────────────────────────────────────────────────

  async getLeaderboard(matchId: string) {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      select: { id: true, matchDate: true },
    });

    if (!match) throw new NotFoundException(`Match ${matchId} not found`);

    await this.syncContestLockState(matchId, match.matchDate);

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

    // Backfill chipCode from chip plays for entries where it wasn't stored at
    // submission time (e.g. chip activated after team was locked in). Use any
    // non-cancelled play affecting this match so pills remain visible once the
    // chip status advances beyond SCHEDULED.
    const chipByUserId = new Map<number, string>();
    const entriesWithNullChip = entries.filter((e) => !e.chipCode);
    if (entriesWithNullChip.length > 0) {
      const userIds = entriesWithNullChip.map((e) => e.userId);
      const chipPlays = await this.prisma.client.chipPlay.findMany({
        where: {
          status: { not: ChipPlayStatus.CANCELLED },
          startMatchId: matchId,
          seasonUser: { userId: { in: userIds } },
        },
        select: {
          seasonUser: { select: { userId: true } },
          chipType: { select: { code: true } },
        },
      });
      for (const cp of chipPlays) {
        chipByUserId.set(cp.seasonUser.userId, cp.chipType.code);
      }
    }

    return {
      status: contest.status,
      entries: entries.map((e) => {
        const chipCode = e.chipCode ?? chipByUserId.get(e.userId) ?? null;
        return {
          id: e.id,
          teamNo: e.teamNo,
          totalPoints: e.totalPoints,
          basePoints:
            chipCode === "ANCHOR_PLAYER" && e.totalPoints != null
              ? Math.round((e.totalPoints / 1.1) * 10) / 10
              : null,
          rank: e.rank,
          userId: e.userId,
          displayName: e.user.display_name,
          userName: e.user.user_name,
          photoUrl: e.user.photo_url,
          chipCode,
        };
      }),
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
    const lockTimeReached = this.hasMatchStarted(match.matchDate);

    if (
      !FantasyMatchesService.DEV_UNLOCK_TEAM_VISIBILITY &&
      !isOwner &&
      !lockTimeReached
    ) {
      throw new ForbiddenException(
        "Other user teams are visible only after contest lock",
      );
    }

    const effectivePlayersByEntryId =
      await this.lineup.getEffectivePlayersForEntries(matchId, [entry]);

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
      effectivePlayers:
        effectivePlayersByEntryId.get(entry.id) ??
        entry.players.map((player) => ({ ...player })),
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
