"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { AppSettings } from "@/types/settings";

type AppSettingsStatus = "loading" | "ready" | "error";

export function useAppSettings(enabled: boolean) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] =
    useState<AppSettingsStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    const unsubscribe = onSnapshot(
      doc(firestoreDb, "appSettings", "main"),
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setSettings(
          snapshot.exists()
            ? ({
                id: snapshot.id,
                ...snapshot.data(),
              } as AppSettings)
            : null,
        );

        setError(null);
        setStatus("ready");
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error(
          "Nepodařilo se načíst nastavení QR plateb:",
          snapshotError,
        );

        setSettings(null);
        setError("Nastavení QR plateb se nepodařilo načíst.");
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
    settings: enabled ? settings : null,
    isLoading,
    error: enabled ? error : null,
  };
}