"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCheck,
  Dices,
  Gamepad2,
  HandCoins,
  LoaderCircle,
  MessageCircleMore,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import {
  useNotificationsContext,
} from "@/features/notifications/notifications-provider";
import { formatRelativeTime } from "@/lib/formatters";
import type { ChatMessage } from "@/types/chat";
import type {
  InAppNotification,
  NotificationIconKind,
} from "@/types/notification";

const notificationIcons: Record<
  NotificationIconKind,
  LucideIcon
> = {
  session: CalendarDays,
  expense: ReceiptText,
  debt: HandCoins,
  payment: ShieldCheck,
  game: Gamepad2,
  dice: Dices,
  member: UsersRound,
  other: Sparkles,
};

function formatUnreadLabel(unreadCount: number): string {
  if (unreadCount === 1) {
    return "1 nová notifikace";
  }

  if (unreadCount >= 2 && unreadCount <= 4) {
    return `${unreadCount} nové notifikace`;
  }

  return `${unreadCount} nových notifikací`;
}

function formatUnreadChatLabel(unreadCount: number): string {
  if (unreadCount === 1) {
    return "1 nová zpráva v chatu";
  }

  if (unreadCount >= 2 && unreadCount <= 4) {
    return `${unreadCount} nové zprávy v chatu`;
  }

  return `${unreadCount} nových zpráv v chatu`;
}

type NotificationItemProps = {
  notification: InAppNotification;
  onNavigate: () => void;
};

