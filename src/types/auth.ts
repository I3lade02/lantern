import type { User } from "firebase/auth";

import type { UserProfile } from "@/types/user";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type ProfileStatus = "idle" | "loading" | "ready" | "error";

export type AuthContextValue = {
    user: User | null;
    profile: UserProfile | null;
    status: AuthStatus;
    profileStatus: ProfileStatus;
};