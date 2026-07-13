import type { Timestamp } from "firebase/firestore";

export const DRINK_CATEGORIES = [
  "beer",
  "lemonade",
  "energyDrink",
  "nonAlcoBeer",
  "other",
] as const;

export type DrinkCategory =
  (typeof DRINK_CATEGORIES)[number];

export const DRINK_CATEGORY_LABELS: Record<
  DrinkCategory,
  string
> = {
  beer: "Pivo",
  lemonade: "Limonáda",
  energyDrink: "Energetický nápoj",
  nonAlcoBeer: "Nealkoholické pivo",
  other: "Ostatní",
};

export type Drink = {
  id: string;

  name: string;
  priceCents: number;
  category: DrinkCategory;
  imageUrl: string | null;

  qrToken: string;
  isAvailable: boolean;

  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type BarConfig = {
  id: "main";

  payerId: string;
  payerName: string;

  updatedAt: Timestamp | null;
  updatedById: string;
};

export type BarClaim = {
  id: string;

  expenseId: string;

  drinkId: string;
  drinkName: string;
  drinkCategory: DrinkCategory;
  priceCents: number;

  sessionId: string;

  claimantId: string;
  claimantName: string;

  claimedAt: Timestamp | null;
};

export type BarAdminDrink = {
  id: string;

  name: string;
  priceCents: number;
  category: DrinkCategory;
  imageUrl: string | null;

  qrToken: string;
  isAvailable: boolean;
};

export type BarAdminConfig = {
  id: "main";

  payerId: string;
  payerName: string;

  updatedById: string;
};

export type BarAdminOverview = {
  config: BarAdminConfig | null;
  drinks: BarAdminDrink[];
};

export type BarDrinkInput = {
  name: string;
  priceCents: number;
  category: DrinkCategory;
  imageUrl: string | null;
  isAvailable: boolean;
};

export type BarScanDrink = {
  id: string;
  name: string;
  priceCents: number;
  category: DrinkCategory;
  operatorName: string;
};

export type BarClaimResponse = {
  expenseId: string;
  barClaimId: string;

  drink: {
    id: string;
    name: string;
    priceCents: number;
    category: DrinkCategory;
  };
};
