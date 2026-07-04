"use client";

import type { User } from "firebase/auth";

import type {
  BarClaimResponse,
  BarScanDrink,
} from "@/types/bar";

async function readApiResponse<T>(
  response: Response,
): Promise<T> {
  const responseText = await response.text();

  let payload: unknown = null;

  try {
    payload = responseText
      ? JSON.parse(responseText)
      : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const apiError =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : `Chyba serveru ${response.status}.`;

    throw new Error(apiError);
  }

  return payload as T;
}

async function authorizedFetch<T>(
  user: User,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await user.getIdToken();

  const headers = new Headers(init.headers);

  headers.set(
    "Authorization",
    `Bearer ${token}`,
  );

  if (init.body) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });

  return readApiResponse<T>(response);
}

export async function getBarDrinkForQrToken(
  user: User,
  qrToken: string,
): Promise<BarScanDrink> {
  return authorizedFetch<BarScanDrink>(
    user,
    `/api/bar/drinks/${encodeURIComponent(qrToken)}`,
  );
}

export async function claimBarDrink(
  user: User,
  qrToken: string,
  sessionId: string,
): Promise<BarClaimResponse> {
  return authorizedFetch<BarClaimResponse>(
    user,
    "/api/bar/claim",
    {
      method: "POST",
      body: JSON.stringify({
        qrToken,
        sessionId,
      }),
    },
  );
}