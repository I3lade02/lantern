"use client";

import { useEffect, useState } from "react";

import { subscribeToRecentGlobalChatMessages } from "@/features/chat/chat-service";
import type { ChatMessage } from "@/types/chat";

type ChatMessagesStatus = "loading" | "ready" | "error";

type ChatMessagesState = {
  scopeKey: string;
  messages: ChatMessage[];
  status: ChatMessagesStatus;
  error: string | null;
};

const EMPTY_CHAT_MESSAGES: ChatMessage[] = [];

export function useGlobalChatMessages(enabled: boolean) {
  const [state, setState] = useState<ChatMessagesState>({
    scopeKey: "",
    messages: [],
    status: "loading",
    error: null,
  });

  const scopeKey = enabled ? "global" : "";

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    const unsubscribe = subscribeToRecentGlobalChatMessages(
      (messages) => {
        if (!isActive) {
          return;
        }

        setState({
          scopeKey: "global",
          messages,
          status: "ready",
          error: null,
        });
      },
      (snapshotError) => {
        if (!isActive) {
          return;
        }

        console.error(
          "Nepodařilo se načíst zprávy party chatu:",
          snapshotError,
        );

        setState({
          scopeKey: "global",
          messages: [],
          status: "error",
          error: "Zprávy party chatu se nepodařilo načíst.",
        });
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [enabled]);

  if (!enabled) {
    return {
      messages: EMPTY_CHAT_MESSAGES,
      isLoading: false,
      error: null,
    };
  }

  if (state.scopeKey !== scopeKey) {
    return {
      messages: EMPTY_CHAT_MESSAGES,
      isLoading: true,
      error: null,
    };
  }

  return {
    messages: state.messages,
    isLoading: state.status === "loading",
    error: state.error,
  };
}