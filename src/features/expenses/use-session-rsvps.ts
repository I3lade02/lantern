"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { SessionRsvp } from "@/types/session";

type SessionRsvpsStatus = "loading" | "ready" | "error";

function snapshotToRsvp(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): SessionRsvp {
  return {
    userId: snapshot.id,
    ...snapshot.data(),
  } as SessionRsvp;
}

export function useSessionRsvps(sessionId: string, enabled: boolean) {
  const [rsvps, setRsvps] = useState<SessionRsvp[]>([]);
  const [status, setStatus] = useState<SessionRsvpsStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    let isActive = true;

    const unsubscribe = onSnapshot(
      collection(firestoreDb, "sessions", sessionId, "rsvps"),
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setRsvps(snapshot.docs.map(snapshotToRsvp));
        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error("Nepodařilo se načíst RSVP pro útratu:", snapshotError);

        setRsvps([]);
        setError("Účastníky session se nepodařilo načíst.");
        setStatus("error");
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [enabled, sessionId]);

  const isLoading = useMemo(
    () => enabled && status === "loading",
    [enabled, status],
  );

  return {
    rsvps: enabled ? rsvps : [],
    isLoading,
    error: enabled ? error : null,
  };
}