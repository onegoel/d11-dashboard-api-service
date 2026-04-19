import { Injectable } from "@nestjs/common";
import {
  ChipCode,
  ChipPlayStatus,
  MatchResult,
  MatchStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";

type PrismaExecutor = Prisma.TransactionClient | PrismaClient;

type OrderedSeasonMatch = {
  id: string;
  matchNo: number;
  matchDate: Date;
  status: MatchStatus;
  matchResult: MatchResult;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: {
    shortCode: string;
  };
  awayTeam: {
    shortCode: string;
  };
};

type StandingEntry = {
  seasonUserId: string;
  displayName: string;
  points: number;
  averageRank: number;
  wins: number;
};

type ChipTypeRecord = {
  id: number;
  code: ChipCode;
  name: string;
  description: string | null;
  multiplier: number;
  maxUsesPerSeason: number;
  effectWindowMatches: number;
  requiresBottomHalf: boolean;
  usesSecondaryTeamScore: boolean;
};

type ActiveChipAssignment = {
  seasonUserId: string;
  chipPlayId: string;
  chipCode: ChipCode;
  chipName: string;
  chipShortCode: string;
  multiplier: number;
  windowSize: number;
  windowIndex: number;
  usesSecondaryTeamScore: boolean;
  startMatchId: string;
  startMatchNo: number;
  selectedTeamId?: string | null;
};

type SelectPowerupInput = {
  seasonId: number;
  seasonUserId: string;
  chipCode: ChipCode;
  startMatchId: string;
  selectedTeamId?: string;
  anchorFantasyPlayerId?: string;
  anchorPlayerName?: string; // display only, stored alongside ID
  actorUserId: number;
  actorRole: UserRole;
};

class ChipServiceError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getChipShortCode = (code: ChipCode) => {
  switch (code) {
    case ChipCode.DOUBLE_TEAM:
      return "DT";
    case ChipCode.TEAM_FORM:
      return "TF";
    case ChipCode.SWAPPER:
      return "SW";
    case ChipCode.ANCHOR_PLAYER:
      return "AP";
    default:
      return code;
  }
};

const REGULAR_SEASON_MATCH_COUNT = parseInt(
  process.env.REGULAR_SEASON_MATCH_COUNT ?? "70",
  10,
);

const isRegularSeasonMatch = (matchNo: number) =>
  matchNo <= REGULAR_SEASON_MATCH_COUNT;

const isTeamMatch = (match: OrderedSeasonMatch, teamId: string) => {
  return match.homeTeamId === teamId || match.awayTeamId === teamId;
};

const getTeamFormEffectiveMatches = (
  orderedMatches: OrderedSeasonMatch[],
  startMatchId: string,
  selectedTeamId: string,
  windowSize: number,
) => {
  const startIndex = orderedMatches.findIndex(
    (match) => match.id === startMatchId,
  );

  if (startIndex < 0) {
    return [] as OrderedSeasonMatch[];
  }

  const teamMatches = orderedMatches
    .slice(startIndex)
    .filter(
      (match) =>
        isRegularSeasonMatch(match.matchNo) &&
        isTeamMatch(match, selectedTeamId),
    );

  const effectiveMatches: OrderedSeasonMatch[] = [];

  for (const match of teamMatches) {
    if (match.matchResult === MatchResult.ABANDONED) {
      continue;
    }

    effectiveMatches.push(match);

    if (effectiveMatches.length >= windowSize) {
      break;
    }
  }

  return effectiveMatches;
};

const buildMatchLabel = (match: OrderedSeasonMatch) => {
  return `${match.homeTeam.shortCode} vs ${match.awayTeam.shortCode}`;
};

const getOrderedSeasonMatches = async (
  tx: PrismaExecutor,
  seasonId: number,
) => {
  return tx.match.findMany({
    where: { seasonId },
    select: {
      id: true,
      matchNo: true,
      matchDate: true,
      status: true,
      matchResult: true,
      homeTeamId: true,
      awayTeamId: true,
      homeTeam: {
        select: {
          shortCode: true,
        },
      },
      awayTeam: {
        select: {
          shortCode: true,
        },
      },
    },
    orderBy: [{ matchDate: "asc" }, { matchNo: "asc" }],
  });
};

const getAffectedMatches = (
  orderedMatches: OrderedSeasonMatch[],
  startMatchId: string,
  windowSize: number,
) => {
  const startIndex = orderedMatches.findIndex(
    (match) => match.id === startMatchId,
  );

  if (startIndex < 0) {
    return [] as OrderedSeasonMatch[];
  }

  const size = Math.max(windowSize, 1);

  return orderedMatches.slice(startIndex, startIndex + size);
};

const hasOverlap = (firstIds: string[], secondIds: string[]) => {
  const firstSet = new Set(firstIds);

  return secondIds.some((id) => firstSet.has(id));
};

const getStandingsForSeason = async (tx: PrismaExecutor, seasonId: number) => {
  const seasonUsers = await tx.seasonUser.findMany({
    where: { seasonId },
    include: {
      user: true,
      scores: {
        where: {
          match: {
            status: MatchStatus.COMPLETED,
            matchResult: {
              not: MatchResult.ABANDONED,
            },
          },
        },
        select: {
          points: true,
          rank: true,
        },
      },
    },
  });

  const standings = seasonUsers
    .map<StandingEntry>((seasonUser) => {
      const totalPoints = seasonUser.scores.reduce(
        (sum, score) => sum + score.points,
        0,
      );

      const averageRank =
        seasonUser.scores.length > 0
          ? seasonUser.scores.reduce((sum, score) => sum + score.rank, 0) /
            seasonUser.scores.length
          : Number.POSITIVE_INFINITY;

      const wins = seasonUser.scores.filter((score) => score.rank === 1).length;

      return {
        seasonUserId: seasonUser.id,
        displayName: seasonUser.user.display_name,
        points: totalPoints,
        averageRank,
        wins,
      };
    })
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (a.averageRank !== b.averageRank) {
        return a.averageRank - b.averageRank;
      }

      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return a.displayName.localeCompare(b.displayName);
    });

  const positionBySeasonUserId = new Map<string, number>();

  standings.forEach((entry, index) => {
    positionBySeasonUserId.set(entry.seasonUserId, index + 1);
  });

  return {
    totalPlayers: standings.length,
    positionBySeasonUserId,
  };
};

