import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import type { AuthenticatedRequest } from "./auth.types.js";

@Injectable()
export class AppUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.authUser) {
      throw new UnauthorizedException("Missing authenticated user context");
    }

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
