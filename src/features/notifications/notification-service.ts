"use client";

import {
    doc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";

export async function markAllNotificationsAsRead(
    userId: string,
): Promise<void> {
    await setDoc(
        doc(
            firestoreDb,
            "users",
            userId,
            "notificationState",
            "main",
        ),
        {
            id: "main",
            lastSeenAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        {
            merge: true,
        },
    );
}