"use client";

import { useEffect, useState } from "react";
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
import type {
  InAppNotification,
  NotificationIconKind,
  NotificationState,
} from "@/types/notification";

type NotificationsStatus = "loading" | "ready" | "error";

function snapshotToActivity(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): ActivityLogEntry {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as ActivityLogEntry;
}

function getNotificationPresentation(activity: ActivityLogEntry): {
  title: string;
  href: string;
  iconKind: NotificationIconKind;
} {
  switch (activity.type) {
    case "session_created":
      return {
        title: "Nová session",
        href: activity.sessionId
          ? `/sessions/${activity.sessionId}`
          : "/sessions",
        iconKind: "session",
      };

    case "session_updated":
      return {
        title: "Session upravena",
        href: activity.sessionId
          ? `/sessions/${activity.sessionId}`
          : "/sessions",
        iconKind: "session",
      };

    case "session_rsvp":
      return {
        title: "Změna účasti",
        href: activity.sessionId
          ? `/sessions/${activity.sessionId}`
          : "/sessions",
        iconKind: "session",
      };

    case "expense_created":
      return {
        title: "Nová útrata",
        href: activity.sessionId
          ? `/sessions/${activity.sessionId}`
          : "/expenses",
        iconKind: "expense",
      };

    case "expense_updated":
      return {
        title: "Útrata upravena",
        href: activity.sessionId
          ? `/sessions/${activity.sessionId}`
          : "/expenses",
        iconKind: "expense",
      };

    case "debts_calculated":
      return {
        title: "Vyrovnání spočítáno",
        href: "/debts",
        iconKind: "debt",
      };

    case "payment_submitted":
      return {
        title: "Platba čeká na potvrzení",
        href: "/debts",
        iconKind: "payment",
      };

    case "debt_paid":
    case "debt_resolved":
      return {
        title: "Dluh byl uzavřen",
        href: "/debts",
        iconKind: "debt",
      };

    case "game_added":
      return {
        title: "Herní knihovna se změnila",
        href: activity.sessionId
          ? `/sessions/${activity.sessionId}`
          : "/games",
        iconKind: "game",
      };

    case "dice_rolled":
      return {
        title: "Nový hod kostkou",
        href: "/dice",
        iconKind: "dice",
      };

    case "member_joined":
      return {
        title: "Nový člen party",
        href: "/members",
        iconKind: "member",
      };

    case "other":
    default:
      return {
        title: "Novinka v LANternu",
        href: "/dashboard",
        iconKind: "other",
      };
  }
}

export function useNotifications(
  userId: string | null,
  enabled: boolean,
) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [notificationState, setNotificationState] =
    useState<NotificationState | null>(null);

  const [activitiesLoadedForUserId, setActivitiesLoadedForUserId] =
    useState<string | null>(null);

  const [stateLoadedForUserId, setStateLoadedForUserId] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    let isActive = true;

    const activitiesQuery = query(
      collection(firestoreDb, "activityLog"),
      orderBy("createdAt", "desc"),
      limit(40),
    );

    const unsubscribeActivities = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setActivities(snapshot.docs.map(snapshotToActivity));
        setActivitiesLoadedForUserId(userId);
        setError(null);
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error(
          "Nepodařilo se načíst notifikace LANternu:",
          snapshotError,
        );

        setActivities([]);
        setActivitiesLoadedForUserId(userId);
        setError("Notifikace se nepodařilo načíst.");
      },
    );

    const notificationStateRef = doc(
      firestoreDb,
      "users",
      userId,
      "notificationState",
      "main",
    );

    const unsubscribeState = onSnapshot(
      notificationStateRef,
      (snapshot) => {
        if (!isActive) {
          return;
        }

        setNotificationState(
          snapshot.exists()
            ? ({
                id: "main",
                ...snapshot.data(),
              } as NotificationState)
            : null,
        );

        setStateLoadedForUserId(userId);
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error(
          "Nepodařilo se načíst stav notifikací:",
          snapshotError,
        );

        setNotificationState(null);
        setStateLoadedForUserId(userId);
        setError("Stav notifikací se nepodařilo načíst.");
      },
    );

    return () => {
      isActive = false;

      unsubscribeActivities();
      unsubscribeState();
    };
  }, [enabled, userId]);

  const isLoadedForCurrentUser =
    activitiesLoadedForUserId === userId &&
    stateLoadedForUserId === userId;

  const lastSeenAtMilliseconds =
    notificationState?.lastSeenAt?.toMillis() ?? null;

  const notifications: InAppNotification[] = activities
    .filter((activity) => activity.actorId !== userId)
    .map((activity) => {
      const presentation = getNotificationPresentation(activity);

      const activityMilliseconds = activity.createdAt?.toMillis() ?? 0;

      return {
        id: activity.id,
        title: presentation.title,
        message: activity.message,
        href: presentation.href,
        iconKind: presentation.iconKind,
        actorId: activity.actorId,
        actorName: activity.actorName,
        sessionId: activity.sessionId,
        createdAt: activity.createdAt,
        isUnread:
          lastSeenAtMilliseconds !== null &&
          activityMilliseconds > lastSeenAtMilliseconds,
      };
    });

  const unreadCount = notifications.filter(
    (notification) => notification.isUnread,
  ).length;

  const status: NotificationsStatus =
    error
      ? "error"
      : isLoadedForCurrentUser
        ? "ready"
        : "loading";

  return {
    notifications:
      enabled && isLoadedForCurrentUser ? notifications : [],
    unreadCount:
      enabled && isLoadedForCurrentUser ? unreadCount : 0,
    isLoading: enabled && status === "loading",
    error: enabled && isLoadedForCurrentUser ? error : null,
  };
}