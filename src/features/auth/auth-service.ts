"use client";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    type User,
} from "firebase/auth";
import { firebaseAuth } from "@/firebase/auth";

type RegisterWithEmailInput = {
    displayName: string;
    email: string;
    password: string;
};

type SignInWithEmailInput = {
    email: string;
    password: string;
};

export async function registerWithEmail({
    displayName,
    email,
    password,
}: RegisterWithEmailInput): Promise<User> {
    const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
    );

    await updateProfile(credential.user, {
        displayName: displayName.trim(),
    });

    return credential.user;
}

export async function signInWithEmail({
    email,
    password,
}: SignInWithEmailInput): Promise<User> {
    const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
    );

    return credential.user;
}

export async function signOutUser(): Promise<void> {
    await signOut(firebaseAuth);
}