import { NextResponse } from "next/server";
import {
  FieldValue,
} from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  PollAuthorizationError,
  requireApprovedPartyUser,
} from "@/lib/require-approved-user";
import {
  DRINK_CATEGORIES,
  type DrinkCategory,
} from "@/types/bar";

export const runtime = "nodejs";

class BarClaimError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "BarClaimError";
  }
}

type ClaimDrinkBody = {
  qrToken?: unknown;
  sessionId?: unknown;
};

type StoredDrink = {
  id: string;
  name: string;
  priceCents: number;
  category: DrinkCategory;
  qrToken: string;
  isAvailable: boolean;
};

type StoredBarConfig = {
  payerId: string;
  payerName: string;
};

function parseRequiredText(
  value: unknown,
  fieldLabel: string,
  minLength: number,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    throw new BarClaimError(
      `${fieldLabel} musí být text.`,
    );
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length < minLength) {
    throw new BarClaimError(
      `${fieldLabel} musí mít alespoň ${minLength} znaků.`,
    );
  }

  if (normalizedValue.length > maxLength) {
    throw new BarClaimError(
      `${fieldLabel} může mít maximálně ${maxLength} znaků.`,
    );
  }

  return normalizedValue;
}

function parseQrToken(value: unknown): string {
  const token = parseRequiredText(
    value,
    "QR token",
    16,
    128,
  );

  if (!/^[a-zA-Z0-9_-]+$/.test(token)) {
    throw new BarClaimError(
      "QR token má neplatný formát.",
    );
  }

  return token;
}

function parseSessionId(value: unknown): string {
  return parseRequiredText(
    value,
    "Session",
    1,
    128,
  );
}

function isDrinkCategory(
  value: unknown,
): value is DrinkCategory {
  return (
    typeof value === "string" &&
    DRINK_CATEGORIES.includes(value as DrinkCategory)
  );
}

function parseStoredDrink(
  drinkId: string,
  data: Record<string, unknown>,
): StoredDrink {
  const name = data.name;
  const priceCents = data.priceCents;
  const category = data.category;
  const qrToken = data.qrToken;
  const isAvailable = data.isAvailable;

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100 ||
    typeof priceCents !== "number" ||
    !Number.isInteger(priceCents) ||
    priceCents < 1 ||
    priceCents > 100_000 ||
    !isDrinkCategory(category) ||
    typeof qrToken !== "string" ||
    qrToken.length < 16 ||
    typeof isAvailable !== "boolean"
  ) {
    throw new BarClaimError(
      "Nápoj má neplatná data. Zkontroluj jeho nastavení.",
      500,
    );
  }

  return {
    id: drinkId,
    name: name.trim(),
    priceCents,
    category,
    qrToken,
    isAvailable,
  };
}

function parseStoredBarConfig(
  data: Record<string, unknown>,
): StoredBarConfig {
  const payerId = data.payerId;
  const payerName = data.payerName;

  if (
    typeof payerId !== "string" ||
    payerId.trim().length === 0 ||
    typeof payerName !== "string" ||
    payerName.trim().length < 2 ||
    payerName.trim().length > 24
  ) {
    throw new BarClaimError(
      "Provozovatel baru není správně nastavený.",
      409,
    );
  }

  return {
    payerId: payerId.trim(),
    payerName: payerName.trim(),
  };
}

