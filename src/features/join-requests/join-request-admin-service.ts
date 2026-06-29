"use client";

import { firebaseAuth } from "@/firebase/auth";

export type JoinRequestAdminAction =
  | "approve"
  | "reject";

type ResolveJoinRequestInput = {
  requestId: string;
  action: JoinRequestAdminAction;
};

type ApiErrorPayload = {
  error: string;
};

function isApiErrorPayload(
  payload: unknown,
): payload is ApiErrorPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as ApiErrorPayload).error === "string"
  );
}

function getResponseErrorMessage(
  payload: unknown,
  fallbackMessage: string,
): string {
  if (isApiErrorPayload(payload)) {
    return payload.error;
  }

  return fallbackMessage;
}

export async function resolveJoinRequest({
  requestId,
  action,
}: ResolveJoinRequestInput): Promise<void> {
  const currentUser = firebaseAuth.currentUser;

  if (!currentUser) {
    throw new Error("Admin není přihlášený.");
  }

  const idToken = await currentUser.getIdToken();

  const response = await fetch(
    `/api/admin/join-requests/${encodeURIComponent(requestId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
      }),
    },
  );

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getResponseErrorMessage(
        payload,
        "Žádost se nepodařilo zpracovat.",
      ),
    );
  }
}

export function getJoinRequestAdminErrorMessage(
  error: unknown,
): string {
  if (!(error instanceof Error)) {
    return "Žádost se nepodařilo zpracovat.";
  }

  if (
    error.message.toLowerCase().includes("ověřit svůj e-mail")
  ) {
    return "Žadatel ještě neověřil svůj e-mail. Nejdřív musí otevřít ověřovací odkaz.";
  }

  return error.message;
}