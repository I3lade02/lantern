import type { Timestamp } from "firebase/firestore";

export const USER_ROLES = ["admin", "member"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const AVATAR_COLORS = [
    "amber",
    "moss",
    "wine",
    "cream",
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];

export type UserProfile = {
    id: string;
    displayName: string;
    email: string;
    avatarColor: AvatarColor;
    role: UserRole;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
};