function formatCzkFromCents(amountCents: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function createErrorResponse(error: unknown) {
  if (error instanceof PollAuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof BarClaimError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error("Připsání nápoje z QR selhalo:", error);

  return NextResponse.json(
    {
      error:
        "Nápoj se nepodařilo přidat do útraty.",
    },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  try {
    const claimant = await requireApprovedPartyUser(
      request,
    );

    const body = (await request.json()) as ClaimDrinkBody;

    const qrToken = parseQrToken(body.qrToken);
    const sessionId = parseSessionId(body.sessionId);

    const firebaseAdminDb = getFirebaseAdminDb();

    const [
      drinkQuerySnapshot,
      sessionSnapshot,
      barConfigSnapshot,
    ] = await Promise.all([
      firebaseAdminDb
        .collection("drinks")
        .where("qrToken", "==", qrToken)
        .limit(1)
        .get(),

      firebaseAdminDb
        .collection("sessions")
        .doc(sessionId)
        .get(),

      firebaseAdminDb
        .collection("barConfig")
        .doc("main")
        .get(),
    ]);

    if (drinkQuerySnapshot.empty) {
      throw new BarClaimError(
        "Tento QR kód nepatří žádnému nápoji v LANternu.",
        404,
      );
    }

    if (!sessionSnapshot.exists) {
      throw new BarClaimError(
        "Vybraná session nebyla nalezena.",
        404,
      );
    }

    const sessionData = sessionSnapshot.data() ?? {};

    if (
      sessionData.status !== "upcoming" &&
      sessionData.status !== "active"
    ) {
      throw new BarClaimError(
        "Nápoj lze přidat jen do připravované nebo právě probíhající session.",
        409,
      );
    }

    if (!barConfigSnapshot.exists) {
      throw new BarClaimError(
        "Provozovatel baru zatím není nastavený.",
        409,
      );
    }

    const drinkSnapshot = drinkQuerySnapshot.docs[0]!;

    const drink = parseStoredDrink(
      drinkSnapshot.id,
      drinkSnapshot.data() as Record<string, unknown>,
    );

    const barConfig = parseStoredBarConfig(
      barConfigSnapshot.data() as Record<string, unknown>,
    );

    if (!drink.isAvailable) {
      throw new BarClaimError(
        "Tento nápoj je momentálně nedostupný.",
        409,
      );
    }

    const operatorProfileSnapshot =
      await firebaseAdminDb
        .collection("users")
        .doc(barConfig.payerId)
        .get();

    if (!operatorProfileSnapshot.exists) {
      throw new BarClaimError(
        "Nastavený provozovatel baru už nemá aktivní profil.",
        409,
      );
    }

    const operatorProfile =
      operatorProfileSnapshot.data() ?? {};

    const currentOperatorName =
      typeof operatorProfile.displayName === "string" &&
      operatorProfile.displayName.trim()
        ? operatorProfile.displayName.trim()
        : barConfig.payerName;

    const expenseRef = firebaseAdminDb
      .collection("expenses")
      .doc();

    const barClaimRef = firebaseAdminDb
      .collection("barClaims")
      .doc();

    const activityRef = firebaseAdminDb
      .collection("activityLog")
      .doc();

    const batch = firebaseAdminDb.batch();

    batch.set(expenseRef, {
      id: expenseRef.id,

      sessionId,

      title: drink.name,
      category: drink.category,
      amountCents: drink.priceCents,

      payerId: barConfig.payerId,
      payerName: currentOperatorName,

      participantIds: [claimant.id],
      splitType: "single",

      shares: [
        {
          userId: claimant.id,
          userName: claimant.displayName,
          amountCents: drink.priceCents,
        },
      ],

      note: "Taverní bar · QR scan",

      createdBy: claimant.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(barClaimRef, {
      id: barClaimRef.id,

      expenseId: expenseRef.id,

      drinkId: drink.id,
      drinkName: drink.name,
      drinkCategory: drink.category,
      priceCents: drink.priceCents,

      sessionId,

      claimantId: claimant.id,
      claimantName: claimant.displayName,

      claimedAt: FieldValue.serverTimestamp(),
    });

    batch.set(activityRef, {
      id: activityRef.id,

      type: "expense_created",

      actorId: claimant.id,
      actorName: claimant.displayName,

      message: `${claimant.displayName} si přidal ${drink.name} za ${formatCzkFromCents(drink.priceCents)} z taverního baru.`,

      sessionId,
      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json(
      {
        expenseId: expenseRef.id,
        barClaimId: barClaimRef.id,

        drink: {
          id: drink.id,
          name: drink.name,
          priceCents: drink.priceCents,
          category: drink.category,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}