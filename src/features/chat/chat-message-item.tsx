"use client";

import { useState } from "react";
import {
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { ChatLinkifiedText } from "@/features/chat/chat-linkified-text";
import {
  CHAT_MAX_MESSAGE_LENGTH,
  type ChatMessage,
} from "@/types/chat";
import type { AvatarColor } from "@/types/user";

type ChatMessageItemProps = {
  message: ChatMessage;
  currentUserId: string;
  isAdmin: boolean;
  isSaving: boolean;
  onEdit: (
    message: ChatMessage,
    nextText: string,
  ) => Promise<boolean>;
  onRequestDelete: (message: ChatMessage) => void;
};

const avatarColorClasses: Record<AvatarColor, string> = {
  amber: "bg-amber text-void",
  moss: "bg-moss text-cream",
  wine: "bg-wine text-cream",
  cream: "bg-cream text-void",
};

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

function formatMessageTime(
  timestamp: ChatMessage["createdAt"],
): string {
  if (!timestamp) {
    return "teď";
  }

  const date = timestamp.toDate();
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return new Intl.DateTimeFormat("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ChatMessageItem({
  message,
  currentUserId,
  isAdmin,
  isSaving,
  onEdit,
  onRequestDelete,
}: ChatMessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(message.text);

  const [isSubmittingEdit, setIsSubmittingEdit] =
    useState(false);

  const isOwnMessage = message.authorId === currentUserId;

  const canEdit =
    !message.isDeleted && isOwnMessage;

  const canDelete =
    !message.isDeleted &&
    (isOwnMessage || isAdmin);

  async function handleSaveEdit() {
    const normalizedDraft = draftText.trim();

    if (!normalizedDraft) {
      return;
    }

    if (normalizedDraft === message.text) {
      setIsEditing(false);
      return;
    }

    setIsSubmittingEdit(true);

    try {
      const wasSaved = await onEdit(
        message,
        normalizedDraft,
      );

      if (wasSaved) {
        setIsEditing(false);
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  }

  function cancelEdit() {
    setDraftText(message.text);
    setIsEditing(false);
  }

  if (message.isDeleted) {
    return (
      <article className="flex justify-center px-4 py-3">
        <div className="max-w-sm border border-outline bg-panel-deep px-4 py-2 text-center text-xs italic leading-5 text-cream-muted">
          Tato zpráva byla smazána.
        </div>
      </article>
    );
  }

  return (
    <article
      className={[
        "group flex w-full items-end gap-2 px-3 py-1.5 sm:px-5",
        isOwnMessage ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      {!isOwnMessage ? (
        <div
          aria-hidden="true"
          className={[
            "grid size-9 shrink-0 place-items-center border-2 border-outline shadow-pixel-sm",
            avatarColorClasses[message.authorAvatarColor],
          ].join(" ")}
        >
          <span className="font-pixel text-[8px]">
            {getInitials(message.authorName)}
          </span>
        </div>
      ) : null}

      <div
        className={[
          "flex max-w-[84%] flex-col sm:max-w-[70%]",
          isOwnMessage ? "items-end" : "items-start",
        ].join(" ")}
      >
        {!isOwnMessage ? (
          <p className="mb-1 px-1 text-xs font-semibold text-cream-muted">
            {message.authorName}
          </p>
        ) : null}

        {isEditing ? (
          <div className="w-full border-2 border-amber bg-panel p-3 shadow-pixel-sm">
            <textarea
              autoFocus
              className="min-h-28 w-full resize-y border-2 border-outline bg-panel-deep px-3 py-3 text-sm leading-6 text-cream outline-none placeholder:text-cream-muted focus:border-amber disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmittingEdit}
              maxLength={CHAT_MAX_MESSAGE_LENGTH}
              onChange={(event) =>
                setDraftText(event.target.value)
              }
              value={draftText}
            />

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <PixelButton
                disabled={isSubmittingEdit}
                onClick={cancelEdit}
                size="sm"
                variant="ghost"
              >
                <X aria-hidden="true" size={14} />
                Zrušit
              </PixelButton>

              <PixelButton
                disabled={
                  isSubmittingEdit ||
                  draftText.trim().length === 0
                }
                onClick={() => {
                  void handleSaveEdit();
                }}
                size="sm"
                variant="moss"
              >
                {isSubmittingEdit ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin"
                      size={14}
                    />
                    Ukládám…
                  </>
                ) : (
                  <>
                    <Save aria-hidden="true" size={14} />
                    Uložit
                  </>
                )}
              </PixelButton>
            </div>
          </div>
        ) : (
          <div
            className={[
              "w-fit max-w-full border-2 px-4 py-3 shadow-pixel-sm",
              "text-sm leading-6",
              isOwnMessage
                ? [
                    "rounded-2xl rounded-br-sm bg-amber text-void",
                    "[&_a]:text-wine-dark!",
                    "[&_a]:decoration-wine-dark!",
                    "[&_a:hover]:text-void!",
                  ].join(" ")
                : [
                    "rounded-2xl rounded-bl-sm bg-panel text-cream",
                    "border-outline",
                  ].join(" "),
            ].join(" ")}
          >
            <p className="whitespace-pre-wrap wrap-break-word">
              <ChatLinkifiedText text={message.text} />
            </p>

            <div
              className={[
                "mt-2 flex items-center gap-2 text-[10px]",
                isOwnMessage
                  ? "justify-end text-void/70"
                  : "justify-end text-cream-muted",
              ].join(" ")}
            >
              {message.editedAt ? (
                <span className="font-pixel text-[7px]">
                  UPRAVENO
                </span>
              ) : null}

              <span>{formatMessageTime(message.createdAt)}</span>

              {isSaving ? (
                <LoaderCircle
                  aria-label="Ukládám změnu zprávy"
                  className="animate-spin"
                  size={12}
                />
              ) : null}
            </div>
          </div>
        )}

        {!isEditing && (canEdit || canDelete) ? (
          <div
            className={[
              "mt-1.5 flex items-center gap-3 px-1",
              "transition-opacity sm:opacity-0 sm:group-hover:opacity-100",
              "sm:group-focus-within:opacity-100",
              isOwnMessage ? "justify-end" : "justify-start",
            ].join(" ")}
          >
            {canEdit ? (
              <button
                className="inline-flex items-center gap-1 font-pixel text-[7px] text-cream-muted transition hover:text-amber-light disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
                onClick={() => setIsEditing(true)}
                type="button"
              >
                <Pencil aria-hidden="true" size={12} />
                UPRAVIT
              </button>
            ) : null}

            {canDelete ? (
              <button
                className="inline-flex items-center gap-1 font-pixel text-[7px] text-wine-light transition hover:text-wine disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
                onClick={() => onRequestDelete(message)}
                type="button"
              >
                <Trash2 aria-hidden="true" size={12} />
                SMAZAT
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}