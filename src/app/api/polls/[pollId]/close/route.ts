import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  PollAuthorizationError,
  requirePollAdmin,
} from "@/lib/require-approved-user";

export const runtime = "nodejs";

class PollCloseError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "PollCloseError";
  }
}

function createErrorResponse(error: unknown) {
  if (error instanceof PollAuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof PollCloseError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error("Uzavření ankety selhalo:", error);

  return NextResponse.json(
    { error: "Anketu se nepodařilo uzavřít." },
    { status: 500 },
  );
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      pollId: string;
    }>;
  },
) {
  try {
    await requirePollAdmin(request);

    const { pollId } = await context.params;

    if (!pollId.trim()) {
      throw new PollCloseError(
        "Chybí ID ankety.",
      );
    }

    const firebaseAdminDb = getFirebaseAdminDb();

    const pollRef = firebaseAdminDb
      .collection("polls")
      .doc(pollId);

    const result = await firebaseAdminDb.runTransaction(
      async (transaction) => {
        const pollSnapshot = await transaction.get(
          pollRef,
        );

        if (!pollSnapshot.exists) {
          throw new PollCloseError(
            "Anketa neexistuje.",
            404,
          );
        }

        const status = pollSnapshot.data()?.status;

        if (status === "closed") {
          return {
            alreadyClosed: true,
          };
        }

        transaction.update(pollRef, {
          status: "closed",
          closedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          alreadyClosed: false,
        };
      },
    );

    return NextResponse.json({
      ok: true,
      alreadyClosed: result.alreadyClosed,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}