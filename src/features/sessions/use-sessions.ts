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
import type { Session } from "@/types/session";

type SessionsStatus = "loading" | "ready" | "error";

function snapshotToSession(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Session {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Session;
}

export function useSessions(enabled: boolean) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [status, setStatus] = useState<SessionsStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    const sessionsQuery = query(
      collection(firestoreDb, "sessions"),
      orderBy("startAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setSessions(snapshot.docs.map(snapshotToSession));
        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error("Nepodařilo se načíst sessions:", snapshotError);

        setSessions([]);
        setError("Sessions se nepodařilo načíst.");
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
    sessions: enabled ? sessions : [],
    isLoading,
    error: enabled ? error : null,
  };
}