import { NextResponse } from "next/server";

import {
  BarServerRequestError,
  parseRequiredText,
  parseStoredDrink,
} from "@/lib/bar-server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  PollAuthorizationError,
  requirePollAdmin,
} from "@/lib/require-approved-user";
import type {
  BarAdminConfig,
  BarAdminOverview,
} from "@/types/bar";

export const runtime = "nodejs";

function parseBarConfig(
  data: Record<string, unknown>,
): BarAdminConfig {
  return {
    id: "main",
    payerId: parseRequiredText(
      data.payerId,
      "ID provozovatele",
      1,
      128,
    ),
    payerName: parseRequiredText(
      data.payerName,
      "Jméno provozovatele",
      2,
      24,
    ),
    updatedById: parseRequiredText(
      data.updatedById,
      "ID admina",
      1,
      128,
    ),
  };
}

function createErrorResponse(error: unknown) {
  if (error instanceof PollAuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof BarServerRequestError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error(
    "Načtení správy taverního baru selhalo:",
    error,
  );

  return NextResponse.json(
    {
      error: "Taverní bar se nepodařilo načíst.",
    },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    await requirePollAdmin(request);

    const firebaseAdminDb = getFirebaseAdminDb();

    const [
      configSnapshot,
      drinksSnapshot,
    ] = await Promise.all([
      firebaseAdminDb
        .collection("barConfig")
        .doc("main")
        .get(),

      firebaseAdminDb
        .collection("drinks")
        .orderBy("name", "asc")
        .get(),
    ]);

    const overview: BarAdminOverview = {
      config: configSnapshot.exists
        ? parseBarConfig(
            configSnapshot.data() as Record<string, unknown>,
          )
        : null,

      drinks: drinksSnapshot.docs.map((snapshot) =>
        parseStoredDrink(
          snapshot.id,
          snapshot.data() as Record<string, unknown>,
        ),
      ),
    };

    return NextResponse.json(overview);
  } catch (error) {
    return createErrorResponse(error);
  }
}