function NotificationItem({
  notification,
  onNavigate,
}: NotificationItemProps) {
  const Icon = notificationIcons[notification.iconKind];

  return (
    <Link
      className={
        notification.isUnread
          ? "group flex gap-3 border-b-2 border-outline bg-panel p-4 transition-colors hover:bg-panel-muted"
          : "group flex gap-3 border-b-2 border-outline bg-panel-deep p-4 transition-colors hover:bg-panel-muted"
      }
      href={notification.href}
      onClick={onNavigate}
    >
      <div
        className={
          notification.isUnread
            ? "grid size-10 shrink-0 place-items-center border-2 border-outline bg-amber text-void shadow-pixel-sm"
            : "grid size-10 shrink-0 place-items-center border-2 border-outline bg-panel-muted text-cream-muted shadow-pixel-sm"
        }
      >
        <Icon aria-hidden="true" size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="font-pixel text-[9px] leading-5 text-cream">
            {notification.title}
          </p>

          {notification.isUnread ? (
            <span className="font-pixel text-[7px] leading-4 text-amber-light">
              NOVÉ
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-sm leading-6 text-cream-muted">
          {notification.message}
        </p>

        <p className="mt-2 text-xs text-cream-muted">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </Link>
  );
}

type ChatUnreadSummaryProps = {
  unreadChatCount: number;
  latestMessage: ChatMessage | null;
  onNavigate: () => void;
};

function ChatUnreadSummary({
  unreadChatCount,
  latestMessage,
  onNavigate,
}: ChatUnreadSummaryProps) {
  return (
    <Link
      className="group flex gap-3 border-2 border-amber bg-panel p-4 shadow-pixel-sm transition-colors hover:bg-panel-muted"
      href="/chat"
      onClick={onNavigate}
    >
      <div className="grid size-10 shrink-0 place-items-center border-2 border-outline bg-amber text-void shadow-pixel-sm">
        <MessageCircleMore aria-hidden="true" size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="font-pixel text-[9px] leading-5 text-cream">
            NOVÉ ZPRÁVY V CHATU
          </p>

          <span className="font-pixel text-[7px] leading-4 text-amber-light">
            NOVÉ
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-cream">
          {formatUnreadChatLabel(unreadChatCount)}
        </p>

        {latestMessage ? (
          <p className="mt-2 line-clamp-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-cream-muted">
            <span className="font-semibold text-cream">
              {latestMessage.authorName}:
            </span>{" "}
            {latestMessage.text}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingRead, setIsMarkingRead] =
    useState(false);

  const {
    notifications,
    unreadChatCount,
    unreadCount,
    latestUnreadChatMessage,
    isLoading,
    error,
    markAllAsRead,
  } = useNotificationsContext();

  async function handleMarkAllAsRead() {
    setIsMarkingRead(true);

    try {
      await markAllAsRead();
      toast.success("Všechny novinky byly označeny jako přečtené.");
    } catch (markError) {
      console.error(
        "Nepodařilo se označit notifikace jako přečtené:",
        markError,
      );

      toast.error(
        "Notifikace se nepodařilo označit jako přečtené.",
      );
    } finally {
      setIsMarkingRead(false);
    }
  }

  const hasAnyVisibleNotification =
    notifications.length > 0 || unreadChatCount > 0;

  return (
    <>
      <button
        aria-label={
          unreadCount > 0
            ? `Notifikace, ${formatUnreadLabel(unreadCount)}`
            : "Notifikace"
        }
        className="relative grid size-11 place-items-center border-2 border-outline bg-panel text-cream shadow-pixel-sm transition-transform hover:-translate-y-0.5 hover:bg-panel-muted active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {unreadCount > 0 ? (
          <BellRing
            aria-hidden="true"
            className="text-amber-light"
            size={19}
          />
        ) : (
          <Bell aria-hidden="true" size={19} />
        )}

        {unreadCount > 0 ? (
          <span className="absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center border-2 border-outline bg-wine px-1 font-pixel text-[7px] text-cream shadow-pixel-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      <PixelModal
        description="Přehled novinek ze sessions, útrat, dluhů, herní knihovny a party chatu."
        onClose={() => setIsOpen(false)}
        open={isOpen}
        size="lg"
        title="Notifikace"
      >
        <div className="grid gap-5">
          <div className="flex flex-col gap-4 border-2 border-outline bg-panel-deep p-4 shadow-pixel-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-pixel text-[9px] leading-5 text-amber-light">
                PARTY ALERTS
              </p>

              <p className="mt-2 text-sm text-cream-muted">
                {unreadCount > 0
                  ? formatUnreadLabel(unreadCount)
                  : "Všechno je přečtené. Taverní zvon může odpočívat."}
              </p>
            </div>

            <PixelButton
              disabled={
                unreadCount === 0 ||
                isMarkingRead ||
                isLoading
              }
              onClick={handleMarkAllAsRead}
              size="sm"
              variant="moss"
            >
              {isMarkingRead ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={15}
                />
              ) : (
                <CheckCheck aria-hidden="true" size={15} />
              )}

              {isMarkingRead
                ? "Ukládám…"
                : "Označit vše přečtené"}
            </PixelButton>
          </div>

          {isLoading ? (
            <div className="grid min-h-44 place-items-center border-2 border-outline bg-panel-deep text-center">
              <div>
                <LoaderCircle
                  aria-hidden="true"
                  className="mx-auto animate-spin text-amber-light"
                  size={24}
                />

                <p className="mt-4 text-sm text-cream-muted">
                  Ladím taverní zvon…
                </p>
              </div>
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="border-2 border-danger bg-wine-dark p-4 text-sm leading-6 text-cream">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && unreadChatCount > 0 ? (
            <ChatUnreadSummary
              latestMessage={latestUnreadChatMessage}
              onNavigate={() => setIsOpen(false)}
              unreadChatCount={unreadChatCount}
            />
          ) : null}

          {!isLoading && !error && !hasAnyVisibleNotification ? (
            <div className="grid min-h-44 place-items-center border-2 border-outline bg-panel-deep p-6 text-center">
              <div>
                <Bell
                  aria-hidden="true"
                  className="mx-auto text-cream-muted"
                  size={28}
                />

                <p className="mt-4 font-pixel text-[10px] leading-6 text-cream">
                  Zatím žádné novinky
                </p>

                <p className="mt-3 text-sm leading-6 text-cream-muted">
                  Až někdo vytvoří session, přidá útratu, pošle zprávu nebo
                  potvrdí platbu, objeví se to tady.
                </p>
              </div>
            </div>
          ) : null}

          {!isLoading && !error && notifications.length > 0 ? (
            <div className="max-h-112 overflow-y-auto border-2 border-outline shadow-pixel-sm">
              {notifications.map((notification, index) => (
                <div
                  className={
                    index === notifications.length - 1
                      ? "[&>a]:border-b-0"
                      : ""
                  }
                  key={notification.id}
                >
                  <NotificationItem
                    notification={notification}
                    onNavigate={() => setIsOpen(false)}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </PixelModal>
    </>
  );
}