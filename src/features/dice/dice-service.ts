"use client";

import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type {
  DiceRollDraft,
  DiceRollMode,
  DieSides,
} from "@/types/dice";

export type DiceActor = {
  id: string;
  name: string;
};

type CreateDiceRollDraftInput = {
  dieSides: DieSides;
  quantity: number;
  modifier: number;
  rollMode: DiceRollMode;
  sessionId: string | null;
  sessionTitle: string | null;
  actor: DiceActor;
};

function rollSingleDie(sides: DieSides): number {
  return Math.floor(Math.random() * sides) + 1;
}

function getCriticalRoll(
  dieSides: DieSides,
  quantity: number,
  rollMode: DiceRollMode,
  individualRolls: number[],
  keptRoll: number | null,
): number | null {
  if (dieSides !== 20 || quantity !== 1) {
    return null;
  }

  if (rollMode === "standard") {
    return individualRolls[0] ?? null;
  }

  return keptRoll;
}

export function createDiceRollDraft(
  input: CreateDiceRollDraftInput,
): DiceRollDraft {
  const isSpecialD20Roll =
    input.dieSides === 20 &&
    (input.rollMode === "advantage" ||
      input.rollMode === "disadvantage");

  const individualRolls = isSpecialD20Roll
    ? [rollSingleDie(20), rollSingleDie(20)]
    : Array.from(
        { length: input.quantity },
        () => rollSingleDie(input.dieSides),
      );

  const keptRoll = isSpecialD20Roll
    ? input.rollMode === "advantage"
      ? Math.max(...individualRolls)
      : Math.min(...individualRolls)
    : null;

  const rollSubtotal =
    keptRoll ?? individualRolls.reduce((total, roll) => total + roll, 0);

  const total = rollSubtotal + input.modifier;

  const criticalRoll = getCriticalRoll(
    input.dieSides,
    input.quantity,
    input.rollMode,
    individualRolls,
    keptRoll,
  );

  return {
    rollerId: input.actor.id,
    rollerName: input.actor.name,

    sessionId: input.sessionId,
    sessionTitle: input.sessionTitle,

    dieSides: input.dieSides,
    quantity: input.quantity,
    modifier: input.modifier,
    rollMode: input.rollMode,

    individualRolls,
    keptRoll,
    total,

    isCriticalHit: criticalRoll === 20,
    isCriticalFail: criticalRoll === 1,
  };
}

export async function saveDiceRoll(
  roll: DiceRollDraft,
): Promise<string> {
  const rollRef = doc(collection(firestoreDb, "diceRolls"));

  await setDoc(rollRef, {
    id: rollRef.id,

    rollerId: roll.rollerId,
    rollerName: roll.rollerName,

    sessionId: roll.sessionId,
    sessionTitle: roll.sessionTitle,

    dieSides: roll.dieSides,
    quantity: roll.quantity,
    modifier: roll.modifier,
    rollMode: roll.rollMode,

    individualRolls: roll.individualRolls,
    keptRoll: roll.keptRoll,
    total: roll.total,

    isCriticalHit: roll.isCriticalHit,
    isCriticalFail: roll.isCriticalFail,

    createdAt: serverTimestamp(),
  });

  return rollRef.id;
}

export function getDiceErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Hod kostkou se nepodařilo uložit.";
  }

  if (error.message.toLowerCase().includes("permission")) {
    return "Nemáš oprávnění uložit tento hod.";
  }

  return "Hod kostkou se nepodařilo uložit. Zkus to znovu.";
}