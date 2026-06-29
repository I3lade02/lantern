"use client";

import type { User } from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { JoinRequest } from "@/types/join-request";

function getRequestDisplayName(user: User): string {
  const displayName = user.displayName?.trim();

  if (displayName && Array.from(displayName).length >= 2) {
    return displayName.slice(0, 24);
  }

  const emailName = user.email?.split("@")[0]?.trim();

  if (emailName && Array.from(emailName).length >= 2) {
    return emailName.slice(0, 24);
  }

  return "Člen party";
}

export async function createPendingJoinRequest(
  user: User,
): Promise<void> {
  const email = user.email?.trim();

  if (!email) {
    throw new Error("Pro žádost o připojení chybí e-mail účtu.");
  }

  const requestRef = doc(firestoreDb, "joinRequests", user.uid);

  await setDoc(requestRef, {
    id: user.uid,
    email,
    displayName: getRequestDisplayName(user),

    status: "pending",

    requestedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    reviewedAt: null,
    reviewedById: null,
    reviewedByName: null,
  });
}

export function subscribeToOwnJoinRequest(
  userId: string,
  onRequestChange: (request: JoinRequest | null) => void,
  onRequestError: (error: Error) => void,
): Unsubscribe {
  const requestRef = doc(firestoreDb, "joinRequests", userId);

  return onSnapshot(
    requestRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onRequestChange(null);
        return;
      }

      onRequestChange({
        id: snapshot.id,
        ...snapshot.data(),
      } as JoinRequest);
    },
    (error) => {
      onRequestError(error);
    },
  );
}