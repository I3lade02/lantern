import type { User } from "firebase/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextValue = {
    user: User | null;
    status: AuthStatus;
};