const isBottomHalfPosition = (position: number, totalPlayers: number) => {
  if (totalPlayers < 2) {
    return false;
  }

  return position > Math.ceil(totalPlayers / 2);
};

const resolveActiveChipAssignmentsForMatchTx = async (
  tx: PrismaExecutor,
  seasonId: number,
  matchId: string,
  seasonUserIds?: string[],
) => {
  const orderedMatches = await getOrderedSeasonMatches(tx, seasonId);
  const targetIndex = orderedMatches.findIndex((match) => match.id === matchId);

  if (targetIndex < 0) {
    throw new ChipServiceError(404, "Match not found for season");
  }

  const chipPlays = await tx.chipPlay.findMany({
    where: {
      seasonUser: { seasonId },
      status: ChipPlayStatus.SCHEDULED,
      ...(seasonUserIds && seasonUserIds.length > 0
        ? {
            seasonUserId: {
              in: seasonUserIds,
            },
          }
        : {}),
    },
    include: {
      chipType: true,
      selectedTeam: {
        select: {
          id: true,
        },
      },
      startMatch: {
        select: {
          id: true,
          matchNo: true,
        },
      },
    },
  });

  const assignments = new Map<string, ActiveChipAssignment>();

  for (const chipPlay of chipPlays) {
    const affectedMatches =
      chipPlay.chipType.code === ChipCode.TEAM_FORM && chipPlay.selectedTeam?.id
        ? getTeamFormEffectiveMatches(
            orderedMatches,
            chipPlay.startMatchId,
            chipPlay.selectedTeam.id,
            chipPlay.chipType.effectWindowMatches,
          )
        : getAffectedMatches(
            orderedMatches,
            chipPlay.startMatchId,
            chipPlay.chipType.effectWindowMatches,
          );

    const activeIndex = affectedMatches.findIndex(
      (match) => match.id === matchId,
    );

    if (activeIndex < 0) {
      continue;
    }

    if (assignments.has(chipPlay.seasonUserId)) {
      throw new ChipServiceError(
        500,
        `Overlapping chip plays found for season user ${chipPlay.seasonUserId}`,
      );
    }

    assignments.set(chipPlay.seasonUserId, {
      seasonUserId: chipPlay.seasonUserId,
      chipPlayId: chipPlay.id,
      chipCode: chipPlay.chipType.code,
      chipName: chipPlay.chipType.name,
      chipShortCode: getChipShortCode(chipPlay.chipType.code),
      multiplier: chipPlay.chipType.multiplier,
      windowSize: affectedMatches.length,
      windowIndex: activeIndex + 1,
      usesSecondaryTeamScore: chipPlay.chipType.usesSecondaryTeamScore,
      startMatchId: chipPlay.startMatch.id,
      startMatchNo: chipPlay.startMatch.matchNo,
      selectedTeamId: chipPlay.selectedTeam?.id ?? null,
    });
  }

  return assignments;
};

