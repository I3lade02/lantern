"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import { useAuth } from "@/features/auth/auth-provider";
import {
  markAllNotificationsAsRead,
} from "@/features/notifications/notification-service";
import {
  useNotifications,
} from "@/features/notifications/use-notifications";
import type { ChatMessage } from "@/types/chat";
import type {
  InAppNotification,
} from "@/types/notification";

type NotificationsContextValue = {
  notifications: InAppNotification[];

  unreadActivityCount: number;
  unreadChatCount: number;
  unreadCount: number;

  hasUnreadChat: boolean;
  latestUnreadChatMessage: ChatMessage | null;

  isLoading: boolean;
  error: string | null;

  markAllAsRead: () => Promise<void>;
};

const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

type NotificationsProviderProps = {
  children: ReactNode;
};

export function NotificationsProvider({
  children,
}: NotificationsProviderProps) {
  const { user, profileStatus } = useAuth();

  const {
    notifications,
    unreadActivityCount,
    unreadChatCount,
    unreadCount,
    hasUnreadChat,
    latestUnreadChatMessage,
    isLoading,
    error,
  } = useNotifications(
    user?.uid ?? null,
    profileStatus === "ready" && Boolean(user),
  );

  async function markAllAsRead() {
    if (!user) {
      return;
    }

    await markAllNotificationsAsRead(user.uid);
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,

        unreadActivityCount,
        unreadChatCount,
        unreadCount,

        hasUnreadChat,
        latestUnreadChatMessage,

        isLoading,
        error,

        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotificationsContext musí být použité uvnitř NotificationsProvider.",
    );
  }

  return context;
}