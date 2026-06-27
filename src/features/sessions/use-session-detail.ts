"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { Session, SessionRsvp } from "@/types/session";

type DetailStatus = "loading" | "ready" | "error";

function snapshotToRsvp(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): SessionRsvp {
  return {
    userId: snapshot.id,
    ...snapshot.data(),
  } as SessionRsvp;
}

export function useSessionDetail(sessionId: string, enabled: boolean) {
  const [session, setSession] = useState<Session | null>(null);
  const [rsvps, setRsvps] = useState<SessionRsvp[]>([]);
  const [sessionStatus, setSessionStatus] =
    useState<DetailStatus>("loading");
  const [rsvpStatus, setRsvpStatus] = useState<DetailStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    let isActive = true;

    const sessionRef = doc(firestoreDb, "sessions", sessionId);

    const rsvpsQuery = query(
      collection(firestoreDb, "sessions", sessionId, "rsvps"),
      orderBy("userName", "asc"),
    );

    const unsubscribeSession = onSnapshot(
      sessionRef,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setSession(
          snapshot.exists()
            ? ({
                id: snapshot.id,
                ...snapshot.data(),
              } as Session)
            : null,
        );

        setError(null);
        setSessionStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error("Nepodařilo se načíst session:", snapshotError);

        setError("Detail session se nepodařilo načíst.");
        setSessionStatus("error");
      },
    );

    const unsubscribeRsvps = onSnapshot(
      rsvpsQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setRsvps(snapshot.docs.map(snapshotToRsvp));
        setError(null);
        setRsvpStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error("Nepodařilo se načíst RSVP:", snapshotError);

        setError("RSVP stavy se nepodařilo načíst.");
        setRsvpStatus("error");
      },
    );

    return () => {
      isActive = false;
      unsubscribeSession();
      unsubscribeRsvps();
    };
  }, [enabled, sessionId]);

  const isLoading = useMemo(
    () =>
      enabled &&
      (sessionStatus === "loading" || rsvpStatus === "loading"),
    [enabled, rsvpStatus, sessionStatus],
  );

  return {
    session: enabled ? session : null,
    rsvps: enabled ? rsvps : [],
    isLoading,
    error: enabled ? error : null,
  };
}