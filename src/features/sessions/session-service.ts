"use client";

import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { ActivityType } from "@/types/activity";
import type {
  Session,
  SessionRsvpStatus,
  SessionRsvpSummary,
  SessionStatus,
} from "@/types/session";

export type SessionActor = {
  id: string;
  name: string;
};

export type SessionMutationInput = {
  title: string;
  description: string;
  startAt: Date;
  location: string;
  hostId: string;
  hostName: string;
  status: SessionStatus;
};

function createEmptyRsvpSummary(): SessionRsvpSummary {
  return {
    going: 0,
    maybe: 0,
    notGoing: 0,
  };
}

function updateRsvpSummary(
  currentSummary: SessionRsvpSummary,
  previousStatus: SessionRsvpStatus | null,
  nextStatus: SessionRsvpStatus,
): SessionRsvpSummary {
  const nextSummary = {
    ...currentSummary,
  };

  if (previousStatus) {
    nextSummary[previousStatus] = Math.max(
      0,
      nextSummary[previousStatus] - 1,
    );
  }

  nextSummary[nextStatus] += 1;

  return nextSummary;
}

function createActivityMessage(
  actorName: string,
  type: ActivityType,
  sessionTitle: string,
): string {
  switch (type) {
    case "session_created":
      return `${actorName} naplánoval session „${sessionTitle}“.`;

    case "session_updated":
      return `${actorName} upravil session „${sessionTitle}“.`;

    default:
      return `${actorName} provedl změnu session „${sessionTitle}“.`;
  }
}

export async function createSession(
  input: SessionMutationInput,
  actor: SessionActor,
): Promise<string> {
  const sessionRef = doc(collection(firestoreDb, "sessions"));
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.set(sessionRef, {
    id: sessionRef.id,
    title: input.title,
    description: input.description,
    startAt: input.startAt,
    location: input.location,
    hostId: input.hostId,
    hostName: input.hostName,
    status: input.status,
    rsvpSummary: createEmptyRsvpSummary(),
    plannedGameIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(activityRef, {
    id: activityRef.id,
    type: "session_created",
    actorId: actor.id,
    actorName: actor.name,
    message: createActivityMessage(
      actor.name,
      "session_created",
      input.title,
    ),
    sessionId: sessionRef.id,
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return sessionRef.id;
}

export async function updateSession(
  sessionId: string,
  input: SessionMutationInput,
  actor: SessionActor,
): Promise<void> {
  const sessionRef = doc(firestoreDb, "sessions", sessionId);
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.update(sessionRef, {
    title: input.title,
    description: input.description,
    startAt: input.startAt,
    location: input.location,
    hostId: input.hostId,
    hostName: input.hostName,
    status: input.status,
    updatedAt: serverTimestamp(),
  });

  batch.set(activityRef, {
    id: activityRef.id,
    type: "session_updated",
    actorId: actor.id,
    actorName: actor.name,
    message: createActivityMessage(
      actor.name,
      "session_updated",
      input.title,
    ),
    sessionId,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function setSessionRsvp(
  session: Session,
  status: SessionRsvpStatus,
  actor: SessionActor,
): Promise<void> {
  const sessionRef = doc(firestoreDb, "sessions", session.id);
  const rsvpRef = doc(
    firestoreDb,
    "sessions",
    session.id,
    "rsvps",
    actor.id,
  );

  const activityRef = doc(collection(firestoreDb, "activityLog"));

  await runTransaction(firestoreDb, async (transaction) => {
    const [sessionSnapshot, rsvpSnapshot] = await Promise.all([
      transaction.get(sessionRef),
      transaction.get(rsvpRef),
    ]);

    if (!sessionSnapshot.exists()) {
      throw new Error("Tato session už neexistuje.");
    }

    const sessionData = sessionSnapshot.data() as Session;
    const previousStatus = rsvpSnapshot.exists()
      ? (rsvpSnapshot.data().status as SessionRsvpStatus)
      : null;

    if (previousStatus === status) {
      return;
    }

    const currentSummary =
      sessionData.rsvpSummary ?? createEmptyRsvpSummary();

    const nextSummary = updateRsvpSummary(
      currentSummary,
      previousStatus,
      status,
    );

    const previousCreatedAt = rsvpSnapshot.exists()
      ? rsvpSnapshot.data().createdAt
      : serverTimestamp();

    transaction.update(sessionRef, {
      rsvpSummary: nextSummary,
      updatedAt: serverTimestamp(),
    });

    transaction.set(rsvpRef, {
      userId: actor.id,
      userName: actor.name,
      status,
      createdAt: previousCreatedAt,
      updatedAt: serverTimestamp(),
    });

    const statusMessage = {
      going: "potvrdil účast",
      maybe: "zatím zvažuje účast",
      notGoing: "oznámil, že nedorazí",
    } satisfies Record<SessionRsvpStatus, string>;

    transaction.set(activityRef, {
      id: activityRef.id,
      type: "session_rsvp",
      actorId: actor.id,
      actorName: actor.name,
      message: `${actor.name} ${statusMessage[status]} na session „${sessionData.title}“.`,
      sessionId: session.id,
      createdAt: serverTimestamp(),
    });
  });
}

export function getSessionErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Něco se pokazilo. Zkus to prosím znovu.";
  }

  if (error.message === "Tato session už neexistuje.") {
    return error.message;
  }

  if (error.message.toLowerCase().includes("permission")) {
    return "Nemáš oprávnění tuto session upravit.";
  }

  return "Zápis session se nepovedl. Zkus to prosím znovu.";
}