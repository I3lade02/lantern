import type { Timestamp } from "firebase/firestore";

export const ACTIVITY_TYPES = [
  "session_created",
  "session_updated",
  "session_rsvp",
  "expense_created",
  "expense_updated",
  "debt_paid",
  "dice_rolled",
  "game_added",
  "member_joined",
  "other",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type ActivityLogEntry = {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  message: string;
  sessionId: string | null;
  createdAt: Timestamp | null;
};