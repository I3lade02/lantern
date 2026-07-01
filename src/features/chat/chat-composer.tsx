"use client";

import {
  useState,
  type KeyboardEvent,
} from "react";
import { Send } from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { CHAT_MAX_MESSAGE_LENGTH } from "@/types/chat";

type ChatComposerProps = {
  disabled: boolean;
  isSending: boolean;
  onSend: (text: string) => Promise<boolean>;
};

export function ChatComposer({
  disabled,
  isSending,
  onSend,
}: ChatComposerProps) {
  const [text, setText] = useState("");

  const characterCount = Array.from(text).length;

  async function handleSend() {
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
    <div className="border-t-2 border-outline bg-panel-deep p-4">
      <textarea
        className="min-h-24 w-full resize-y border-2 border-outline bg-panel px-3 py-3 text-sm leading-6 text-cream outline-none placeholder:text-cream-muted focus:border-amber disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || isSending}
        maxLength={CHAT_MAX_MESSAGE_LENGTH}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Napiš něco partě… Emoji 🎲 a odkazy https://… jsou vítané."
        value={text}
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-cream-muted">
          Enter odešle · Shift + Enter nový řádek ·{" "}
          {characterCount} / {CHAT_MAX_MESSAGE_LENGTH}
        </p>

        <PixelButton
          disabled={
            disabled ||
            isSending ||
            text.trim().length === 0
          }
          onClick={() => {
            void handleSend();
          }}
          size="sm"
          variant="moss"
        >
          <Send aria-hidden="true" size={15} />
          {isSending ? "Odesílám…" : "Odeslat"}
        </PixelButton>
      </div>
    </div>
  );
}