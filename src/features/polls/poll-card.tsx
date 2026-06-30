"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  CircleDot,
  Clock3,
  LockKeyhole,
  Send,
  Users,
  Vote,
} from "lucide-react";

import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import {
  formatPollDate,
  getPollPercentage,
  getPollStatusLabel,
  getPollTypeLabel,
  getPollVoterLabel,
  isPollLocked,
} from "@/features/polls/poll-utils";
import type { Poll, PollVote } from "@/types/poll";

type PollCardProps = {
  poll: Poll;
  ownVote: PollVote | null;
  isAdmin: boolean;
  isVoting: boolean;
  isClosing: boolean;
  onVote: (
    poll: Poll,
    selectedOptionIds: string[],
  ) => Promise<void>;
  onRequestClose: (poll: Poll) => void;
};

type MultiChoiceVoteFormProps = {
  poll: Poll;
  defaultSelectedOptionIds: string[];
  isVoting: boolean;
  onVote: (
    poll: Poll,
    selectedOptionIds: string[],
  ) => Promise<void>;
};

function MultiChoiceVoteForm({
  poll,
  defaultSelectedOptionIds,
  isVoting,
  onVote,
}: MultiChoiceVoteFormProps) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(
    () => defaultSelectedOptionIds,
  );

  function toggleOption(optionId: string) {
    setSelectedOptionIds((currentSelection) => {
      if (currentSelection.includes(optionId)) {
        return currentSelection.filter(
          (selectedOptionId) => selectedOptionId !== optionId,
        );
      }

      return [...currentSelection, optionId];
    });
  }

  return (
    <div className="mt-7">
      <p className="font-pixel text-[9px] text-cream">
        OZNAČ VŠECHNY MOŽNOSTI, KTERÉ PLATÍ
      </p>

      <div className="mt-3 grid gap-3">
        {poll.options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);

          return (
            <label
              key={`multi-vote-${option.id}`}
              className={[
                "flex cursor-pointer items-center gap-3 border-2 p-4 transition",
                isSelected
                  ? "border-moss bg-moss/10"
                  : "border-outline bg-panel hover:border-outline-soft",
              ].join(" ")}
            >
              <input
                checked={isSelected}
                className="size-4 accent-amber"
                disabled={isVoting}
                onChange={() => toggleOption(option.id)}
                type="checkbox"
              />

              <span className="font-semibold text-cream">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <PixelButton
          disabled={isVoting || selectedOptionIds.length === 0}
          onClick={() => {
            void onVote(poll, selectedOptionIds);
          }}
          variant="moss"
        >
          <Send aria-hidden="true" size={16} />
          {isVoting
            ? "Ukládám hlas…"
            : defaultSelectedOptionIds.length > 0
              ? "Uložit změnu"
              : "Odeslat hlas"}
        </PixelButton>
      </div>
    </div>
  );
}

