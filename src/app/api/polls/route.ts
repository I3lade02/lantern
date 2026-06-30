import { NextResponse } from "next/server";
import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  PollAuthorizationError,
  requirePollAdmin,
} from "@/lib/require-approved-user";
import {
  POLL_TYPES,
  type PollOption,
  type PollType,
} from "@/types/poll";

export const runtime = "nodejs";

class PollRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "PollRequestError";
  }
}

type CreatePollBody = {
  question?: unknown;
  description?: unknown;
  type?: unknown;
  options?: unknown;
  closesAt?: unknown;
  sessionId?: unknown;
};

function parseRequiredText(
  value: unknown,
  fieldLabel: string,
  minLength: number,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    throw new PollRequestError(
      `${fieldLabel} musí být text.`,
    );
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length < minLength) {
    throw new PollRequestError(
      `${fieldLabel} musí mít alespoň ${minLength} znaky.`,
    );
  }

  if (normalizedValue.length > maxLength) {
    throw new PollRequestError(
      `${fieldLabel} může mít maximálně ${maxLength} znaků.`,
    );
  }

  return normalizedValue;
}

function parseOptionalText(
  value: unknown,
  fieldLabel: string,
  maxLength: number,
): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new PollRequestError(
      `${fieldLabel} musí být text.`,
    );
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length > maxLength) {
    throw new PollRequestError(
      `${fieldLabel} může mít maximálně ${maxLength} znaků.`,
    );
  }

  return normalizedValue;
}

function parseOptionalSessionId(
  value: unknown,
): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new PollRequestError(
      "Session musí mít platné ID.",
    );
  }

  const normalizedValue = value.trim();

  if (!normalizedValue || normalizedValue.length > 128) {
    throw new PollRequestError(
      "Session má neplatné ID.",
    );
  }

  return normalizedValue;
}

function parsePollType(value: unknown): PollType {
  if (
    typeof value !== "string" ||
    !POLL_TYPES.includes(value as PollType)
  ) {
    throw new PollRequestError(
      "Typ ankety není platný.",
    );
  }

  return value as PollType;
}

function parseCustomOptionLabels(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    throw new PollRequestError(
      "Anketa musí obsahovat možnosti hlasování.",
    );
  }

  if (value.length < 2 || value.length > 8) {
    throw new PollRequestError(
      "Anketa musí mít 2 až 8 možností.",
    );
  }

  const labels = value.map((option, index) =>
    parseRequiredText(
      option,
      `Možnost ${index + 1}`,
      1,
      60,
    ),
  );

  const uniqueLabels = new Set(
    labels.map((label) => label.toLowerCase()),
  );

  if (uniqueLabels.size !== labels.length) {
    throw new PollRequestError(
      "Každá možnost musí mít unikátní název.",
    );
  }

  return labels;
}

function createPollOptions(
  pollType: PollType,
  rawOptions: unknown,
): PollOption[] {
  if (pollType === "yes_no") {
    return [
      {
        id: "yes",
        label: "Ano",
        voteCount: 0,
      },
      {
        id: "no",
        label: "Ne",
        voteCount: 0,
      },
    ];
  }

  const labels = parseCustomOptionLabels(rawOptions);

  return labels.map((label, index) => ({
    id: `option-${index + 1}`,
    label,
    voteCount: 0,
  }));
}

function parseClosesAt(
  value: unknown,
): Timestamp | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new PollRequestError(
      "Konec hlasování musí být datum a čas.",
    );
  }

  const closeDate = new Date(value);

  if (Number.isNaN(closeDate.getTime())) {
    throw new PollRequestError(
      "Konec hlasování nemá platný formát.",
    );
  }

  if (closeDate.getTime() <= Date.now() + 60_000) {
    throw new PollRequestError(
      "Konec hlasování musí být alespoň minutu v budoucnosti.",
    );
  }

  return Timestamp.fromDate(closeDate);
}

function createErrorResponse(error: unknown) {
  if (error instanceof PollAuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof PollRequestError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error("Vytvoření ankety selhalo:", error);

  return NextResponse.json(
    { error: "Anketu se nepodařilo vytvořit." },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  try {
    const admin = await requirePollAdmin(request);

    const body = (await request.json()) as CreatePollBody;

    const question = parseRequiredText(
      body.question,
      "Otázka",
      4,
      160,
    );

    const description = parseOptionalText(
      body.description,
      "Popis",
      500,
    );

    const type = parsePollType(body.type);

    const options = createPollOptions(
      type,
      body.options,
    );

    const closesAt = parseClosesAt(body.closesAt);

    const sessionId = parseOptionalSessionId(
      body.sessionId,
    );

    const firebaseAdminDb = getFirebaseAdminDb();
    const pollRef = firebaseAdminDb.collection("polls").doc();

    await pollRef.set({
      id: pollRef.id,

      question,
      description,

      type,
      status: "open",

      options,
      voteCount: 0,

      sessionId,

      createdById: admin.id,
      createdByName: admin.displayName,

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),

      closesAt,
      closedAt: null,
    });

    return NextResponse.json(
      {
        id: pollRef.id,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}