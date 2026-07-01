"use client";

import { useState } from "react";
import {
  Check,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { ChatLinkifiedText } from "@/features/chat/chat-linkified-text";
import type { ChatMessage } from "@/types/chat";
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

  return (
    <article
      className={[
        "flex gap-3 border-b-2 border-outline-soft px-4 py-4",
        isOwnMessage ? "bg-panel/40" : "bg-transparent",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "grid size-10 shrink-0 place-items-center border-2 border-outline",
          avatarColorClasses[message.authorAvatarColor],
        ].join(" ")}
      >
        <span className="font-pixel text-[9px]">
          {getInitials(message.authorName)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-semibold text-cream">
            {message.authorName}
          </p>

          <span className="text-xs text-cream-muted">
            {formatMessageTime(message.createdAt)}
          </span>

          {message.editedAt && !message.isDeleted ? (
            <span className="font-pixel text-[7px] text-cream-muted">
              UPRAVENO
            </span>
          ) : null}
        </div>

        {message.isDeleted ? (
          <p className="mt-2 italic leading-7 text-cream-muted">
            Tato zpráva byla smazána.
          </p>
        ) : isEditing ? (
          <div className="mt-3">
            <textarea
              autoFocus
              className="min-h-28 w-full resize-y border-2 border-amber bg-panel-deep px-3 py-3 text-sm leading-6 text-cream outline-none placeholder:text-cream-muted"
              disabled={isSubmittingEdit}
              maxLength={1500}
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
                  "Ukládám…"
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
          <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-cream">
            <ChatLinkifiedText text={message.text} />
          </p>
        )}

        {!message.isDeleted && !isEditing && (canEdit || canDelete) ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {canEdit ? (
              <button
                className="inline-flex items-center gap-1 font-pixel text-[8px] text-cream-muted transition hover:text-amber-light"
                disabled={isSaving}
                onClick={() => setIsEditing(true)}
                type="button"
              >
                <Pencil aria-hidden="true" size={13} />
                UPRAVIT
              </button>
            ) : null}

            {canDelete ? (
              <button
                className="inline-flex items-center gap-1 font-pixel text-[8px] text-wine-light transition hover:text-wine"
                disabled={isSaving}
                onClick={() => onRequestDelete(message)}
                type="button"
              >
                <Trash2 aria-hidden="true" size={13} />
                SMAZAT
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isSaving ? (
        <div className="shrink-0 pt-1 text-moss-light">
          <Check aria-hidden="true" size={16} />
        </div>
      ) : null}
    </article>
  );
}