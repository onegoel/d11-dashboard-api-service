import { Injectable } from "@nestjs/common";
import {
  ChipCode,
  ChipPlayStatus,
  type FantasyEntryPlayer,
} from "../../../../generated/prisma/client.js";
import { PrismaService } from "../../../common/database/prisma.service.js";

export type SwapperActionType =
  | "CHANGE_CAPTAIN"
  | "CHANGE_VICE_CAPTAIN"
  | "SWAP_PLAYER";

export type SwapperConfig = {
  actionType: SwapperActionType;
  teamNo: 1 | 2;
  incomingFantasyPlayerId: string | null;
  outgoingFantasyPlayerId: string | null;
};

export type FantasyLineupPlayer = Pick<
  FantasyEntryPlayer,
  | "fantasyPlayerId"
  | "isCaptain"
  | "isViceCaptain"
  | "isBench"
  | "benchPriority"
>;

export type FantasyLineupChipPlay = {
  chipType: {
    code: ChipCode;
  };
  extraInfo: unknown;
};

@Injectable()
export class FantasyLineupService {
  constructor(private readonly prisma: PrismaService) {}

  parseSwapperConfig(extraInfo: unknown): SwapperConfig | null {
    if (
      !extraInfo ||
      typeof extraInfo !== "object" ||
      Array.isArray(extraInfo)
    ) {
      return null;
    }

    const info = extraInfo as Record<string, unknown>;
    const actionType =
      typeof info.swapperActionType === "string"
        ? (info.swapperActionType as SwapperActionType)
        : null;

    if (
      actionType !== "CHANGE_CAPTAIN" &&
      actionType !== "CHANGE_VICE_CAPTAIN" &&
      actionType !== "SWAP_PLAYER"
    ) {
      return null;
    }

    return {
      actionType,
      teamNo: info.swapperTeamNo === 2 ? 2 : 1,
      incomingFantasyPlayerId:
        typeof info.swapperIncomingFantasyPlayerId === "string"
          ? info.swapperIncomingFantasyPlayerId
          : null,
      outgoingFantasyPlayerId:
        typeof info.swapperOutgoingFantasyPlayerId === "string"
          ? info.swapperOutgoingFantasyPlayerId
          : null,
    };
  }

  buildEffectivePlayers<T extends FantasyLineupPlayer>(
    players: T[],
    teamNo: number,
    chipPlays: FantasyLineupChipPlay[],
  ): T[] {
    const effectivePlayers = players.map((player) => ({ ...player }));
    const swapperPlay = chipPlays.find(
      (play) => play.chipType.code === ChipCode.SWAPPER,
    );

    if (!swapperPlay) {
      return effectivePlayers;
    }

    const swapperConfig = this.parseSwapperConfig(swapperPlay.extraInfo);
    if (!swapperConfig || swapperConfig.teamNo !== teamNo) {
      return effectivePlayers;
    }

    const starters = effectivePlayers.filter((player) => !player.isBench);
    const starterIds = new Set(
      starters.map((player) => player.fantasyPlayerId),
    );
    const captain = starters.find((player) => player.isCaptain);
    const viceCaptain = starters.find((player) => player.isViceCaptain);

    if (
      swapperConfig.actionType === "CHANGE_CAPTAIN" &&
      swapperConfig.incomingFantasyPlayerId &&
      starterIds.has(swapperConfig.incomingFantasyPlayerId) &&
      viceCaptain?.fantasyPlayerId !== swapperConfig.incomingFantasyPlayerId
    ) {
      for (const player of effectivePlayers) {
        if (!player.isBench) {
          player.isCaptain =
            player.fantasyPlayerId === swapperConfig.incomingFantasyPlayerId;
        }
      }
    }

    if (
      swapperConfig.actionType === "CHANGE_VICE_CAPTAIN" &&
      swapperConfig.incomingFantasyPlayerId &&
      starterIds.has(swapperConfig.incomingFantasyPlayerId) &&
      captain?.fantasyPlayerId !== swapperConfig.incomingFantasyPlayerId
    ) {
      for (const player of effectivePlayers) {
        if (!player.isBench) {
          player.isViceCaptain =
            player.fantasyPlayerId === swapperConfig.incomingFantasyPlayerId;
        }
      }
    }

    if (
      swapperConfig.actionType === "SWAP_PLAYER" &&
      swapperConfig.incomingFantasyPlayerId &&
      swapperConfig.outgoingFantasyPlayerId &&
      !starterIds.has(swapperConfig.incomingFantasyPlayerId)
    ) {
      const outgoingStarter = starters.find(
        (player) =>
          player.fantasyPlayerId === swapperConfig.outgoingFantasyPlayerId,
      );

      if (
        outgoingStarter &&
        !outgoingStarter.isCaptain &&
        !outgoingStarter.isViceCaptain
      ) {
        const targetStarter = effectivePlayers.find(
          (player) =>
            !player.isBench &&
            player.fantasyPlayerId === swapperConfig.outgoingFantasyPlayerId,
        );

        if (targetStarter) {
          targetStarter.fantasyPlayerId = swapperConfig.incomingFantasyPlayerId;
          effectivePlayers.forEach((player) => {
            if (
              player.isBench &&
              player.fantasyPlayerId === swapperConfig.incomingFantasyPlayerId
            ) {
              player.fantasyPlayerId = swapperConfig.outgoingFantasyPlayerId!;
            }
          });
        }
      }
    }

    return effectivePlayers;
  }

  async getEffectivePlayersForEntries<
    T extends FantasyLineupPlayer,
    TEntry extends {
      id: string;
      userId: number;
      teamNo: number;
      players: T[];
    },
  >(matchId: string, entries: TEntry[]): Promise<Map<string, T[]>> {
    const effectivePlayersByEntryId = new Map<string, T[]>();

    if (entries.length === 0) {
      return effectivePlayersByEntryId;
    }

    const userIds = Array.from(new Set(entries.map((entry) => entry.userId)));
    const chipPlays = await this.prisma.client.chipPlay.findMany({
      where: {
        status: { not: ChipPlayStatus.CANCELLED },
        startMatchId: matchId,
        seasonUser: { userId: { in: userIds } },
      },
      select: {
        chipType: { select: { code: true } },
        extraInfo: true,
        seasonUser: { select: { userId: true } },
      },
    });

    const chipPlaysByUserId = new Map<number, FantasyLineupChipPlay[]>();
    for (const chipPlay of chipPlays) {
      const existing = chipPlaysByUserId.get(chipPlay.seasonUser.userId) ?? [];
      existing.push({
        chipType: chipPlay.chipType,
        extraInfo: chipPlay.extraInfo,
      });
      chipPlaysByUserId.set(chipPlay.seasonUser.userId, existing);
    }

    for (const entry of entries) {
      effectivePlayersByEntryId.set(
        entry.id,
        this.buildEffectivePlayers(
          entry.players,
          entry.teamNo,
          chipPlaysByUserId.get(entry.userId) ?? [],
        ),
      );
    }

    return effectivePlayersByEntryId;
  }
}
