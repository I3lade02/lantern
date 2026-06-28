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
import type { Game } from "@/types/game";

type GamesStatus = "loading" | "ready" | "error";

function snapshotToGame(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Game {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Game;
}

export function useGames(enabled: boolean) {
  const [games, setGames] = useState<Game[]>([]);
  const [status, setStatus] = useState<GamesStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    const gamesQuery = query(
      collection(firestoreDb, "games"),
      orderBy("title", "asc"),
    );

    const unsubscribe = onSnapshot(
      gamesQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setGames(snapshot.docs.map(snapshotToGame));
        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error(
          "Nepodařilo se načíst herní knihovnu:",
          snapshotError,
        );

        setGames([]);
        setError("Herní knihovnu se nepodařilo načíst.");
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
    games: enabled ? games : [],
    isLoading,
    error: enabled ? error : null,
  };
}