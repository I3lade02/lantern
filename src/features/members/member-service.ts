"use client";

import type { User } from "firebase/auth";
import {
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    type Unsubscribe,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import { getAvatarColorFromUid } from "@/lib/avatar-color";
import type { UserProfile } from "@/types/user";

function getFallbackDisplayName(user: User): string {
    const emailName = user.email?.split("@")[0];

    return user.displayName?.trim() || emailName || "Člen party";
}

export async function ensureUserProfile(user: User): Promise<void> {
    if (!user.email) {
        throw new Error("Firebase účet nemá dostupnou emailovou adresu");
    }

    const profileRef = doc(firestoreDb, "users", user.uid);
    const profileSnapshot = await getDoc(profileRef);

    if (profileSnapshot.exists()) {
        return;
    }

    await setDoc(profileRef, {
        id: user.uid,
        displayName: getFallbackDisplayName(user),
        email: user.email,
        avatarColor: getAvatarColorFromUid(user.uid),
        role: "member",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export function subscribeToUserProfile(
    userId: string,
    onProfileChange: (profile: UserProfile | null) => void,
    onError: (error: Error) => void,
): Unsubscribe {
    const profileRef = doc(firestoreDb, "users", userId);

    return onSnapshot(
        profileRef,
        (profileSnapshot) => {
            if (!profileSnapshot.exists()) {
                onProfileChange(null);
                return;
            }

            onProfileChange(profileSnapshot.data() as UserProfile);
        },
        onError,
    );
}