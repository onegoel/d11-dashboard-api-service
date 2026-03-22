import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserRole } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { isPrismaRecordNotFoundError } from "../../common/errors/prisma-error.utils.js";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getSeasonUsers(seasonId: number) {
    return this.prisma.client.seasonUser.findMany({
      where: {
        seasonId,
      },
      include: {
        user: true,
      },
    });
  }

  async updateUserDisplayName(
    userId: number,
    displayName: string,
    actor: { id: number; role: UserRole },
  ) {
    if (actor.role !== UserRole.ADMIN && actor.id !== userId) {
      throw new ForbiddenException("You can only update your own display name");
    }

    try {
      return await this.prisma.client.user.update({
        where: { id: userId },
        data: { display_name: displayName },
      });
    } catch (error) {
      if (isPrismaRecordNotFoundError(error)) {
        throw new NotFoundException("User not found");
      }

      throw error;
    }
  }

  async updateSeasonUserTeamName(
    seasonUserId: string,
    teamName: string,
    actor: { id: number; role: UserRole },
  ) {
    const seasonUser = await this.prisma.client.seasonUser.findUnique({
      where: { id: seasonUserId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!seasonUser) {
      throw new NotFoundException("Season user not found");
    }

    if (actor.role !== UserRole.ADMIN && seasonUser.userId !== actor.id) {
      throw new ForbiddenException("You can only update your own team name");
    }

    try {
      return await this.prisma.client.seasonUser.update({
        where: { id: seasonUserId },
        data: { teamName },
        include: {
          user: true,
        },
      });
    } catch (error) {
      if (isPrismaRecordNotFoundError(error)) {
        throw new NotFoundException("Season user not found");
      }

      throw error;
    }
  }
}
