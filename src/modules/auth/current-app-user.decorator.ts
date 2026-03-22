import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AppUserContext, AuthenticatedRequest } from "./auth.types.js";

export const CurrentAppUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AppUserContext => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.appUser;
  },
);
