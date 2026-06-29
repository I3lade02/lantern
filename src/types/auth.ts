import type { User } from "firebase/auth";

import type { JoinRequest } from "@/types/join-request";
import type { UserProfile } from "@/types/user";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

export type ProfileStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export type AccessStatus =
  | "loading"
  | "approved"
  | "pending"
  | "denied";

export type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  joinRequest: JoinRequest | null;

  status: AuthStatus;
  profileStatus: ProfileStatus;
  accessStatus: AccessStatus;
};