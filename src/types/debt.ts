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
    sessionId: string | null;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
    status: DebtStatus;
    note: string | null;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    settledAt: Timestamp | null;
}