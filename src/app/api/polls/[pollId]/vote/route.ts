import { NextResponse } from "next/server";
import {
  FieldValue,
  type DocumentData,
} from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  PollAuthorizationError,
  requireApprovedPartyUser,
} from "@/lib/require-approved-user";
import {
  POLL_TYPES,
  type PollOption,
  type PollStatus,
  type PollType,
} from "@/types/poll";

export const runtime = "nodejs";

class PollVoteError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "PollVoteError";
  }
}

type VoteBody = {
  selectedOptionIds?: unknown;
};

type StoredPoll = {
  type: PollType;
  status: PollStatus;
  options: PollOption[];
  voteCount: number;
  closesAtMillis: number | null;
};

function getTimestampMillis(value: unknown): number | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("toMillis" in value)
  ) {
    return null;
  }

  const toMillis = value.toMillis;

  if (typeof toMillis !== "function") {
    return null;
  }

  const result = toMillis.call(value);

  return typeof result === "number" ? result : null;
}

function parseStoredPoll(data: DocumentData): StoredPoll {
  const type = data.type;
  const status = data.status;
  const rawOptions = data.options;

  if (
    typeof type !== "string" ||
    !POLL_TYPES.includes(type as PollType)
  ) {
    throw new PollVoteError(
      "Anketa má poškozený typ hlasování.",
      500,
    );
  }

  if (status !== "open" && status !== "closed") {
    throw new PollVoteError(
      "Anketa má neplatný stav.",
      500,
    );
  }

  if (!Array.isArray(rawOptions) || rawOptions.length < 2) {
    throw new PollVoteError(
      "Anketa nemá platné možnosti hlasování.",
      500,
    );
  }

  const options = rawOptions.map((rawOption) => {
    if (
      typeof rawOption !== "object" ||
      rawOption === null ||
      typeof rawOption.id !== "string" ||
      typeof rawOption.label !== "string" ||
      typeof rawOption.voteCount !== "number" ||
      !Number.isInteger(rawOption.voteCount) ||
      rawOption.voteCount < 0
    ) {
      throw new PollVoteError(
        "Anketa obsahuje neplatnou možnost hlasování.",
        500,
      );
    }

    return {
      id: rawOption.id,
      label: rawOption.label,
      voteCount: rawOption.voteCount,
    };
  });

  const voteCount =
    typeof data.voteCount === "number" &&
    Number.isInteger(data.voteCount) &&
    data.voteCount >= 0
      ? data.voteCount
      : 0;

  const rawClosesAt = data.closesAt;

  const closesAtMillis =
    rawClosesAt === null || rawClosesAt === undefined
      ? null
      : getTimestampMillis(rawClosesAt);

  if (
    rawClosesAt !== null &&
    rawClosesAt !== undefined &&
    closesAtMillis === null
  ) {
    throw new PollVoteError(
      "Anketa má neplatný čas ukončení.",
      500,
    );
  }

  return {
    type: type as PollType,
    status: status as PollStatus,
    options,
    voteCount,
    closesAtMillis,
  };
}

function parseRequestedOptionIds(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    throw new PollVoteError(
      "Vyber alespoň jednu možnost.",
    );
  }

  if (value.length < 1 || value.length > 8) {
    throw new PollVoteError(
      "Počet vybraných možností není platný.",
    );
  }

  if (!value.every((optionId) => typeof optionId === "string")) {
    throw new PollVoteError(
      "Vybrané možnosti nejsou platné.",
    );
  }

  const selectedOptionIds = value.map((optionId) =>
    optionId.trim(),
  );

  if (selectedOptionIds.some((optionId) => !optionId)) {
    throw new PollVoteError(
      "Vybraná možnost není platná.",
    );
  }

  if (
    new Set(selectedOptionIds).size !==
    selectedOptionIds.length
  ) {
    throw new PollVoteError(
      "Stejnou možnost nelze vybrat vícekrát.",
    );
  }

  return selectedOptionIds;
}

