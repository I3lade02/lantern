"use client";

import type { User } from "firebase/auth";

import type {
  BarAdminConfig,
  BarAdminDrink,
  BarAdminOverview,
  BarDrinkInput,
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

export async function getBarAdminOverview(
  user: User,
): Promise<BarAdminOverview> {
  return authorizedFetch<BarAdminOverview>(
    user,
    "/api/bar/admin",
  );
}

export async function saveBarOperator(
  user: User,
  payerId: string,
): Promise<BarAdminConfig> {
  const response = await authorizedFetch<{
    config: BarAdminConfig;
  }>(
    user,
    "/api/bar/admin/config",
    {
      method: "PUT",
      body: JSON.stringify({
        payerId,
      }),
    },
  );

  return response.config;
}

export async function createBarDrink(
  user: User,
  input: BarDrinkInput,
): Promise<BarAdminDrink> {
  const response = await authorizedFetch<{
    drink: BarAdminDrink;
  }>(
    user,
    "/api/bar/admin/drinks",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.drink;
}

export async function updateBarDrink(
  user: User,
  drinkId: string,
  input: BarDrinkInput,
): Promise<BarAdminDrink> {
  const response = await authorizedFetch<{
    drink: BarAdminDrink;
  }>(
    user,
    `/api/bar/admin/drinks/${drinkId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return response.drink;
}