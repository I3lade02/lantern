"use client";

import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { firebaseAuth } from "@/firebase/auth";
import { createPendingJoinRequest } from "@/features/auth/join-request-service";

type RegisterWithEmailInput = {
  displayName: string;
  email: string;
  password: string;
};

type SignInWithEmailInput = {
  email: string;
  password: string;
};

export type RegisterWithEmailResult = {
  user: User;
  verificationEmailSent: boolean;
};

export async function registerWithEmail({
  displayName,
  email,
  password,
}: RegisterWithEmailInput): Promise<RegisterWithEmailResult> {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email.trim(),
    password,
  );

  const normalizedDisplayName = displayName.trim();

  await updateProfile(credential.user, {
    displayName: normalizedDisplayName,
  });

  try {
    await createPendingJoinRequest(credential.user);
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch {
      // Původní chyba žádosti je důležitější než případný neúspěšný cleanup.
    }

    throw error;
  }

  let verificationEmailSent = false;

  try {
    firebaseAuth.languageCode = "cs";

    await sendEmailVerification(credential.user);

    verificationEmailSent = true;
  } catch (error) {
    console.warn(
      "Žádost vznikla, ale ověřovací e-mail se nepodařilo odeslat:",
      error,
    );
  }

  return {
    user: credential.user,
    verificationEmailSent,
  };
}

export async function resendVerificationEmail(): Promise<void> {
  const user = firebaseAuth.currentUser;

  if (!user) {
    throw new Error("Není přihlášen žádný uživatel.");
  }

  if (user.emailVerified) {
    return;
  }

  firebaseAuth.languageCode = "cs";

  await sendEmailVerification(user);
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