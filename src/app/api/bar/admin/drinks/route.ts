import { NextResponse } from "next/server";
import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  BarServerRequestError,
  createQrToken,
  parseAvailability,
  parseDrinkImageUrl,
  parseDrinkCategory,
  parsePriceCents,
  parseRequiredText,
} from "@/lib/bar-server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  PollAuthorizationError,
  requirePollAdmin,
} from "@/lib/require-approved-user";

export const runtime = "nodejs";

type CreateDrinkBody = {
  name?: unknown;
  priceCents?: unknown;
  category?: unknown;
  imageUrl?: unknown;
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
    "Vytvoření nápoje selhalo:",
    error,
  );

  return NextResponse.json(
    {
      error: "Nápoj se nepodařilo vytvořit.",
    },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  try {
    await requirePollAdmin(request);

    const body =
      (await request.json()) as CreateDrinkBody;

    const name = parseRequiredText(
      body.name,
      "Název nápoje",
      2,
      100,
    );

    const priceCents = parsePriceCents(
      body.priceCents,
    );

    const category = parseDrinkCategory(
      body.category,
    );

    const imageUrl = parseDrinkImageUrl(
      body.imageUrl,
    );

    const isAvailable = parseAvailability(
      body.isAvailable,
    );

    const firebaseAdminDb = getFirebaseAdminDb();

    const drinkRef = firebaseAdminDb
      .collection("drinks")
      .doc();

    const qrToken = createQrToken();

    await drinkRef.set({
      id: drinkRef.id,

      name,
      priceCents,
      category,
      imageUrl,

      qrToken,
      isAvailable,

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        drink: {
          id: drinkRef.id,
          name,
          priceCents,
          category,
          imageUrl,
          qrToken,
          isAvailable,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
