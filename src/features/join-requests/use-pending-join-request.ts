"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { JoinRequest } from "@/types/join-request";

type JoinRequestsStatus = "loading" | "ready" | "error";

function snapshotToJoinRequest(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): JoinRequest {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as JoinRequest;
}

export function usePendingJoinRequests(enabled: boolean) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [status, setStatus] =
    useState<JoinRequestsStatus>("loading");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    const requestsQuery = query(
      collection(firestoreDb, "joinRequests"),
      where("status", "==", "pending"),
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        const pendingRequests = snapshot.docs
          .map(snapshotToJoinRequest)
          .sort((firstRequest, secondRequest) => {
            const firstTime =
              firstRequest.requestedAt?.toMillis() ??
              Number.MAX_SAFE_INTEGER;

            const secondTime =
              secondRequest.requestedAt?.toMillis() ??
              Number.MAX_SAFE_INTEGER;

            return firstTime - secondTime;
          });

        setRequests(pendingRequests);
        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error(
          "Nepodařilo se načíst žádosti o připojení:",
          snapshotError,
        );

        setRequests([]);
        setError("Žádosti o připojení se nepodařilo načíst.");
        setStatus("error");
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [enabled]);

  return {
    requests: enabled ? requests : [],
    isLoading: enabled && status === "loading",
    error: enabled ? error : null,
  };
}