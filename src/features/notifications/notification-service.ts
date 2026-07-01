import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";

function getNotificationStateRef(userId: string) {
  return doc(
    firestoreDb,
    "users",
    userId,
    "notificationState",
    "main",
  );
}

export async function markAllNotificationsAsRead(
  userId: string,
): Promise<void> {
  await setDoc(
    getNotificationStateRef(userId),
    {
      id: "main",

      lastSeenAt: serverTimestamp(),
      lastSeenChatAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

export async function markChatAsRead(
  userId: string,
): Promise<void> {
  await setDoc(
    getNotificationStateRef(userId),
    {
      id: "main",

      lastSeenChatAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}