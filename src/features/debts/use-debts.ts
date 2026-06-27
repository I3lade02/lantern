"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { Debt } from "@/types/debt";

type DebtsStatus = "loading" | "ready" | "error";

function snapshotToDebt(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Debt {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Debt;
}

export function useDebts(enabled: boolean) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [status, setStatus] = useState<DebtsStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    const debtsQuery = query(
      collection(firestoreDb, "debts"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      debtsQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setDebts(snapshot.docs.map(snapshotToDebt));
        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error("Nepodařilo se načíst dluhy:", snapshotError);

        setDebts([]);
        setError("Dluhy se nepodařilo načíst.");
        setStatus("error");
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [enabled]);

  const isLoading = useMemo(
    () => enabled && status === "loading",
    [enabled, status],
  );

  return {
    debts: enabled ? debts : [],
    isLoading,
    error: enabled ? error : null,
  };
}