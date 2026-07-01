import type { Timestamp } from "firebase/firestore";

export const NOTIFICATION_ICON_KINDS = [
  "session",
  "expense",
  "debt",
  "payment",
  "game",
  "dice",
  "member",
  "other",
] as const;

export type NotificationIconKind =
  (typeof NOTIFICATION_ICON_KINDS)[number];

export type NotificationState = {
  id: "main";

  lastSeenAt?: Timestamp | null;
  lastSeenChatAt?: Timestamp | null;

  updatedAt: Timestamp | null;
};

export type InAppNotification = {
  id: string;

  title: string;
  message: string;
  href: string;

  iconKind: NotificationIconKind;

  actorId: string;
  actorName: string;

  sessionId: string | null;

  createdAt: Timestamp | null;
  isUnread: boolean;
};