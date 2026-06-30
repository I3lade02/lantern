"use client";

import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import {
  CHAT_MAX_MESSAGE_LENGTH,
  CHAT_RECENT_MESSAGE_LIMIT,
  CHAT_ROOM_ID,
  type ChatActor,
  type ChatMessage,
} from "@/types/chat";

function getGlobalMessagesCollection() {
  return collection(
    firestoreDb,
    "chatRooms",
    CHAT_ROOM_ID,
    "messages",
  );
}

function getGlobalMessageRef(messageId: string) {
  return doc(
    firestoreDb,
    "chatRooms",
    CHAT_ROOM_ID,
    "messages",
    messageId,
  );
}

function snapshotToChatMessage(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): ChatMessage {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as ChatMessage;
}

function normalizeMessageText(text: string): string {
  const normalizedText = text.trim();
  const characterCount = Array.from(normalizedText).length;

  if (characterCount < 1) {
    throw new Error("Zpráva nemůže být prázdná.");
  }

  if (characterCount > CHAT_MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Zpráva může mít maximálně ${CHAT_MAX_MESSAGE_LENGTH} znaků.`,
    );
  }

  return normalizedText;
}

function validateActor(actor: ChatActor): void {
  if (!actor.id.trim()) {
    throw new Error("Chybí identita přihlášeného člena.");
  }

  if (Array.from(actor.name.trim()).length < 2) {
    throw new Error("Profil člena nemá platné zobrazované jméno.");
  }
}

export function subscribeToRecentGlobalChatMessages(
  onMessagesChange: (messages: ChatMessage[]) => void,
  onMessagesError: (error: Error) => void,
): Unsubscribe {
  const messagesQuery = query(
    getGlobalMessagesCollection(),
    orderBy("createdAt", "desc"),
    limit(CHAT_RECENT_MESSAGE_LIMIT),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs
        .map(snapshotToChatMessage)
        .reverse();

      onMessagesChange(messages);
    },
    (error) => {
      onMessagesError(error);
    },
  );
}

export async function sendGlobalChatMessage(
  actor: ChatActor,
  text: string,
): Promise<string> {
  validateActor(actor);

  const normalizedText = normalizeMessageText(text);

  const messageRef = doc(getGlobalMessagesCollection());

  await setDoc(messageRef, {
    id: messageRef.id,

    authorId: actor.id,
    authorName: actor.name,
    authorAvatarColor: actor.avatarColor,

    type: "message",
    text: normalizedText,

    isDeleted: false,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    editedAt: null,

    deletedAt: null,
    deletedById: null,
  });

  return messageRef.id;
}

export async function updateOwnGlobalChatMessage(
  messageId: string,
  text: string,
): Promise<void> {
  const normalizedMessageId = messageId.trim();

  if (!normalizedMessageId) {
    throw new Error("Chybí ID zprávy.");
  }

  const normalizedText = normalizeMessageText(text);

  await updateDoc(
    getGlobalMessageRef(normalizedMessageId),
    {
      text: normalizedText,
      updatedAt: serverTimestamp(),
      editedAt: serverTimestamp(),
    },
  );
}

export async function softDeleteGlobalChatMessage(
  messageId: string,
  deletedById: string,
): Promise<void> {
  const normalizedMessageId = messageId.trim();
  const normalizedDeletedById = deletedById.trim();

  if (!normalizedMessageId) {
    throw new Error("Chybí ID zprávy.");
  }

  if (!normalizedDeletedById) {
    throw new Error("Chybí identita člena, který zprávu maže.");
  }

  await updateDoc(
    getGlobalMessageRef(normalizedMessageId),
    {
      text: "",
      isDeleted: true,

      updatedAt: serverTimestamp(),
      deletedAt: serverTimestamp(),
      deletedById: normalizedDeletedById,
    },
  );
}

export function getChatErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Chatová akce se nepodařila dokončit.";
  }

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes("permission")) {
    return "Nemáš oprávnění provést tuto akci v chatu.";
  }

  return error.message;
}