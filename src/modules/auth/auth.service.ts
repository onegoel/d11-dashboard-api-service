import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service.js";
import type { AuthenticatedUser } from "./auth.types.js";
import type { CompleteOnboardingDto } from "./dto/complete-onboarding.dto.js";

const GOOGLE_PROVIDER = "google";

type NameParts = {
  firstName: string;
  lastName: string;
  fullName: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(authUser: AuthenticatedUser) {
    const user = await this.syncUserFromAuthProvider(authUser);
    const activeSeason = await this.getActiveSeason();

    const seasonUser = activeSeason
      ? await this.prisma.client.seasonUser.findUnique({
          where: {
            seasonId_userId: {
              seasonId: activeSeason.id,
              userId: user.id,
            },
          },
        })
      : null;

    return {
      user,
      activeSeasonId: activeSeason?.id ?? null,
      seasonUserId: seasonUser?.id ?? null,
      isOnboarded: Boolean(user.onboardedAt && seasonUser),
    };
  }

  async completeOnboarding(
    authUser: AuthenticatedUser,
    dto: CompleteOnboardingDto,
  ) {
    const user = await this.syncUserFromAuthProvider(authUser);
    const activeSeason = await this.getActiveSeason();

    if (!activeSeason) {
      throw new NotFoundException(
        "No active season found. Ask an admin to create or activate a season first.",
      );
    }

    const displayName = dto.displayName.trim();
    const teamName = dto.teamName.trim();
    const photoUrl =
      dto.photoUrl?.trim() || user.photo_url || authUser.picture || null;

    const updatedUser = await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        display_name: displayName,
        photo_url: photoUrl,
        onboardedAt: user.onboardedAt ?? new Date(),
        lastLoginAt: new Date(),
      },
    });

    const seasonUser = await this.prisma.client.seasonUser.upsert({
      where: {
        seasonId_userId: {
          seasonId: activeSeason.id,
          userId: updatedUser.id,
        },
      },
      update: {
        teamName,
      },
      create: {
        seasonId: activeSeason.id,
        userId: updatedUser.id,
        teamName,
      },
    });

    return {
      user: updatedUser,
      activeSeasonId: activeSeason.id,
      seasonUserId: seasonUser.id,
      isOnboarded: true,
    };
  }

  async syncUserFromAuthProvider(authUser: AuthenticatedUser) {
    const nameParts = this.extractNameParts(authUser.name, authUser.email);

    const existingBySubject = await this.prisma.client.user.findFirst({
      where: {
        auth_subject: authUser.uid,
      },
    });

    if (existingBySubject) {
      const updateData: {
        auth_provider: string;
        email?: string | null;
        photo_url?: string | null;
        full_name?: string | null;
        first_name?: string;
        last_name?: string;
        lastLoginAt: Date;
      } = {
        auth_provider: GOOGLE_PROVIDER,
        lastLoginAt: new Date(),
      };

      if (authUser.email !== null) {
        updateData.email = authUser.email;
      }

      if (authUser.picture !== null && !existingBySubject.photo_url) {
        updateData.photo_url = authUser.picture;
      }

      if (nameParts.fullName) {
        updateData.full_name = nameParts.fullName;
      }

      if (!existingBySubject.first_name) {
        updateData.first_name = nameParts.firstName;
      }

      if (!existingBySubject.last_name) {
        updateData.last_name = nameParts.lastName;
      }

      return this.prisma.client.user.update({
        where: { id: existingBySubject.id },
        data: updateData,
      });
    }

    const existingByEmail = authUser.email
      ? await this.prisma.client.user.findFirst({
          where: {
            email: authUser.email,
          },
        })
      : null;

    if (existingByEmail) {
      return this.prisma.client.user.update({
        where: { id: existingByEmail.id },
        data: {
          auth_provider: GOOGLE_PROVIDER,
          auth_subject: authUser.uid,
          email: authUser.email,
          photo_url: existingByEmail.photo_url || authUser.picture,
          full_name: nameParts.fullName || existingByEmail.full_name,
          first_name: existingByEmail.first_name || nameParts.firstName,
          last_name: existingByEmail.last_name || nameParts.lastName,
          lastLoginAt: new Date(),
        },
      });
    }

    const username = await this.generateUniqueUserName(
      authUser.email,
      nameParts.fullName,
    );

    return this.prisma.client.user.create({
      data: {
        first_name: nameParts.firstName,
        last_name: nameParts.lastName,
        full_name: nameParts.fullName,
        display_name: nameParts.firstName,
        user_name: username,
        email: authUser.email,
        photo_url: authUser.picture,
        auth_provider: GOOGLE_PROVIDER,
        auth_subject: authUser.uid,
        lastLoginAt: new Date(),
      },
    });
  }

  private extractNameParts(
    fullName: string | null,
    email: string | null,
  ): NameParts {
    const fallbackName = email?.split("@")[0] ?? "Player";
    const normalizedFullName = (fullName?.trim() || fallbackName).replace(
      /\s+/g,
      " ",
    );
    const parts = normalizedFullName.split(" ").filter(Boolean);

    if (parts.length <= 1) {
      const firstName = parts[0] ?? "Player";
      return {
        firstName,
        lastName: "User",
        fullName: normalizedFullName,
      };
    }

    return {
      firstName: parts[0]!,
      lastName: parts.slice(1).join(" "),
      fullName: normalizedFullName,
    };
  }

  private sanitizeUserNameSeed(seed: string) {
    const normalized = seed
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 20);

    return normalized || "player";
  }

  private async generateUniqueUserName(
    email: string | null,
    fullName: string | null,
  ) {
    const seed = email?.split("@")[0] ?? fullName ?? "player";
    const base = this.sanitizeUserNameSeed(seed);

    for (let suffix = 0; suffix < 500; suffix += 1) {
      const candidate = suffix === 0 ? base : `${base}_${suffix}`;
      const existing = await this.prisma.client.user.findUnique({
        where: {
          user_name: candidate,
        },
      });

      if (!existing) {
        return candidate;
      }
    }

    return `${base}_${Date.now()}`;
  }

  private async getActiveSeason() {
    return this.prisma.client.season.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        year: "desc",
      },
    });
  }
}
