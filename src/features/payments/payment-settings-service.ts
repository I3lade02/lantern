"use client";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { AppSettings } from "@/types/settings";

type SavePaymentSettingsInput = {
  currentSettings: AppSettings | null;

  recipientAccount: string;
  recipientName: string;
  defaultMessage: string | null;
  defaultVariableSymbol: string | null;
};

export async function savePaymentSettings({
  currentSettings,
  recipientAccount,
  recipientName,
  defaultMessage,
  defaultVariableSymbol,
}: SavePaymentSettingsInput): Promise<void> {
  await setDoc(
    doc(firestoreDb, "appSettings", "main"),
    {
      id: "main",

      partyNotice: currentSettings?.partyNotice ?? null,

      paymentRecipientAccount: recipientAccount,
      paymentRecipientName: recipientName,
      defaultPaymentMessage: defaultMessage,
      defaultPaymentVariableSymbol: defaultVariableSymbol,

      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}