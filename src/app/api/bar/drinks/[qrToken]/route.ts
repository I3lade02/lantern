import { NextResponse } from "next/server";

import {
  BarServerRequestError,
  parseRequiredText,
  parseStoredDrink,
} from "@/lib/bar-server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  PollAuthorizationError,
  requireApprovedPartyUser,
} from "@/lib/require-approved-user";
import type { BarScanDrink } from "@/types/bar";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    qrToken: string;
  }>;
};

function parseQrToken(value: unknown): string {
  const qrToken = parseRequiredText(
    value,
    "QR token",
    16,
    128,
  );

  if (!/^[a-zA-Z0-9_-]+$/.test(qrToken)) {
    throw new BarServerRequestError(
      "QR token má neplatný formát.",
    );
  }

  return qrToken;
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
    "Načtení QR nápoje selhalo:",
    error,
  );

  return NextResponse.json(
    {
      error:
        "Nápoj z QR kódu se nepodařilo načíst.",
    },
    { status: 500 },
  );
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    await requireApprovedPartyUser(request);

    const { qrToken: rawQrToken } =
      await context.params;

    const qrToken = parseQrToken(rawQrToken);

    const firebaseAdminDb = getFirebaseAdminDb();

    const [
      drinkQuerySnapshot,
      barConfigSnapshot,
    ] = await Promise.all([
      firebaseAdminDb
        .collection("drinks")
        .where("qrToken", "==", qrToken)
        .limit(1)
        .get(),

      firebaseAdminDb
        .collection("barConfig")
        .doc("main")
        .get(),
    ]);

    if (drinkQuerySnapshot.empty) {
      throw new BarServerRequestError(
        "Tento QR kód nepatří žádnému nápoji v LANternu.",
        404,
      );
    }

    if (!barConfigSnapshot.exists) {
      throw new BarServerRequestError(
        "Provozovatel baru zatím není nastavený.",
        409,
      );
    }

    const drinkSnapshot = drinkQuerySnapshot.docs[0]!;

    const drink = parseStoredDrink(
      drinkSnapshot.id,
      drinkSnapshot.data() as Record<string, unknown>,
    );

    if (!drink.isAvailable) {
      throw new BarServerRequestError(
        "Tento nápoj je momentálně nedostupný.",
        409,
      );
    }

    const barConfig =
      barConfigSnapshot.data() as Record<
        string,
        unknown
      >;

    const operatorName = parseRequiredText(
      barConfig.payerName,
      "Jméno provozovatele baru",
      2,
      24,
    );

    const response: BarScanDrink = {
      id: drink.id,
      name: drink.name,
      priceCents: drink.priceCents,
      category: drink.category,
      operatorName,
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}