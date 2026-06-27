"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { Settlement } from "@/types/settlement";

type SettlementsStatus = "loading" | "ready" | "error";

function snapshotToSettlement(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Settlement {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Settlement;
}

export function useSettlements(sessionId: string, enabled: boolean) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [status, setStatus] = useState<SettlementsStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    let isActive = true;

    const settlementsQuery = query(
      collection(firestoreDb, "settlements"),
      where("sessionId", "==", sessionId),
    );

    const unsubscribe = onSnapshot(
      settlementsQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        const nextSettlements = snapshot.docs
          .map(snapshotToSettlement)
          .sort(
            (first, second) =>
              (second.createdAt?.toMillis() ?? 0) -
              (first.createdAt?.toMillis() ?? 0),
          );

        setSettlements(nextSettlements);
        setLoadedSessionId(sessionId);
        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error("Nepodařilo se načíst settlementy:", snapshotError);

        setSettlements([]);
        setLoadedSessionId(sessionId);
        setError("Settlementy se nepodařilo načíst.");
        setStatus("error");
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [enabled, sessionId]);

  const isCurrentSessionLoaded = loadedSessionId === sessionId;

  const isLoading = useMemo(
    () => enabled && Boolean(sessionId) && (!isCurrentSessionLoaded || status === "loading"),
    [enabled, isCurrentSessionLoaded, sessionId, status],
  );

  return {
    settlements:
      enabled && isCurrentSessionLoaded ? settlements : [],
    isLoading,
    error:
      enabled && isCurrentSessionLoaded ? error : null,
  };
}