const getChipTypeByCodeTx = async (tx: PrismaExecutor, chipCode: ChipCode) => {
  const chipType = await tx.chipType.findUnique({
    where: {
      code: chipCode,
    },
  });

  if (!chipType) {
    throw new ChipServiceError(404, "Chip type not found");
  }

  return chipType;
};

const getSeasonUserTx = async (
  tx: PrismaExecutor,
  seasonUserId: string,
  seasonId: number,
) => {
  const seasonUser = await tx.seasonUser.findUnique({
    where: {
      id: seasonUserId,
    },
    include: {
      user: true,
    },
  });

  if (!seasonUser || seasonUser.seasonId !== seasonId) {
    throw new ChipServiceError(404, "Season user not found in this season");
  }

  return seasonUser;
};

const serializeChipType = (chipType: ChipTypeRecord) => ({
  id: chipType.id,
  code: chipType.code,
  shortCode: getChipShortCode(chipType.code),
  name: chipType.name,
  description: chipType.description,
  multiplier: chipType.multiplier,
  maxUsesPerSeason: chipType.maxUsesPerSeason,
  effectWindowMatches: chipType.effectWindowMatches,
  requiresBottomHalf: chipType.requiresBottomHalf,
  usesSecondaryTeamScore: chipType.usesSecondaryTeamScore,
});

const serializeAffectedMatches = (
  orderedMatches: OrderedSeasonMatch[],
  startMatchId: string,
  windowSize: number,
) => {
  return getAffectedMatches(orderedMatches, startMatchId, windowSize).map(
    (match) => ({
      id: match.id,
      matchNo: match.matchNo,
      matchDate: match.matchDate.toISOString(),
      matchLabel: buildMatchLabel(match),
    }),
  );
};

const serializeChipPlay = (
  chipPlay: {
    id: string;
    status: ChipPlayStatus;
    canceledAt: Date | null;
    createdAt: Date;
    seasonUserId: string;
    chipType: ChipTypeRecord;
    startMatch: OrderedSeasonMatch;
    startMatchId: string;
    selectedTeamId: string | null;
    extraInfo?: Prisma.JsonValue | null;
    selectedTeam?: {
      id: string;
      shortCode: string;
      name: string;
    } | null;
  },
  orderedMatches: OrderedSeasonMatch[],
  now: Date,
) => {
  const affectedMatches =
    chipPlay.chipType.code === ChipCode.TEAM_FORM && chipPlay.selectedTeamId
      ? getTeamFormEffectiveMatches(
          orderedMatches,
          chipPlay.startMatchId,
          chipPlay.selectedTeamId,
          chipPlay.chipType.effectWindowMatches,
        ).map((match) => ({
          id: match.id,
          matchNo: match.matchNo,
          matchDate: match.matchDate.toISOString(),
          matchLabel: buildMatchLabel(match),
        }))
      : serializeAffectedMatches(
          orderedMatches,
          chipPlay.startMatchId,
          chipPlay.chipType.effectWindowMatches,
        );
  const hasStarted = chipPlay.startMatch.matchDate <= now;
  const ei =
    chipPlay.extraInfo &&
    typeof chipPlay.extraInfo === "object" &&
    !Array.isArray(chipPlay.extraInfo)
      ? (chipPlay.extraInfo as Record<string, unknown>)
      : null;

  const anchorPlayerName =
    typeof ei?.anchorPlayerName === "string" ? ei.anchorPlayerName : null;
  const anchorFantasyPlayerId =
    typeof ei?.anchorFantasyPlayerId === "string"
      ? ei.anchorFantasyPlayerId
      : null;

  return {
    id: chipPlay.id,
    seasonUserId: chipPlay.seasonUserId,
    chipCode: chipPlay.chipType.code,
    chipShortCode: getChipShortCode(chipPlay.chipType.code),
    chipName: chipPlay.chipType.name,
    selectedTeamId: chipPlay.selectedTeamId,
    extraInfo: chipPlay.extraInfo ?? null,
    anchorPlayerName,
    anchorFantasyPlayerId,
    selectedTeamShortCode: chipPlay.selectedTeam?.shortCode ?? null,
    selectedTeamName: chipPlay.selectedTeam?.name ?? null,
    status: chipPlay.status,
    startMatchId: chipPlay.startMatch.id,
    startMatchNo: chipPlay.startMatch.matchNo,
    startMatchDate: chipPlay.startMatch.matchDate.toISOString(),
    startMatchLabel: buildMatchLabel(chipPlay.startMatch),
    affectedMatches,
    canDeselect:
      chipPlay.status === ChipPlayStatus.SCHEDULED &&
      chipPlay.startMatch.matchDate > now,
    hasStarted,
    canceledAt: chipPlay.canceledAt?.toISOString() ?? null,
    createdAt: chipPlay.createdAt.toISOString(),
  };
};

