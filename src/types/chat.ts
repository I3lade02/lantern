import type { Timestamp } from "firebase/firestore";
import type { AvatarColor } from "@/types/user";

export const CHAT_ROOM_ID = "global" as const;

export const CHAT_MESSAGE_TYPES = ["message"] as const;

export type ChatMessageType = (typeof CHAT_MESSAGE_TYPES)[number];

export const CHAT_MAX_MESSAGE_LENGTH = 1500;

export const CHAT_RECENT_MESSAGE_LIMIT = 80;

export type ChatMessage = {
    id: string;

    authorId: string;
    authorName: string;
    authorAvatarColor: AvatarColor;

    type: ChatMessageType;
    text: string;

    isDeleted: boolean;

    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    editedAt: Timestamp | null;

    deletedAt: Timestamp | null;
    deletedById: string | null;
};

export type ChatActor = {
    id: string;
    name: string;
    avatarColor: AvatarColor;
};