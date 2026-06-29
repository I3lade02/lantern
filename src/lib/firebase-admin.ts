import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getRequiredServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Chybí serverová environment variable ${name}.`,
    );
  }

  return value;
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const projectId = getRequiredServerEnv(
    "FIREBASE_ADMIN_PROJECT_ID",
  );

  const clientEmail = getRequiredServerEnv(
    "FIREBASE_ADMIN_CLIENT_EMAIL",
  );

  const privateKey = getRequiredServerEnv(
    "FIREBASE_ADMIN_PRIVATE_KEY",
  ).replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}