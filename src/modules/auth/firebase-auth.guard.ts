import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { FirebaseAdminService } from "./firebase-admin.service.js";
import type { AuthenticatedRequest } from "./auth.types.js";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rawAuthHeader = request.headers.authorization;

    if (!rawAuthHeader || !rawAuthHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing Bearer token");
    }

    const token = rawAuthHeader.slice("Bearer ".length).trim();

    if (!token) {
      throw new UnauthorizedException("Missing Bearer token");
    }

    try {
      const decoded = await this.firebaseAdminService.verifyIdToken(token);

      request.authUser = {
        uid: decoded.uid,
        email: decoded.email ?? null,
        name: decoded.name ?? null,
        picture: decoded.picture ?? null,
        claimedRole: typeof decoded["role"] === "string" ? decoded["role"] : null,
      };

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException("Invalid or expired auth token");
    }
  }
}