function validatePollSelection(
  poll: StoredPoll,
  selectedOptionIds: string[],
): void {
  const availableOptionIds = new Set(
    poll.options.map((option) => option.id),
  );

  if (
    selectedOptionIds.some(
      (optionId) => !availableOptionIds.has(optionId),
    )
  ) {
    throw new PollVoteError(
      "Vybraná možnost už v anketě neexistuje.",
    );
  }

  if (
    (poll.type === "yes_no" ||
      poll.type === "single_choice") &&
    selectedOptionIds.length !== 1
  ) {
    throw new PollVoteError(
      "V této anketě lze zvolit právě jednu možnost.",
    );
  }

  if (
    poll.type === "multiple_choice" &&
    selectedOptionIds.length > poll.options.length
  ) {
    throw new PollVoteError(
      "Bylo vybráno příliš mnoho možností.",
    );
  }
}

function getPreviousSelection(
  voteData: DocumentData | undefined,
): string[] {
  if (!Array.isArray(voteData?.selectedOptionIds)) {
    return [];
  }

  return voteData.selectedOptionIds.filter(
    (optionId): optionId is string =>
      typeof optionId === "string",
  );
}

function createErrorResponse(error: unknown) {
  if (error instanceof PollAuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof PollVoteError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error("Hlasování v anketě selhalo:", error);

  return NextResponse.json(
    { error: "Hlas se nepodařilo uložit." },
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
    const user = await requireApprovedPartyUser(request);

    const { pollId } = await context.params;

    if (!pollId.trim()) {
      throw new PollVoteError(
        "Chybí ID ankety.",
      );
    }

    const body = (await request.json()) as VoteBody;

    const requestedOptionIds = parseRequestedOptionIds(
      body.selectedOptionIds,
    );

    const firebaseAdminDb = getFirebaseAdminDb();

    const pollRef = firebaseAdminDb
      .collection("polls")
      .doc(pollId);

    const voteRef = pollRef
      .collection("votes")
      .doc(user.id);

    const transactionResult =
      await firebaseAdminDb.runTransaction(
        async (transaction) => {
          const pollSnapshot = await transaction.get(
            pollRef,
          );

        if (!pollSnapshot.exists) {
            throw new PollVoteError(
                "Anketa neexistuje.",
                404,
            );
        }

        const pollData = pollSnapshot.data();

        if (!pollData) {
            throw new PollVoteError(
                "Anketu se nepodařilo načíst.",
                500,
            );
        }

const poll = parseStoredPoll(pollData);

          if (poll.status !== "open") {
            return {
              status: "closed" as const,
            };
          }

          if (
            poll.closesAtMillis !== null &&
            poll.closesAtMillis <= Date.now()
          ) {
            transaction.update(pollRef, {
              status: "closed",
              closedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });

            return {
              status: "deadline_reached" as const,
            };
          }

          validatePollSelection(
            poll,
            requestedOptionIds,
          );

          const voteSnapshot = await transaction.get(
            voteRef,
          );

          const previousSelectedOptionIds =
            getPreviousSelection(voteSnapshot.data());

          const previousOptionIds = new Set(
            previousSelectedOptionIds,
          );

          const nextOptionIds = new Set(
            requestedOptionIds,
          );

          const nextOptions = poll.options.map((option) => {
            let nextVoteCount = option.voteCount;

            if (previousOptionIds.has(option.id)) {
              nextVoteCount -= 1;
            }

            if (nextOptionIds.has(option.id)) {
              nextVoteCount += 1;
            }

            return {
              ...option,
              voteCount: Math.max(0, nextVoteCount),
            };
          });

          const previousVoteCreatedAt =
            voteSnapshot.data()?.createdAt;

          transaction.set(voteRef, {
            userId: user.id,
            selectedOptionIds: requestedOptionIds,
            createdAt:
              previousVoteCreatedAt ??
              FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });

          transaction.update(pollRef, {
            options: nextOptions,
            voteCount:
              poll.voteCount +
              (voteSnapshot.exists ? 0 : 1),
            updatedAt: FieldValue.serverTimestamp(),
          });

          return {
            status: "saved" as const,
          };
        },
      );

    if (transactionResult.status === "closed") {
      return NextResponse.json(
        { error: "Anketa už je uzavřená." },
        { status: 409 },
      );
    }

    if (
      transactionResult.status === "deadline_reached"
    ) {
      return NextResponse.json(
        { error: "Čas pro hlasování právě vypršel." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}