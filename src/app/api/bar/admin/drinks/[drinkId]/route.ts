import { NextResponse } from "next/server";
import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  BarServerRequestError,
  parseAvailability,
  parseDocumentId,
  parseDrinkCategory,
  parsePriceCents,
  parseRequiredText,
  parseStoredDrink,
} from "@/lib/bar-server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  PollAuthorizationError,
  requirePollAdmin,
} from "@/lib/require-approved-user";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    drinkId: string;
  }>;
};

type UpdateDrinkBody = {
  name?: unknown;
  priceCents?: unknown;
  category?: unknown;
  isAvailable?: unknown;
};

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
    "Úprava nápoje selhala:",
    error,
  );

  return NextResponse.json(
    {
      error: "Nápoj se nepodařilo upravit.",
    },
    { status: 500 },
  );
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    await requirePollAdmin(request);

    const { drinkId: rawDrinkId } =
      await context.params;

    const drinkId = parseDocumentId(
      rawDrinkId,
      "ID nápoje",
    );

    const body =
      (await request.json()) as UpdateDrinkBody;

    const hasAnyChange =
      body.name !== undefined ||
      body.priceCents !== undefined ||
      body.category !== undefined ||
      body.isAvailable !== undefined;

    if (!hasAnyChange) {
      throw new BarServerRequestError(
        "Neobsahuješ žádnou změnu nápoje.",
      );
    }

    const firebaseAdminDb = getFirebaseAdminDb();

    const drinkRef = firebaseAdminDb
      .collection("drinks")
      .doc(drinkId);

    const drinkSnapshot = await drinkRef.get();

    if (!drinkSnapshot.exists) {
      throw new BarServerRequestError(
        "Nápoj nebyl nalezen.",
        404,
      );
    }

    const currentDrink = parseStoredDrink(
      drinkId,
      drinkSnapshot.data() as Record<string, unknown>,
    );

    const name =
      body.name === undefined
        ? currentDrink.name
        : parseRequiredText(
            body.name,
            "Název nápoje",
            2,
            100,
          );

    const priceCents =
      body.priceCents === undefined
        ? currentDrink.priceCents
        : parsePriceCents(body.priceCents);

    const category =
      body.category === undefined
        ? currentDrink.category
        : parseDrinkCategory(body.category);

    const isAvailable =
      body.isAvailable === undefined
        ? currentDrink.isAvailable
        : parseAvailability(body.isAvailable);

    await drinkRef.update({
      name,
      priceCents,
      category,
      isAvailable,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      drink: {
        id: drinkId,
        name,
        priceCents,
        category,
        qrToken: currentDrink.qrToken,
        isAvailable,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}