const getSeasonPowerupsOverview = async (
  prismaClient: PrismaClient,
  seasonId: number,
) => {
  const now = new Date();

  const [chipTypes, seasonUsers, orderedMatches, chipPlays, standings] =
    await Promise.all([
      prismaClient.chipType.findMany({
        orderBy: {
          id: "asc",
        },
      }),
      prismaClient.seasonUser.findMany({
        where: { seasonId },
        include: {
          user: true,
        },
      }),
      getOrderedSeasonMatches(prismaClient, seasonId),
      prismaClient.chipPlay.findMany({
        where: {
          seasonUser: {
            seasonId,
          },
        },
        include: {
          chipType: true,
          selectedTeam: {
            select: {
              id: true,
              shortCode: true,
              name: true,
            },
          },
          startMatch: {
            select: {
              id: true,
              matchNo: true,
              matchDate: true,
              status: true,
              matchResult: true,
              homeTeamId: true,
              awayTeamId: true,
              homeTeam: {
                select: {
                  shortCode: true,
                },
              },
              awayTeam: {
                select: {
                  shortCode: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      getStandingsForSeason(prismaClient, seasonId),
    ]);

  const playsBySeasonUserId = new Map<string, typeof chipPlays>();

  for (const chipPlay of chipPlays) {
    const userPlays = playsBySeasonUserId.get(chipPlay.seasonUserId) ?? [];
    userPlays.push(chipPlay);
    playsBySeasonUserId.set(chipPlay.seasonUserId, userPlays);
  }

  const users = seasonUsers
    .map((seasonUser) => {
      const userPlays = playsBySeasonUserId.get(seasonUser.id) ?? [];
      const position =
        standings.positionBySeasonUserId.get(seasonUser.id) ?? null;

      const chipInventory = chipTypes.map((chipType) => {
        const usedCount = userPlays.filter(
          (play) =>
            play.chipTypeId === chipType.id &&
            play.status !== ChipPlayStatus.CANCELLED,
        ).length;

        return {
          chipCode: chipType.code,
          chipShortCode: getChipShortCode(chipType.code),
          chipName: chipType.name,
          maxUsesPerSeason: chipType.maxUsesPerSeason,
          usedCount,
          remainingCount: Math.max(chipType.maxUsesPerSeason - usedCount, 0),
        };
      });

      const eligibilityByChipCode = Object.fromEntries(
        chipTypes.map((chipType) => [
          chipType.code,
          chipType.requiresBottomHalf
            ? position !== null &&
              isBottomHalfPosition(position, standings.totalPlayers)
            : true,
        ]),
      ) as Record<ChipCode, boolean>;

      const serializedPlays = userPlays
        .map((chipPlay) => serializeChipPlay(chipPlay, orderedMatches, now))
        .sort((a, b) => {
          const dateDelta =
            new Date(a.startMatchDate).getTime() -
            new Date(b.startMatchDate).getTime();

          if (dateDelta !== 0) {
            return dateDelta;
          }

          return a.chipName.localeCompare(b.chipName);
        });

      return {
        seasonUserId: seasonUser.id,
        displayName: seasonUser.user.display_name,
        teamName: seasonUser.teamName,
        position,
        chipInventory,
        eligibilityByChipCode,
        plays: serializedPlays,
      };
    })
    .sort((a, b) => {
      const aPosition = a.position ?? Number.POSITIVE_INFINITY;
      const bPosition = b.position ?? Number.POSITIVE_INFINITY;

      if (aPosition !== bPosition) {
        return aPosition - bPosition;
      }

      return a.displayName.localeCompare(b.displayName);
    });

  return {
    seasonId,
    chipTypes: chipTypes.map((chipType) => serializeChipType(chipType)),
    selectableMatches: orderedMatches
      .filter((match) => match.matchDate > now)
      .map((match) => ({
        id: match.id,
        matchNo: match.matchNo,
        matchDate: match.matchDate.toISOString(),
        status: match.status,
        matchLabel: buildMatchLabel(match),
      })),
    users,
    generatedAt: now.toISOString(),
  };
};

const selectPowerupForSeasonMatch = async (
  prismaClient: PrismaClient,
  {
    seasonId,
    seasonUserId,
    chipCode,
    startMatchId,
    selectedTeamId,
    anchorFantasyPlayerId,
    anchorPlayerName,
    actorUserId,
    actorRole,
  }: SelectPowerupInput,
) => {
  const now = new Date();

  // Reads and validation outside transaction
  const [seasonUser, chipType, orderedMatches] = await Promise.all([
    getSeasonUserTx(prismaClient, seasonUserId, seasonId),
    getChipTypeByCodeTx(prismaClient, chipCode),
    getOrderedSeasonMatches(prismaClient, seasonId),
  ]);

  if (actorRole !== UserRole.ADMIN && seasonUser.userId !== actorUserId) {
    throw new ChipServiceError(
      403,
      "You can only select powerups for yourself",
    );
  }

  const startMatch = orderedMatches.find((match) => match.id === startMatchId);

  if (!startMatch) {
    throw new ChipServiceError(404, "Selected match not found in this season");
  }

  if (startMatch.matchDate <= now) {
    throw new ChipServiceError(
      400,
      "Powerup selection is locked once the selected match has started",
    );
  }

  if (chipType.code === ChipCode.TEAM_FORM) {
    if (!selectedTeamId) {
      throw new ChipServiceError(400, "Team Form requires selecting a team");
    }

    if (
      selectedTeamId !== startMatch.homeTeamId &&
      selectedTeamId !== startMatch.awayTeamId
    ) {
      throw new ChipServiceError(
        400,
        "Team Form can only be activated for a team in the selected fixture",
      );
    }

    const selectedTeamExists = await prismaClient.team.findUnique({
      where: { id: selectedTeamId },
      select: { id: true },
    });

    if (!selectedTeamExists) {
      throw new ChipServiceError(404, "Selected team not found");
    }

    const startIndex = orderedMatches.findIndex(
      (match) => match.id === startMatchId,
    );
    const remainingRegularTeamMatches = orderedMatches
      .slice(Math.max(startIndex, 0))
      .filter(
        (match) =>
          isRegularSeasonMatch(match.matchNo) &&
          isTeamMatch(match, selectedTeamId),
      );

    if (remainingRegularTeamMatches.length === 0) {
      throw new ChipServiceError(
        400,
        "Selected team has no remaining regular-season fixtures from this match",
      );
    }
  }

  if (chipType.code === ChipCode.ANCHOR_PLAYER) {
    if (!anchorFantasyPlayerId) {
      throw new ChipServiceError(
        400,
        "Anchor Player requires selecting an anchor player",
      );
    }
    // Validate the player is actually in this match's pool
    const inPool = await prismaClient.fantasyMatchPlayer.findFirst({
      where: { matchId: startMatchId, fantasyPlayerId: anchorFantasyPlayerId },
      select: { fantasyPlayerId: true },
    });
    if (!inPool) {
      throw new ChipServiceError(
        400,
        "Selected anchor player is not in the player pool for this match",
      );
    }
  }

  const affectedMatches =
    chipType.code === ChipCode.TEAM_FORM && selectedTeamId
      ? getTeamFormEffectiveMatches(
          orderedMatches,
          startMatchId,
          selectedTeamId,
          chipType.effectWindowMatches,
        )
      : getAffectedMatches(
          orderedMatches,
          startMatchId,
          chipType.effectWindowMatches,
        );

  if (
    chipType.code !== ChipCode.TEAM_FORM &&
    affectedMatches.length < chipType.effectWindowMatches
  ) {
    throw new ChipServiceError(
      400,
      `${chipType.name} needs ${chipType.effectWindowMatches} consecutive matches from the selected start match`,
    );
  }

  // Short write transaction: uniqueness checks + DB write only
  return prismaClient.$transaction(async (tx) => {
    const existingPlayForMatch = await tx.chipPlay.findUnique({
      where: {
        seasonUserId_chipTypeId_startMatchId: {
          seasonUserId,
          chipTypeId: chipType.id,
          startMatchId,
        },
      },
      include: {
        chipType: true,
        selectedTeam: {
          select: {
            id: true,
            shortCode: true,
            name: true,
          },
        },
      },
    });

    if (existingPlayForMatch?.status === ChipPlayStatus.SCHEDULED) {
      return serializeChipPlay(
        {
          ...existingPlayForMatch,
          startMatch,
        },
        orderedMatches,
        now,
      );
    }

    const [scheduledPlays, activeUsageCount] = await Promise.all([
      tx.chipPlay.findMany({
        where: {
          seasonUserId,
          status: ChipPlayStatus.SCHEDULED,
          seasonUser: {
            seasonId,
          },
        },
        include: {
          chipType: true,
          selectedTeam: {
            select: {
              id: true,
            },
          },
        },
      }),
      tx.chipPlay.count({
        where: {
          seasonUserId,
          chipTypeId: chipType.id,
          status: {
            not: ChipPlayStatus.CANCELLED,
          },
        },
      }),
    ]);

    if (activeUsageCount >= chipType.maxUsesPerSeason) {
      throw new ChipServiceError(
        400,
        `${chipType.name} has already been used ${chipType.maxUsesPerSeason} times this season`,
      );
    }

    if (chipType.requiresBottomHalf) {
      const standings = await getStandingsForSeason(tx, seasonId);
      const position = standings.positionBySeasonUserId.get(seasonUser.id);

      if (
        position === undefined ||
        !isBottomHalfPosition(position, standings.totalPlayers)
      ) {
        throw new ChipServiceError(
          400,
          `${chipType.name} can only be selected by players in the bottom 50%`,
        );
      }
    }

    const newAffectedMatchIds = affectedMatches.map((match) => match.id);

    for (const existingPlay of scheduledPlays) {
      const existingAffectedMatches =
        existingPlay.chipType.code === ChipCode.TEAM_FORM &&
        existingPlay.selectedTeam?.id
          ? getTeamFormEffectiveMatches(
              orderedMatches,
              existingPlay.startMatchId,
              existingPlay.selectedTeam.id,
              existingPlay.chipType.effectWindowMatches,
            )
          : getAffectedMatches(
              orderedMatches,
              existingPlay.startMatchId,
              existingPlay.chipType.effectWindowMatches,
            );
      const existingAffectedMatchIds = existingAffectedMatches.map(
        (match) => match.id,
      );

      if (hasOverlap(newAffectedMatchIds, existingAffectedMatchIds)) {
        throw new ChipServiceError(
          400,
          `Another powerup is already selected for one or more matches in this window (${existingPlay.chipType.name})`,
        );
      }
    }

    if (existingPlayForMatch?.status === ChipPlayStatus.CANCELLED) {
      const reactivated = await tx.chipPlay.update({
        where: {
          id: existingPlayForMatch.id,
        },
        data: {
          status: ChipPlayStatus.SCHEDULED,
          canceledAt: null,
          selectedTeamId:
            chipType.code === ChipCode.TEAM_FORM
              ? (selectedTeamId ?? null)
              : null,
          extraInfo:
            chipType.code === ChipCode.ANCHOR_PLAYER
              ? ({
                  anchorFantasyPlayerId,
                  anchorPlayerName: anchorPlayerName?.trim(),
                } as Prisma.InputJsonValue)
              : {},
        },
        include: {
          chipType: true,
          selectedTeam: {
            select: {
              id: true,
              shortCode: true,
              name: true,
            },
          },
        },
      });

      return serializeChipPlay(
        {
          ...reactivated,
          startMatch,
        },
        orderedMatches,
        now,
      );
    }

    const created = await tx.chipPlay.create({
      data: {
        seasonUserId,
        chipTypeId: chipType.id,
        startMatchId,
        selectedTeamId:
          chipType.code === ChipCode.TEAM_FORM
            ? (selectedTeamId ?? null)
            : null,
        extraInfo:
          chipType.code === ChipCode.ANCHOR_PLAYER
            ? ({
                anchorFantasyPlayerId,
                anchorPlayerName: anchorPlayerName?.trim(),
              } as Prisma.InputJsonValue)
            : {},
      },
      include: {
        chipType: true,
        selectedTeam: {
          select: {
            id: true,
            shortCode: true,
            name: true,
          },
        },
      },
    });

    return serializeChipPlay(
      {
        ...created,
        startMatch,
      },
      orderedMatches,
      now,
    );
  });
};

const deselectPowerup = async (
  prismaClient: PrismaClient,
  chipPlayId: string,
  actor: {
    userId: number;
    role: UserRole;
  },
) => {
  const now = new Date();

  return prismaClient.$transaction(async (tx) => {
    const chipPlay = await tx.chipPlay.findUnique({
      where: {
        id: chipPlayId,
      },
      include: {
        seasonUser: {
          select: {
            userId: true,
          },
        },
        chipType: true,
        selectedTeam: {
          select: {
            id: true,
            shortCode: true,
            name: true,
          },
        },
        startMatch: {
          select: {
            id: true,
            matchNo: true,
            matchDate: true,
            status: true,
            matchResult: true,
            homeTeamId: true,
            awayTeamId: true,
            homeTeam: {
              select: {
                shortCode: true,
              },
            },
            awayTeam: {
              select: {
                shortCode: true,
              },
            },
            seasonId: true,
          },
        },
      },
    });

    if (!chipPlay) {
      throw new ChipServiceError(404, "Powerup selection not found");
    }

    if (
      actor.role !== UserRole.ADMIN &&
      chipPlay.seasonUser.userId !== actor.userId
    ) {
      throw new ChipServiceError(
        403,
        "You can only deselect your own powerups",
      );
    }

    if (chipPlay.status === ChipPlayStatus.CANCELLED) {
      const orderedMatches = await getOrderedSeasonMatches(
        tx,
        chipPlay.startMatch.seasonId!,
      );

      return serializeChipPlay(chipPlay, orderedMatches, now);
    }

    if (chipPlay.startMatch.matchDate <= now) {
      throw new ChipServiceError(
        400,
        "Powerup cannot be deselected after the selected match has started",
      );
    }

    const updatedChipPlay = await tx.chipPlay.update({
      where: {
        id: chipPlay.id,
      },
      data: {
        status: ChipPlayStatus.CANCELLED,
        canceledAt: now,
      },
      include: {
        chipType: true,
      },
    });

    const orderedMatches = await getOrderedSeasonMatches(
      tx,
      chipPlay.startMatch.seasonId!,
    );

    return serializeChipPlay(
      {
        ...updatedChipPlay,
        startMatch: chipPlay.startMatch,
      },
      orderedMatches,
      now,
    );
  });
};

@Injectable()
export class ChipService {
  constructor(private readonly prisma: PrismaService) {}

  async getSeasonPowerupsOverview(seasonId: number) {
    return getSeasonPowerupsOverview(this.prisma.client, seasonId);
  }

  async selectPowerupForSeasonMatch(input: SelectPowerupInput) {
    return selectPowerupForSeasonMatch(this.prisma.client, input);
  }

  async deselectPowerup(
    chipPlayId: string,
    actor: {
      userId: number;
      role: UserRole;
    },
  ) {
    return deselectPowerup(this.prisma.client, chipPlayId, actor);
  }

  async resolveActiveChipAssignmentsForMatchTx(
    tx: PrismaExecutor,
    seasonId: number,
    matchId: string,
    seasonUserIds?: string[],
  ) {
    return resolveActiveChipAssignmentsForMatchTx(
      tx,
      seasonId,
      matchId,
      seasonUserIds,
    );
  }
}
