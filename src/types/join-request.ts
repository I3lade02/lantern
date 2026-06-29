import type { Timestamp } from "firebase/firestore";

export const JOIN_REQUEST_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;

export type JoinRequestStatus =
  (typeof JOIN_REQUEST_STATUSES)[number];

export type JoinRequest = {
  id: string;

  email: string;
  displayName: string;

  status: JoinRequestStatus;

  requestedAt: Timestamp | null;
  updatedAt: Timestamp | null;

  reviewedAt: Timestamp | null;
  reviewedById: string | null;
  reviewedByName: string | null;
};