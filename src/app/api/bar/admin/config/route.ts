import { NextResponse } from "next/server";
import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  BarServerRequestError,
  parseDocumentId,
  parseRequiredText,
} from "@/lib/bar-server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  PollAuthorizationError,
  requirePollAdmin,
} from "@/lib/require-approved-user";

export const runtime = "nodejs";

type UpdateBarConfigBody = {
  payerId?: unknown;
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
    "Uložení provozovatele baru selhalo:",
    error,
  );

  return NextResponse.json(
    {
      error:
        "Provozovatele baru se nepodařilo uložit.",
    },
    { status: 500 },
  );
}

export async function PUT(request: Request) {
  try {
    const admin = await requirePollAdmin(request);

    const body =
      (await request.json()) as UpdateBarConfigBody;

    const payerId = parseDocumentId(
      body.payerId,
      "Provozovatel",
    );

    const firebaseAdminDb = getFirebaseAdminDb();

    const payerProfileSnapshot =
      await firebaseAdminDb
        .collection("users")
        .doc(payerId)
        .get();

    if (!payerProfileSnapshot.exists) {
      throw new BarServerRequestError(
        "Vybraný provozovatel nebyl nalezen.",
        404,
      );
    }

    const payerProfile =
      payerProfileSnapshot.data() ?? {};

    const payerName = parseRequiredText(
      payerProfile.displayName,
      "Jméno provozovatele",
      2,
      24,
    );

    const payerEmail = parseRequiredText(
      payerProfile.email,
      "E-mail provozovatele",
      3,
      160,
    );

    const payerRole = payerProfile.role;

    if (
      payerRole !== "admin" &&
      payerRole !== "member"
    ) {
      throw new BarServerRequestError(
        "Vybraný účet nemá platnou roli v LANternu.",
        409,
      );
    }

    const allowlistSnapshot =
      await firebaseAdminDb
        .collection("accessAllowlist")
        .doc(payerEmail)
        .get();

    if (!allowlistSnapshot.exists) {
      throw new BarServerRequestError(
        "Vybraný provozovatel nemá schválený přístup do LANternu.",
        409,
      );
    }

    await firebaseAdminDb
      .collection("barConfig")
      .doc("main")
      .set(
        {
          id: "main",

          payerId,
          payerName,

          updatedAt: FieldValue.serverTimestamp(),
          updatedById: admin.id,
        },
        {
          merge: true,
        },
      );

    return NextResponse.json({
      config: {
        id: "main",
        payerId,
        payerName,
        updatedById: admin.id,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}