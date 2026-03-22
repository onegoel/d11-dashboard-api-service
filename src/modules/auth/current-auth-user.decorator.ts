import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthenticatedUser, AuthenticatedRequest } from "./auth.types.js";

export const CurrentAuthUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.authUser;
  },
);
