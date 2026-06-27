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
import type { UserProfile } from "@/types/user";

type MembersStatus = "loading" | "ready" | "error";

function snapshotToMember(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): UserProfile {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as UserProfile;
}

export function useMembers(enabled: boolean) {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [status, setStatus] = useState<MembersStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    const membersQuery = query(
      collection(firestoreDb, "users"),
      orderBy("displayName", "asc"),
    );

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setMembers(snapshot.docs.map(snapshotToMember));
        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error("Nepodařilo se načíst členy party:", snapshotError);

        setMembers([]);
        setError("Seznam členů se nepodařilo načíst.");
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
    members: enabled ? members : [],
    isLoading,
    error: enabled ? error : null,
  };
}