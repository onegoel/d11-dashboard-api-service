import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../../generated/prisma/client.js";

export const ROLES_METADATA_KEY = "roles";

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_METADATA_KEY, roles);
