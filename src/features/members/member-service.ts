"use client";

import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type {
  AvatarColor,
  UserProfile,
  UserRole,
} from "@/types/user";

const avatarColors: AvatarColor[] = [
  "amber",
  "moss",
  "wine",
  "cream",
];

function getDefaultAvatarColor(userId: string): AvatarColor {
  let hash = 0;

  for (const character of userId) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }

  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitialDisplayName(user: User): string {
  const profileName = user.displayName?.trim();

  if (profileName && Array.from(profileName).length >= 2) {
    return profileName.slice(0, 24);
  }

  const emailName = user.email?.split("@")[0]?.trim();

  if (emailName && Array.from(emailName).length >= 2) {
    return emailName.slice(0, 24);
  }

  return "Člen party";
}

export async function ensureUserProfile(user: User): Promise<void> {
  const profileRef = doc(firestoreDb, "users", user.uid);
  const existingProfile = await getDoc(profileRef);

  if (existingProfile.exists()) {
    return;
  }

  await setDoc(profileRef, {
    id: user.uid,
    displayName: getInitialDisplayName(user),
    email: user.email ?? "",
    avatarColor: getDefaultAvatarColor(user.uid),
    role: "member",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToUserProfile(
  userId: string,
  onProfileChange: (profile: UserProfile | null) => void,
  onProfileError: (error: Error) => void,
): Unsubscribe {
  const profileRef = doc(firestoreDb, "users", userId);

  return onSnapshot(
    profileRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onProfileChange(null);
        return;
      }

      onProfileChange({
        id: snapshot.id,
        ...snapshot.data(),
      } as UserProfile);
    },
    (error) => {
      onProfileError(error);
    },
  );
}

type UpdateOwnProfileInput = {
  displayName: string;
  avatarColor: AvatarColor;
};

export async function updateOwnMemberProfile(
  userId: string,
  input: UpdateOwnProfileInput,
): Promise<void> {
  await updateDoc(doc(firestoreDb, "users", userId), {
    displayName: input.displayName.trim(),
    avatarColor: input.avatarColor,
    updatedAt: serverTimestamp(),
  });
}

export async function updateMemberRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  await updateDoc(doc(firestoreDb, "users", userId), {
    role,
    updatedAt: serverTimestamp(),
  });
}

export function validateDisplayName(value: string): string | null {
  const trimmedValue = value.trim();
  const characterCount = Array.from(trimmedValue).length;

  if (characterCount < 2) {
    return "Jméno musí mít alespoň 2 znaky.";
  }

  if (characterCount > 24) {
    return "Jméno může mít maximálně 24 znaků.";
  }

  return null;
}

export function getMemberErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Změnu profilu se nepodařilo uložit.";
  }

  if (error.message.toLowerCase().includes("permission")) {
    return "Nemáš oprávnění provést tuto změnu.";
  }

  return "Změnu profilu se nepodařilo uložit. Zkus to znovu.";
}