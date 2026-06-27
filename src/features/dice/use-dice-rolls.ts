"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { DiceRoll } from "@/types/dice";

type DiceRollsStatus = "loading" | "ready" | "error";

function snapshotToDiceRoll(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): DiceRoll {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as DiceRoll;
}

export function useDiceRolls(enabled: boolean) {
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [status, setStatus] = useState<DiceRollsStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    const rollsQuery = query(
      collection(firestoreDb, "diceRolls"),
      orderBy("createdAt", "desc"),
      limit(60),
    );

    const unsubscribe = onSnapshot(
      rollsQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setRolls(snapshot.docs.map(snapshotToDiceRoll));
        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error(
          "Nepodařilo se načíst historii hodů:",
          snapshotError,
        );

        setRolls([]);
        setError("Historii hodů se nepodařilo načíst.");
        setStatus("error");
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [enabled]);

  return {
    rolls: enabled ? rolls : [],
    isLoading: enabled && status === "loading",
    error: enabled ? error : null,
  };
}