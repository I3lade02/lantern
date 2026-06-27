"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { ActivityLogEntry } from "@/types/activity";
import type { Debt } from "@/types/debt";
import type { AppSettings } from "@/types/settings";
import type { Session } from "@/types/session";

type DashboardResource = "sessions" | "debts" | "activities" | "settings";

type ResourceState = Record<DashboardResource, boolean>;

const initialResourceState: ResourceState = {
  sessions: false,
  debts: false,
  activities: false,
  settings: false,
};

function snapshotToEntity<T>(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): T {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as T;
}

export function useDashboardData(enabled: boolean) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [resourceState, setResourceState] =
    useState<ResourceState>(initialResourceState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    function markResourceReady(resource: DashboardResource) {
      if (!isActive) {
        return;
      }

      setResourceState((currentState) => ({
        ...currentState,
        [resource]: true,
      }));
    }

    function handleSnapshotError(
      resource: DashboardResource,
      snapshotError: Error,
    ) {
      if (!isActive) {
        return;
      }

      console.error(`Dashboard listener error (${resource}):`, snapshotError);

      setError(
        "Některá data dashboardu se nepodařilo načíst. Zkontroluj Firestore Rules a zkus stránku obnovit.",
      );

      markResourceReady(resource);
    }

    const sessionsQuery = query(
      collection(firestoreDb, "sessions"),
      orderBy("startAt", "asc"),
      limit(30),
    );

    const debtsQuery = query(
      collection(firestoreDb, "debts"),
      orderBy("createdAt", "desc"),
      limit(100),
    );

    const activitiesQuery = query(
      collection(firestoreDb, "activityLog"),
      orderBy("createdAt", "desc"),
      limit(6),
    );

    const unsubscribeSessions = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setError(null);
        setSessions(
          snapshot.docs.map((item) => snapshotToEntity<Session>(item)),
        );
        markResourceReady("sessions");
      },
      (snapshotError) => handleSnapshotError("sessions", snapshotError),
    );

    const unsubscribeDebts = onSnapshot(
      debtsQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setError(null);
        setDebts(snapshot.docs.map((item) => snapshotToEntity<Debt>(item)));
        markResourceReady("debts");
      },
      (snapshotError) => handleSnapshotError("debts", snapshotError),
    );

    const unsubscribeActivities = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setError(null);
        setActivities(
          snapshot.docs.map((item) => snapshotToEntity<ActivityLogEntry>(item)),
        );
        markResourceReady("activities");
      },
      (snapshotError) => handleSnapshotError("activities", snapshotError),
    );

    const unsubscribeSettings = onSnapshot(
      doc(firestoreDb, "appSettings", "main"),
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setError(null);

        setSettings(
          snapshot.exists()
            ? ({
                id: snapshot.id,
                ...snapshot.data(),
              } as AppSettings)
            : null,
        );

        markResourceReady("settings");
      },
      (snapshotError) => handleSnapshotError("settings", snapshotError),
    );

    return () => {
      isActive = false;

      unsubscribeSessions();
      unsubscribeDebts();
      unsubscribeActivities();
      unsubscribeSettings();
    };
  }, [enabled]);

  const isLoading = useMemo(() => {
    if (!enabled) {
      return false;
    }

    return Object.values(resourceState).some((isReady) => !isReady);
  }, [enabled, resourceState]);

  return {
    sessions: enabled ? sessions : [],
    debts: enabled ? debts : [],
    activities: enabled ? activities : [],
    settings: enabled ? settings : null,
    isLoading,
    error: enabled ? error : null,
  };
}