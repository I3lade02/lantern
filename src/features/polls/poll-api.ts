"use client";

import { firebaseAuth } from "@/firebase/auth";
import type { PollType } from "@/types/poll";

export type CreatePollInput = {
  question: string;
  description: string;
  type: PollType;
  options?: string[];
  closesAt: string | null;
  sessionId?: string | null;
};

type ApiErrorPayload = {
  error?: unknown;
};

function getApiErrorMessage(
  payload: unknown,
  fallbackMessage: string,
): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload
  ) {
    const errorValue = (payload as ApiErrorPayload).error;

    if (typeof errorValue === "string") {
      return errorValue;
    }
  }

  return fallbackMessage;
}

async function postWithUserToken(
  path: string,
  requestBody: Record<string, unknown>,
): Promise<unknown> {
  const currentUser = firebaseAuth.currentUser;

  if (!currentUser) {
    throw new Error("Pro tuto akci musíš být přihlášený.");
  }

  const idToken = await currentUser.getIdToken();

  const response = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        payload,
        "Požadavek se nepodařilo zpracovat.",
      ),
    );
  }

  return payload;
}

export async function createPoll(
  input: CreatePollInput,
): Promise<void> {
  await postWithUserToken("/api/polls", {
    question: input.question,
    description: input.description,
    type: input.type,
    options: input.options,
    closesAt: input.closesAt,
    sessionId: input.sessionId ?? null,
  });
}

export async function voteInPoll(
  pollId: string,
  selectedOptionIds: string[],
): Promise<void> {
  await postWithUserToken(
    `/api/polls/${encodeURIComponent(pollId)}/vote`,
    {
      selectedOptionIds,
    },
  );
}

export async function closePoll(
  pollId: string,
): Promise<void> {
  await postWithUserToken(
    `/api/polls/${encodeURIComponent(pollId)}/close`,
    {},
  );
}

export function getPollApiErrorMessage(
  error: unknown,
): string {
  if (!(error instanceof Error)) {
    return "Akci v anketě se nepodařilo dokončit.";
  }

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes("čas pro hlasování")) {
    return "Čas na hlasování právě vypršel.";
  }

  if (normalizedMessage.includes("anketa už je uzavřená")) {
    return "Tato anketa už je uzavřená.";
  }

  return error.message;
}