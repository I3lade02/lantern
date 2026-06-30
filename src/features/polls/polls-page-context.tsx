"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Check,
  LoaderCircle,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelModal } from "@/components/ui/pixel-modal";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { toast } from "@/components/ui/pixel-toast";
import { useAuth } from "@/features/auth/auth-provider";
import {
  closePoll,
  createPoll,
  getPollApiErrorMessage,
  voteInPoll,
  type CreatePollInput,
} from "@/features/polls/poll-api";
import { PollCard } from "@/features/polls/poll-card";
import { PollCreateForm } from "@/features/polls/poll-create-form";
import { isPollLocked } from "@/features/polls/poll-utils";
import { useOwnPollVotes } from "@/features/polls/use-own-poll-votes";
import { usePolls } from "@/features/polls/use-polls";
import type { Poll } from "@/types/poll";

export function PollsPageContent() {
  const {
    profile,
    user,
  } = useAuth();

  const {
    polls,
    isLoading,
    error,
  } = usePolls();

  const ownVotes = useOwnPollVotes(
    user?.uid ?? null,
    polls.map((poll) => poll.id),
  );

  const [isCreating, setIsCreating] =
    useState(false);

  const [votingPollId, setVotingPollId] =
    useState<string | null>(null);

  const [pollToClose, setPollToClose] =
    useState<Poll | null>(null);

  const [isClosing, setIsClosing] =
    useState(false);

  const isAdmin = profile?.role === "admin";

  const {
    activePolls,
    archivedPolls,
  } = useMemo(
    () => ({
      activePolls: polls.filter(
        (poll) => !isPollLocked(poll),
      ),

      archivedPolls: polls.filter((poll) =>
        isPollLocked(poll),
      ),
    }),
    [polls],
  );

  async function handleCreate(
    input: CreatePollInput,
  ): Promise<boolean> {
    setIsCreating(true);

    try {
      await createPoll(input);

      toast.success("Nová anketa byla spuštěna.");
      return true;
    } catch (createError) {
      toast.error(
        getPollApiErrorMessage(createError),
      );

      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function handleVote(
    poll: Poll,
    selectedOptionIds: string[],
  ): Promise<void> {
    setVotingPollId(poll.id);

    try {
      await voteInPoll(
        poll.id,
        selectedOptionIds,
      );

      toast.success(
        "Hlas byl uložen do kroniky.",
      );
    } catch (voteError) {
      toast.error(
        getPollApiErrorMessage(voteError),
      );
    } finally {
      setVotingPollId(null);
    }
  }

  async function handleClosePoll() {
    if (!pollToClose) {
      return;
    }

    setIsClosing(true);

    try {
      await closePoll(pollToClose.id);

      toast.success("Anketa byla uzavřena.");
      setPollToClose(null);
    } catch (closeError) {
      toast.error(
        getPollApiErrorMessage(closeError),
      );
    } finally {
      setIsClosing(false);
    }
  }

  if (isLoading) {
    return (
      <LoadingState label="Rozbaluji hlasovací urnu…" />
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <PixelPanel tone="deep">
          <p className="font-pixel text-[10px] text-wine-light">
            POLL SYSTEM ERROR
          </p>

          <h1 className="mt-4 font-pixel text-base text-cream">
            Ankety se nepodařilo načíst
          </h1>

          <p className="mt-4 text-sm leading-7 text-cream-muted">
            {error}
          </p>
        </PixelPanel>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 pb-16">
        <section className="flex flex-col gap-5 border-b-2 border-outline pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-pixel text-[10px] leading-6 text-amber-light">
              PARTY DECISIONS
            </p>

            <h1 className="mt-3 font-pixel text-xl leading-10 text-cream">
              Ankety
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-cream-muted">
              Rozhodování pro celou partu, bez papírků,
              chaosu a hlasování z vedlejšího pokoje.
            </p>
          </div>

          <PixelBadge
            tone={
              activePolls.length > 0
                ? "amber"
                : "muted"
            }
          >
            {activePolls.length === 1
              ? "1 AKTIVNÍ"
              : `${activePolls.length} AKTIVNÍ`}
          </PixelBadge>
        </section>

        <div className="mt-8 grid gap-8">
          <PollCreateForm
            isSubmitting={isCreating}
            onCreate={handleCreate}
          />

          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-pixel text-[9px] text-moss-light">
                  OPEN POLLS
                </p>

                <h2 className="mt-2 font-pixel text-[12px] text-cream">
                  Aktivní hlasování
                </h2>
              </div>

              <span className="text-sm text-cream-muted">
                Živé výsledky se aktualizují okamžitě.
              </span>
            </div>

            {activePolls.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  description="Momentálně není otevřená žádná anketa. Vzduch je podezřele klidný."
                  title="Žádné aktivní hlasování"
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-5">
                {activePolls.map((poll) => (
                  <PollCard
                    isAdmin={isAdmin}
                    isClosing={
                      isClosing &&
                      pollToClose?.id === poll.id
                    }
                    isVoting={votingPollId === poll.id}
                    key={poll.id}
                    onRequestClose={setPollToClose}
                    onVote={handleVote}
                    ownVote={ownVotes[poll.id] ?? null}
                    poll={poll}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="border-t-2 border-outline pt-8">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center border-2 border-outline bg-panel-deep text-cream-muted">
                <Archive aria-hidden="true" size={18} />
              </div>

              <div>
                <p className="font-pixel text-[9px] text-cream-muted">
                  POLL ARCHIVE
                </p>

                <h2 className="mt-1 font-pixel text-[12px] text-cream">
                  Uzavřené ankety
                </h2>
              </div>
            </div>

            {archivedPolls.length === 0 ? (
              <p className="mt-5 text-sm leading-7 text-cream-muted">
                Archiv je zatím prázdný. První velké
                rozhodnutí teprve čeká za rohem.
              </p>
            ) : (
              <div className="mt-5 grid gap-5">
                {archivedPolls.map((poll) => (
                  <PollCard
                    isAdmin={isAdmin}
                    isClosing={false}
                    isVoting={false}
                    key={poll.id}
                    onRequestClose={setPollToClose}
                    onVote={handleVote}
                    ownVote={ownVotes[poll.id] ?? null}
                    poll={poll}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {pollToClose ? (
        <PixelModal
          description="Po uzavření už nikdo nezmění ani neodešle svůj hlas. Výsledky zůstanou viditelné v archivu."
          onClose={() => {
            if (!isClosing) {
              setPollToClose(null);
            }
          }}
          open
          size="sm"
          title="Uzavřít hlasování?"
        >
          <div className="border-2 border-outline bg-panel-deep p-4">
            <p className="font-pixel text-[9px] text-cream-muted">
              ANKETA
            </p>

            <p className="mt-2 text-sm font-semibold leading-6 text-cream">
              {pollToClose.question}
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <PixelButton
              disabled={isClosing}
              onClick={() => setPollToClose(null)}
              variant="ghost"
            >
              Zrušit
            </PixelButton>

            <PixelButton
              disabled={isClosing}
              onClick={() => {
                void handleClosePoll();
              }}
              variant="wine"
            >
              {isClosing ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={16}
                />
              ) : (
                <Check aria-hidden="true" size={16} />
              )}

              {isClosing
                ? "Uzavírám…"
                : "Ano, uzavřít"}
            </PixelButton>
          </div>
        </PixelModal>
      ) : null}
    </>
  );
}