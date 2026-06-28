"use client";

import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type {
  Game,
  GameCategory,
  GameOwnership,
} from "@/types/game";
import type { Session } from "@/types/session";

export type GameActor = {
  id: string;
  name: string;
};

export type GameMutationInput = {
  title: string;
  category: GameCategory;

  minPlayers: number;
  maxPlayers: number;
  playTimeMinutes: number;
  complexity: number;

  ownership: GameOwnership;
  ownerName: string;

  notes: string;
  isAvailable: boolean;
};

function createGameActivityMessage(
  actorName: string,
  gameTitle: string,
): string {
  return `${actorName} přidal hru „${gameTitle}“ do herní knihovny.`;
}

export async function createGame(
  input: GameMutationInput,
  actor: GameActor,
): Promise<string> {
  const gameRef = doc(collection(firestoreDb, "games"));
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.set(gameRef, {
    id: gameRef.id,

    title: input.title,
    category: input.category,

    minPlayers: input.minPlayers,
    maxPlayers: input.maxPlayers,
    playTimeMinutes: input.playTimeMinutes,
    complexity: input.complexity,

    ownership: input.ownership,
    ownerName: input.ownerName,

    notes: input.notes,
    isAvailable: input.isAvailable,

    addedById: actor.id,
    addedByName: actor.name,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(activityRef, {
    id: activityRef.id,
    type: "game_added",
    actorId: actor.id,
    actorName: actor.name,
    message: createGameActivityMessage(actor.name, input.title),
    sessionId: null,
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return gameRef.id;
}

export async function updateGame(
  gameId: string,
  input: GameMutationInput,
): Promise<void> {
  await updateDoc(doc(firestoreDb, "games", gameId), {
    title: input.title,
    category: input.category,

    minPlayers: input.minPlayers,
    maxPlayers: input.maxPlayers,
    playTimeMinutes: input.playTimeMinutes,
    complexity: input.complexity,

    ownership: input.ownership,
    ownerName: input.ownerName,

    notes: input.notes,
    isAvailable: input.isAvailable,

    updatedAt: serverTimestamp(),
  });
}

export async function addGameToSession(
  session: Session,
  game: Game,
  actor: GameActor,
): Promise<void> {
  const sessionRef = doc(firestoreDb, "sessions", session.id);
  const activityRef = doc(collection(firestoreDb, "activityLog"));
  const batch = writeBatch(firestoreDb);

  batch.update(sessionRef, {
    plannedGameIds: arrayUnion(game.id),
    updatedAt: serverTimestamp(),
  });

  batch.set(activityRef, {
    id: activityRef.id,
    type: "game_added",
    actorId: actor.id,
    actorName: actor.name,
    message: `${actor.name} přidal hru „${game.title}“ k session „${session.title}“.`,
    sessionId: session.id,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function removeGameFromSession(
  sessionId: string,
  gameId: string,
): Promise<void> {
  await updateDoc(doc(firestoreDb, "sessions", sessionId), {
    plannedGameIds: arrayRemove(gameId),
    updatedAt: serverTimestamp(),
  });
}

export function getGameErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Změnu herní knihovny se nepodařilo uložit.";
  }

  if (error.message.toLowerCase().includes("permission")) {
    return "Nemáš oprávnění tuto změnu provést.";
  }

  return "Změnu herní knihovny se nepodařilo uložit. Zkus to prosím znovu.";
}