export function PollCard({
  poll,
  ownVote,
  isAdmin,
  isVoting,
  isClosing,
  onVote,
  onRequestClose,
}: PollCardProps) {
  const selectedOptionIds = ownVote?.selectedOptionIds ?? [];
  const selectedOptionIdsKey = selectedOptionIds.join("|");

  const selectedIdsSet = new Set(selectedOptionIds);
  const isLocked = isPollLocked(poll);

  async function submitSingleVote(optionId: string) {
    await onVote(poll, [optionId]);
  }

  return (
    <PixelPanel tone="deep">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PixelBadge tone={isLocked ? "muted" : "amber"}>
              {getPollStatusLabel(poll)}
            </PixelBadge>

            <span className="font-pixel text-[8px] text-cream-muted">
              {getPollTypeLabel(poll.type)}
            </span>
          </div>

          <h3 className="mt-4 font-pixel text-[12px] leading-8 text-cream">
            {poll.question}
          </h3>

          {poll.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-cream-muted">
              {poll.description}
            </p>
          ) : null}
        </div>

        {isAdmin && poll.status === "open" ? (
          <PixelButton
            disabled={isClosing}
            onClick={() => onRequestClose(poll)}
            size="sm"
            variant="wine"
          >
            <LockKeyhole aria-hidden="true" size={14} />
            Uzavřít
          </PixelButton>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 border-y-2 border-outline py-4 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-sm text-cream-muted">
          <Users
            aria-hidden="true"
            className="text-amber-light"
            size={16}
          />
          <span>{getPollVoterLabel(poll.voteCount)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-cream-muted">
          <Clock3
            aria-hidden="true"
            className="text-amber-light"
            size={16}
          />
          <span>
            {poll.closesAt
              ? `Konec: ${formatPollDate(poll.closesAt)}`
              : "Bez termínu ukončení"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-cream-muted">
          <Vote
            aria-hidden="true"
            className="text-amber-light"
            size={16}
          />
          <span>Vytvořil {poll.createdByName}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {poll.options.map((option) => {
          const isSelected = selectedIdsSet.has(option.id);

          const percentage = getPollPercentage(
            option.voteCount,
            poll.voteCount,
          );

          return (
            <div
              key={option.id}
              className={[
                "border-2 p-4 transition",
                isSelected
                  ? "border-moss bg-moss/10"
                  : "border-outline bg-panel-deep",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {isSelected ? (
                    <CheckCircle2
                      aria-label="Tvoje volba"
                      className="shrink-0 text-moss-light"
                      size={18}
                    />
                  ) : (
                    <CircleDot
                      aria-hidden="true"
                      className="shrink-0 text-cream-muted"
                      size={18}
                    />
                  )}

                  <p className="truncate font-semibold text-cream">
                    {option.label}
                  </p>
                </div>

                <p className="font-pixel text-[9px] text-amber-light">
                  {option.voteCount} · {percentage} %
                </p>
              </div>

              <div className="mt-3 h-3 border-2 border-outline bg-panel">
                <div
                  className="h-full bg-amber transition-[width] duration-300"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!isLocked &&
      (poll.type === "yes_no" || poll.type === "single_choice") ? (
        <div className="mt-7">
          <p className="font-pixel text-[9px] text-cream">
            {ownVote ? "ZMĚNIT SVŮJ HLAS" : "VYBER SVOU ODPOVĚĎ"}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {poll.options.map((option) => {
              const isSelected = selectedIdsSet.has(option.id);

              return (
                <button
                  key={`vote-${option.id}`}
                  aria-pressed={isSelected}
                  className={[
                    "flex min-h-14 items-center justify-between border-2 px-4 text-left font-semibold transition",
                    isSelected
                      ? "border-moss bg-moss text-void"
                      : "border-outline bg-panel text-cream hover:border-amber hover:text-amber-light",
                  ].join(" ")}
                  disabled={isVoting}
                  onClick={() => {
                    void submitSingleVote(option.id);
                  }}
                  type="button"
                >
                  <span>{option.label}</span>

                  {isVoting ? (
                    <span className="font-pixel text-[8px]">UKLÁDÁM…</span>
                  ) : isSelected ? (
                    <Check aria-hidden="true" size={18} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {!isLocked && poll.type === "multiple_choice" ? (
        <MultiChoiceVoteForm
          defaultSelectedOptionIds={selectedOptionIds}
          isVoting={isVoting}
          key={`${poll.id}:${selectedOptionIdsKey}`}
          onVote={onVote}
          poll={poll}
        />
      ) : null}

      {isLocked ? (
        <div className="mt-7 flex gap-3 border-2 border-outline bg-panel p-4">
          <LockKeyhole
            aria-hidden="true"
            className="shrink-0 text-cream-muted"
            size={18}
          />

          <p className="text-sm leading-6 text-cream-muted">
            Hlasování je uzavřené. Výsledky zůstávají uložené v kronice
            LANternu.
          </p>
        </div>
      ) : null}
    </PixelPanel>
  );
}