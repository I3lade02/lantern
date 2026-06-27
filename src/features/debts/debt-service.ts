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
  Debt,
  DebtStatus,
} from "@/types/debt";
import type { Expense } from "@/types/expense";
import type { Session } from "@/types/session";

import type {
  DebtCalculation,
  SettlementTransfer,
} from "./debt-calculator";

export type DebtActor = {
  id: string;
  name: string;
};

type CreateSettlementInput = {
  session: Pick<Session, "id" | "title">;
  expenses: Expense[];
  calculation: DebtCalculation;
  actor: DebtActor;
};

type DebtResolution = Extract<DebtStatus, "paid" | "forgiven">;

type DebtPaymentSubmissionInput = {
  recipientAccount: string;
  recipientName: string;
  variableSymbol: string | null;
  message: string;
};

function createSettlementMessage(
  actorName: string,
  sessionTitle: string,
  transfers: SettlementTransfer[],
): string {
  if (transfers.length === 0) {
    return `${actorName} uzavřel vyrovnání session „${sessionTitle}“. Nikdo nikomu nic nedluží.`;
  }

  return `${actorName} vypočítal ${transfers.length} převodů pro session „${sessionTitle}“.`;
}

export async function createDebtSettlement({
  session,
  expenses,
  calculation,
  actor,
}: CreateSettlementInput): Promise<string> {
  if (expenses.length === 0) {
    throw new Error(
      "Pro tuto session nejsou žádné nové útraty k vyrovnání.",
    );
  }

  const writeCount = 2 + calculation.transfers.length;

  if (writeCount > 450) {
    throw new Error(
      "Settlement má příliš mnoho převodů. Rozděl útraty do více menších vyrovnání.",
    );
  }

  const settlementRef = doc(collection(firestoreDb, "settlements"));
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.set(settlementRef, {
    id: settlementRef.id,
    sessionId: session.id,
    sessionTitle: session.title,
    sourceExpenseIds: expenses.map((expense) => expense.id),
    sourceExpenseCount: expenses.length,
    totalExpenseCents: calculation.totalExpenseCents,
    debtCount: calculation.transfers.length,
    createdBy: actor.id,
    createdByName: actor.name,
    createdAt: serverTimestamp(),
  });

  for (const transfer of calculation.transfers) {
    const debtRef = doc(collection(firestoreDb, "debts"));

    batch.set(debtRef, {
      id: debtRef.id,

      settlementId: settlementRef.id,
      sessionId: session.id,
      sessionTitle: session.title,

      fromUserId: transfer.fromUserId,
      fromUserName: transfer.fromUserName,

      toUserId: transfer.toUserId,
      toUserName: transfer.toUserName,

      amountCents: transfer.amountCents,
      status: "open",
      note: "",

      createdBy: actor.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      settledAt: null,
      settledById: null,
      settledByName: null,

      paymentId: null,
    });
  }

  batch.set(activityRef, {
    id: activityRef.id,
    type: "debts_calculated",
    actorId: actor.id,
    actorName: actor.name,
    message: createSettlementMessage(
      actor.name,
      session.title,
      calculation.transfers,
    ),
    sessionId: session.id,
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return settlementRef.id;
}

export async function submitDebtPayment(
  debt: Debt,
  payment: DebtPaymentSubmissionInput,
  actor: DebtActor,
): Promise<void> {
  if (debt.status !== "open") {
    throw new Error(
      "Tento dluh už není možné označit jako zaplacený.",
    );
  }

  if (debt.fromUserId !== actor.id) {
    throw new Error(
      "Platbu může jako odeslanou označit pouze člověk, který dluh platí.",
    );
  }

  const debtRef = doc(firestoreDb, "debts", debt.id);
  const paymentRef = doc(collection(firestoreDb, "payments"));
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.update(debtRef, {
    status: "pending",
    paymentId: paymentRef.id,
    updatedAt: serverTimestamp(),
  });

  batch.set(paymentRef, {
    id: paymentRef.id,

    debtId: debt.id,
    sessionId: debt.sessionId,
    sessionTitle: debt.sessionTitle,

    fromUserId: debt.fromUserId,
    fromUserName: debt.fromUserName,

    toUserId: debt.toUserId,
    toUserName: debt.toUserName,

    amountCents: debt.amountCents,

    method: "qr_payment",
    status: "submitted",

    recipientAccount: payment.recipientAccount,
    recipientName: payment.recipientName,
    variableSymbol: payment.variableSymbol,
    message: payment.message,

    submittedById: actor.id,
    submittedByName: actor.name,
    submittedAt: serverTimestamp(),

    reviewedAt: null,
    reviewedById: null,
    reviewedByName: null,
  });

  batch.set(activityRef, {
    id: activityRef.id,
    type: "payment_submitted",
    actorId: actor.id,
    actorName: actor.name,
    message: `${actor.name} označil platbu ${debt.fromUserName} → ${debt.toUserName} za ${formatCzkFromCents(debt.amountCents)} jako odeslanou.`,
    sessionId: debt.sessionId,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function resolveDebt(
  debt: Debt,
  resolution: DebtResolution,
  actor: DebtActor,
): Promise<void> {
  if (debt.status !== "open" && debt.status !== "pending") {
    throw new Error(
      "Tento dluh už není možné znovu uzavřít.",
    );
  }

  const debtRef = doc(firestoreDb, "debts", debt.id);
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.update(debtRef, {
    status: resolution,
    updatedAt: serverTimestamp(),
    settledAt: serverTimestamp(),
    settledById: actor.id,
    settledByName: actor.name,
  });

  if (debt.status === "pending" && debt.paymentId) {
    const paymentRef = doc(
      firestoreDb,
      "payments",
      debt.paymentId,
    );

    batch.update(paymentRef, {
      status: resolution === "paid" ? "confirmed" : "cancelled",
      reviewedAt: serverTimestamp(),
      reviewedById: actor.id,
      reviewedByName: actor.name,
    });
  }

  const resolutionText =
    resolution === "paid"
      ? "potvrdil jako zaplacený"
      : "odpustil";

  batch.set(activityRef, {
    id: activityRef.id,
    type: "debt_resolved",
    actorId: actor.id,
    actorName: actor.name,
    message: `${actor.name} ${resolutionText} dluh ${debt.fromUserName} → ${debt.toUserName} za ${formatCzkFromCents(debt.amountCents)}.`,
    sessionId: debt.sessionId,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export function getDebtErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Něco se pokazilo. Zkus to prosím znovu.";
  }

  if (
    error.message.includes("není možné") ||
    error.message.includes("může jako odeslanou")
  ) {
    return error.message;
  }

  if (error.message.includes("žádné nové útraty")) {
    return error.message;
  }

  if (error.message.includes("příliš mnoho převodů")) {
    return error.message;
  }

  if (error.message.toLowerCase().includes("permission")) {
    return "Nemáš oprávnění provést tuto změnu.";
  }

  return "Změnu dluhu se nepodařilo uložit. Zkus to prosím znovu.";
}