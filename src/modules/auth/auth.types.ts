import type { Request } from "express";
import type { UserRole } from "../../../generated/prisma/client.js";

export type AuthenticatedUser = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  /** Role from Firebase custom JWT claims, if already set. */
  claimedRole?: string | null;
};

export type AppUserContext = {
  id: number;
  role: UserRole;
  displayName: string;
  authSubject: string | null;
};

export type AuthenticatedRequest = Request & {
  authUser: AuthenticatedUser;
  appUser: AppUserContext;
};
