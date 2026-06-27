"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { Expense } from "@/types/expense";

type ExpensesStatus = "loading" | "ready" | "error";

type UseExpensesOptions = {
  sessionId?: string;
};

function snapshotToExpense(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Expense {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Expense;
}

function sortNewestFirst(expenses: Expense[]): Expense[] {
  return [...expenses].sort(
    (first, second) =>
      (second.createdAt?.toMillis() ?? 0) -
      (first.createdAt?.toMillis() ?? 0),
  );
}

export function useExpenses(
  enabled: boolean,
  options: UseExpensesOptions = {},
) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [status, setStatus] = useState<ExpensesStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadedQueryKey, setLoadedQueryKey] = useState<string | null>(null);

  const sessionId = options.sessionId;
  const queryKey = sessionId ? `session:${sessionId}` : "all-expenses";

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    const expensesQuery = sessionId
      ? query(
          collection(firestoreDb, "expenses"),
          where("sessionId", "==", sessionId),
        )
      : query(
          collection(firestoreDb, "expenses"),
          orderBy("createdAt", "desc"),
        );

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setExpenses(sortNewestFirst(snapshot.docs.map(snapshotToExpense)));
        setLoadedQueryKey(queryKey);
        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error("Nepodařilo se načíst útraty:", snapshotError);

        setExpenses([]);
        setLoadedQueryKey(queryKey);
        setError("Útraty se nepodařilo načíst.");
        setStatus("error");
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [enabled, queryKey, sessionId]);

  const isCurrentQueryLoaded = loadedQueryKey === queryKey;

  const isLoading = useMemo(
    () => enabled && (!isCurrentQueryLoaded || status === "loading"),
    [enabled, isCurrentQueryLoaded, status],
  );

  return {
    expenses: enabled && isCurrentQueryLoaded ? expenses : [],
    isLoading,
    error: enabled && isCurrentQueryLoaded ? error : null,
  };
}