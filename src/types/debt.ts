import type { Timestamp } from "firebase/firestore";

export const DEBT_STATUSES = [
  "open",
  "pending",
  "paid",
  "forgiven",
] as const;

export type DebtStatus = (typeof DEBT_STATUSES)[number];

export type Debt = {
  id: string;

  settlementId: string;
  sessionId: string;
  sessionTitle: string;

  fromUserId: string;
  fromUserName: string;

  toUserId: string;
  toUserName: string;

  amountCents: number;
  status: DebtStatus;
  note: string;

  createdBy: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;

  settledAt: Timestamp | null;
  settledById: string | null;
  settledByName: string | null;

  paymentId?: string | null;
};