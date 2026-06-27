import type { Timestamp } from "firebase/firestore";

export const DICE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;

export type DieSides = (typeof DICE_SIDES)[number];

export const DICE_ROLL_MODES = [
  "standard",
  "advantage",
  "disadvantage",
] as const;

export type DiceRollMode = (typeof DICE_ROLL_MODES)[number];

export type DiceRoll = {
  id: string;

  rollerId: string;
  rollerName: string;

  sessionId: string | null;
  sessionTitle: string | null;

  dieSides: DieSides;
  quantity: number;
  modifier: number;
  rollMode: DiceRollMode;

  individualRolls: number[];
  keptRoll: number | null;
  total: number;

  isCriticalHit: boolean;
  isCriticalFail: boolean;

  createdAt: Timestamp | null;
};

export type DiceRollDraft = Omit<DiceRoll, "id" | "createdAt">;