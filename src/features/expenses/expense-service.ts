"use client";

import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import { formatCzkFromCents } from "@/lib/money";
import type {
  ExpenseCategory,
  ExpenseShare,
  ExpenseSplitType,
} from "@/types/expense";

export type ExpenseActor = {
  id: string;
  name: string;
};

export type ExpenseMutationInput = {
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
};

function createActivityMessage(
  actorName: string,
  action: "created" | "updated" | "deleted",
  title: string,
  amountCents?: number,
): string {
  if (action === "created") {
    return `${actorName} přidal útratu „${title}“ za ${formatCzkFromCents(amountCents ?? 0)}.`;
  }

  if (action === "updated") {
    return `${actorName} upravil útratu „${title}“.`;
  }

  return `${actorName} smazal útratu „${title}“.`;
}

export async function createExpense(
  input: ExpenseMutationInput,
  actor: ExpenseActor,
): Promise<string> {
  const expenseRef = doc(collection(firestoreDb, "expenses"));
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.set(expenseRef, {
    id: expenseRef.id,
    sessionId: input.sessionId,
    title: input.title,
    category: input.category,
    amountCents: input.amountCents,
    payerId: input.payerId,
    payerName: input.payerName,
    participantIds: input.participantIds,
    splitType: input.splitType,
    shares: input.shares,
    note: input.note,
    createdBy: actor.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(activityRef, {
    id: activityRef.id,
    type: "expense_created",
    actorId: actor.id,
    actorName: actor.name,
    message: createActivityMessage(
      actor.name,
      "created",
      input.title,
      input.amountCents,
    ),
    sessionId: input.sessionId,
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return expenseRef.id;
}

export async function updateExpense(
  expenseId: string,
  input: ExpenseMutationInput,
  actor: ExpenseActor,
): Promise<void> {
  const expenseRef = doc(firestoreDb, "expenses", expenseId);
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.update(expenseRef, {
    sessionId: input.sessionId,
    title: input.title,
    category: input.category,
    amountCents: input.amountCents,
    payerId: input.payerId,
    payerName: input.payerName,
    participantIds: input.participantIds,
    splitType: input.splitType,
    shares: input.shares,
    note: input.note,
    updatedAt: serverTimestamp(),
  });

  batch.set(activityRef, {
    id: activityRef.id,
    type: "expense_updated",
    actorId: actor.id,
    actorName: actor.name,
    message: createActivityMessage(actor.name, "updated", input.title),
    sessionId: input.sessionId,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function deleteExpense(
  expenseId: string,
  title: string,
  sessionId: string,
  actor: ExpenseActor,
): Promise<void> {
  const expenseRef = doc(firestoreDb, "expenses", expenseId);
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.delete(expenseRef);

  batch.set(activityRef, {
    id: activityRef.id,
    type: "other",
    actorId: actor.id,
    actorName: actor.name,
    message: createActivityMessage(actor.name, "deleted", title),
    sessionId,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export function getExpenseErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Něco se pokazilo. Zkus to prosím znovu.";
  }

  if (error.message.toLowerCase().includes("permission")) {
    return "Nemáš oprávnění tuto útratu změnit.";
  }

  return "Útratu se nepodařilo uložit. Zkus to prosím znovu.";
}