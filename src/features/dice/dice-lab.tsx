"use client";

import { useState } from "react";
import {
  Dices,
  RefreshCw,
} from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { DiceHistory } from "@/features/dice/dice-history";
import { DiceRoller } from "@/features/dice/dice-roller";
import { useDiceRolls } from "@/features/dice/use-dice-rolls";
import { useSessions } from "@/features/sessions/use-sessions";

function getActorName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  return displayName?.trim() || email?.split("@")[0] || "Člen party";
}

export function DiceLab() {
  const { profile, profileStatus, user } = useAuth();

  const {
    sessions,
    isLoading: areSessionsLoading,
  } = useSessions(profileStatus === "ready");

  const {
    rolls,
    isLoading: areRollsLoading,
    error,
  } = useDiceRolls(profileStatus === "ready");

  const [historySessionFilter, setHistorySessionFilter] =
    useState("all");

  if (areSessionsLoading || areRollsLoading) {
    return <LoadingState label="Probouzím kostky…" />;
  }

  if (error) {
    return (
      <PixelPanel className="max-w-2xl" padding="lg">
        <p className="font-pixel text-[10px] leading-5 text-wine-light">
          DICE ERROR
        </p>

        <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
          Kronika hodů se nepodařila načíst
        </h2>

        <p className="mt-3 text-sm leading-6 text-cream-muted">{error}</p>

        <PixelButton
          className="mt-6"
          onClick={() => window.location.reload()}
          variant="moss"
        >
          <RefreshCw aria-hidden="true" size={16} />
          Obnovit stránku
        </PixelButton>
      </PixelPanel>
    );
  }

  if (!user) {
    return null;
  }

  const actor = {
    id: user.uid,
    name: getActorName(profile?.displayName, user.email),
  };

  const visibleRolls =
    historySessionFilter === "all"
      ? rolls
      : rolls.filter((roll) => roll.sessionId === historySessionFilter);

  return (
    <div className="grid gap-8">
      <PixelPanel className="pixel-grid" tone="deep">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-pixel text-[9px] leading-5 text-amber-light">
              RNG SANCTUARY
            </p>

            <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
              Dice Lab
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
              Digitální kostky pro momenty, kdy je fyzický d20 pod gaučem,
              v jiné místnosti nebo se podezřele rozhodl zmizet.
            </p>
          </div>

          <div className="grid size-14 place-items-center border-2 border-outline bg-amber text-void shadow-pixel">
            <Dices aria-hidden="true" size={27} />
          </div>
        </div>
      </PixelPanel>

      <DiceRoller actor={actor} sessions={sessions} />

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-pixel text-[9px] leading-5 text-cream-muted">
              KRONIKA HODŮ
            </p>

            <p className="mt-1 text-sm text-cream-muted">
              Posledních {visibleRolls.length} hodů party.
            </p>
          </div>

          <div className="grid min-w-64 gap-2">
            <label
              className="font-pixel text-[8px] leading-4 text-cream-muted"
              htmlFor="dice-history-session-filter"
            >
              FILTR SESSION
            </label>

            <select
              className="border-2 border-outline bg-panel px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0/0.35)] focus:border-amber focus:outline-none"
              id="dice-history-session-filter"
              onChange={(event) =>
                setHistorySessionFilter(event.target.value)
              }
              value={historySessionFilter}
            >
              <option value="all">Všechny hody</option>
              <option value="none">Pouze volné hody</option>

              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DiceHistory
          rolls={
            historySessionFilter === "none"
              ? rolls.filter((roll) => roll.sessionId === null)
              : visibleRolls
          }
        />
      </section>
    </div>
  );
}