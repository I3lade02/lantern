"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  MessageCircleMore,
  Send,
} from "lucide-react";

import { CHAT_MAX_MESSAGE_LENGTH } from "@/types/chat";

type ChatComposerProps = {
  disabled: boolean;
  isSending: boolean;
  onSend: (text: string) => Promise<boolean>;
};

const MAX_TEXTAREA_HEIGHT = 168;

export function ChatComposer({
  disabled,
  isSending,
  onSend,
}: ChatComposerProps) {
  const [text, setText] = useState("");

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);

  const characterCount = Array.from(text).length;

  function resizeTextarea() {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      MAX_TEXTAREA_HEIGHT,
    )}px`;
  }

  useEffect(() => {
    resizeTextarea();
  }, [text]);

  async function handleSend() {
    if (isSending || text.trim().length === 0) {
      return;
    }

    const wasSent = await onSend(text);

    if (wasSent) {
      setText("");
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();

    void handleSend();
  }

  return (
    <div className="border-t-2 border-outline bg-panel-deep/95 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex items-end gap-2">
        <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-panel text-cream-muted shadow-pixel-sm">
          <MessageCircleMore aria-hidden="true" size={18} />
        </div>

        <textarea
          ref={textareaRef}
          className="max-h-42 min-h-11 flex-1 resize-none rounded-2xl border-2 border-outline bg-panel px-4 py-3 text-sm leading-5 text-cream outline-none placeholder:text-cream-muted focus:border-amber disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || isSending}
          maxLength={CHAT_MAX_MESSAGE_LENGTH}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Napiš něco partě…"
          rows={1}
          value={text}
        />

        <button
          aria-label={
            isSending
              ? "Odesílám zprávu"
              : "Odeslat zprávu"
          }
          className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-outline bg-amber text-void shadow-pixel-sm transition-transform hover:-translate-y-0.5 hover:bg-amber-light active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={
            disabled ||
            isSending ||
            text.trim().length === 0
          }
          onClick={() => {
            void handleSend();
          }}
          type="button"
        >
          <Send
            aria-hidden="true"
            className={isSending ? "animate-pulse" : ""}
            size={18}
          />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 px-1">
        <p className="text-[11px] leading-5 text-cream-muted">
          Enter odešle · Shift + Enter nový řádek
        </p>

        <p
          className={[
            "font-pixel text-[7px]",
            characterCount >= CHAT_MAX_MESSAGE_LENGTH
              ? "text-wine-light"
              : "text-cream-muted",
          ].join(" ")}
        >
          {characterCount} / {CHAT_MAX_MESSAGE_LENGTH}
        </p>
      </div>
    </div>
  );
}