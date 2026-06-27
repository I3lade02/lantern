import type { Timestamp } from "firebase/firestore";

export type Settlement = {
  id: string;
  sessionId: string;
  sessionTitle: string;

  sourceExpenseIds: string[];
  sourceExpenseCount: number;
  totalExpenseCents: number;
  debtCount: number;

  createdBy: string;
  createdByName: string;
  createdAt: Timestamp | null;
};