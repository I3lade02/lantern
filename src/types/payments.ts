import type { Timestamp } from "firebase/firestore";

export const PAYMENT_METHODS = ["qr_payment"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "submitted",
  "confirmed",
  "cancelled",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type Payment = {
  id: string;

  debtId: string;
  sessionId: string;
  sessionTitle: string;

  fromUserId: string;
  fromUserName: string;

  toUserId: string;
  toUserName: string;

  amountCents: number;

  method: PaymentMethod;
  status: PaymentStatus;

  recipientAccount: string;
  recipientName: string;
  variableSymbol: string | null;
  message: string;

  submittedById: string;
  submittedByName: string;
  submittedAt: Timestamp | null;

  reviewedAt: Timestamp | null;
  reviewedById: string | null;
  reviewedByName: string | null;
};