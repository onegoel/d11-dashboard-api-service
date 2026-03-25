import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { PrismaService } from "../../common/database/prisma.service.js";
import { UserRole } from "../../../generated/prisma/client.js";
import type { AuthenticatedRequest } from "./auth.types.js";

@Injectable()
export class AppUserGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.authUser) {
      throw new UnauthorizedException("Missing authenticated user context");
    }

    const { claimedRole } = request.authUser;

    // Fast path: role is embedded in the JWT custom claims — skip the upsert,
    // do a lightweight SELECT to get the DB id.
    if (claimedRole && Object.values(UserRole).includes(claimedRole as UserRole)) {
      const dbUser = await this.prisma.client.user.findFirst({
        where: { auth_subject: request.authUser.uid },
        select: { id: true, display_name: true, auth_subject: true },
      });

      if (dbUser) {
        request.appUser = {
          id: dbUser.id,
          role: claimedRole as UserRole,
          displayName: dbUser.display_name,
          authSubject: dbUser.auth_subject,
        };
        return true;
      }
      // User not in DB yet — fall through to full sync (first login edge case)
    }

    // Slow path: full sync (creates user if new, updates profile, reads role from DB)
    const user = await this.authService.syncUserFromAuthProvider(request.authUser);

    request.appUser = {
      id: user.id,
      role: user.role,
      displayName: user.display_name,
      authSubject: user.auth_subject,
    };

    return true;
  }
}
