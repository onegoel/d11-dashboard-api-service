import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import type { AuthenticatedRequest } from "./auth.types.js";

@Injectable()
export class AppUserGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (process.env.DISABLE_AUTH === "true") {
      request.appUser = { id: 0, role: "ADMIN" as any, displayName: "Dev", authSubject: "dev" };
      return true;
    }

    if (!request.authUser) {
      throw new UnauthorizedException("Missing authenticated user context");
    }

    // Fast path: if user exists in DB, trust DB role (source of truth).
    // This avoids stale JWT custom-claim role causing permission mismatches.
    const dbUser = await this.prisma.client.user.findFirst({
      where: { auth_subject: request.authUser.uid },
      select: { id: true, role: true, display_name: true, auth_subject: true },
    });

    if (dbUser) {
      request.appUser = {
        id: dbUser.id,
        role: dbUser.role,
        displayName: dbUser.display_name,
        authSubject: dbUser.auth_subject,
      };
      return true;
    }

    // Slow path: full sync (creates user if new, updates profile, reads role from DB)
    const user = await this.authService.syncUserFromAuthProvider(
      request.authUser,
    );

    request.appUser = {
      id: user.id,
      role: user.role,
      displayName: user.display_name,
      authSubject: user.auth_subject,
    };

    return true;
  }
}
