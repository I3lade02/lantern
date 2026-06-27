import type { Timestamp } from "firebase/firestore";

export const EXPENSE_CATEGORIES = [
  "beer",
  "lemonade",
  "food",
  "snack",
  "cake",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  beer: "Pivo",
  lemonade: "Limonáda",
  food: "Jídlo",
  snack: "Snack",
  cake: "Dortík",
  other: "Ostatní",
};

export const EXPENSE_SPLIT_TYPES = [
  "single",
  "selected",
  "sessionParticipants",
  "custom",
] as const;

export type ExpenseSplitType = (typeof EXPENSE_SPLIT_TYPES)[number];

export const EXPENSE_SPLIT_TYPE_LABELS: Record<ExpenseSplitType, string> = {
  single: "Jen pro jednu osobu",
  selected: "Rozdělit mezi vybrané lidi",
  sessionParticipants: "Mezi všechny potvrzené účastníky",
  custom: "Vlastní ruční rozdělení",
};

export type ExpenseShare = {
  userId: string;
  userName: string;
  amountCents: number;
};

export type Expense = {
  id: string;
  sessionId: string;
  title: string;
  category: ExpenseCategory;
  amountCents: number;
  payerId: string;
  payerName: string;
  participantIds: string[];
  splitType: ExpenseSplitType;
  shares: ExpenseShare[];
  note: string;
  createdBy: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type ExpensePreset = {
  title: string;
  category: ExpenseCategory;
};

export const EXPENSE_PRESETS: Record<string, ExpensePreset> = {
  beer: {
    title: "Pivo",
    category: "beer",
  },
  lemonade: {
    title: "Limonáda",
    category: "lemonade",
  },
  chips: {
    title: "Chipsy",
    category: "snack",
  },
  cake: {
    title: "Dortík",
    category: "cake",
  },
};