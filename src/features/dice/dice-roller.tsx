"use client";

import { useState } from "react";
import {
  Dices,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { toast } from "@/components/ui/pixel-toast";
import {
  createDiceRollDraft,
  getDiceErrorMessage,
  saveDiceRoll,
  type DiceActor,
} from "@/features/dice/dice-service";
import { DiceResult } from "@/features/dice/dice-result";
import type {
  DiceRollDraft,
  DiceRollMode,
  DieSides,
} from "@/types/dice";
import { DICE_SIDES } from "@/types/dice";
import type { Session } from "@/types/session";

type DiceRollerProps = {
  actor: DiceActor;
  sessions: Session[];
};

const inputClassName =
  "w-full border-2 border-outline bg-panel-deep px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0_/_0.35)] focus:border-amber focus:outline-none";

const modeOptions: Array<{
  value: DiceRollMode;
  label: string;
}> = [
  {
    value: "standard",
    label: "Normálně",
  },
  {
    value: "advantage",
    label: "Výhoda",
  },
  {
    value: "disadvantage",
    label: "Nevýhoda",
  },
];

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

export function DiceRoller({
  actor,
  sessions,
}: DiceRollerProps) {
  const [dieSides, setDieSides] = useState<DieSides>(20);
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollMode, setRollMode] =
    useState<DiceRollMode>("standard");

  const [sessionId, setSessionId] = useState("");
  const [latestRoll, setLatestRoll] =
    useState<DiceRollDraft | null>(null);

  const [isRolling, setIsRolling] = useState(false);
  const [rollKey, setRollKey] = useState(0);

  const isSpecialD20Mode =
    rollMode === "advantage" ||
    rollMode === "disadvantage";

  const selectedSession =
    sessions.find((session) => session.id === sessionId) ?? null;

  function handleDieSidesChange(nextSides: DieSides) {
    setDieSides(nextSides);

    if (nextSides !== 20) {
      setRollMode("standard");
    }
  }

  function handleModeChange(nextMode: DiceRollMode) {
    if (nextMode !== "standard") {
      setDieSides(20);
      setQuantity(1);
    }

    setRollMode(nextMode);
  }

  function updateQuantity(delta: number) {
    if (isSpecialD20Mode) {
      return;
    }

    setQuantity((currentQuantity) =>
      Math.min(20, Math.max(1, currentQuantity + delta)),
    );
  }

  async function handleRoll() {
    if (isRolling) {
      return;
    }

    if (!Number.isInteger(modifier) || modifier < -100 || modifier > 100) {
      toast.error("Modifier musí být celé číslo od -100 do 100.");
      return;
    }

    const nextRoll = createDiceRollDraft({
      actor,
      dieSides,
      quantity: isSpecialD20Mode ? 1 : quantity,
      modifier,
      rollMode,
      sessionId: selectedSession?.id ?? null,
      sessionTitle: selectedSession?.title ?? null,
    });

    setLatestRoll(nextRoll);
    setRollKey((currentKey) => currentKey + 1);
    setIsRolling(true);

    try {
      await wait(620);
      await saveDiceRoll(nextRoll);

      toast.success("Hod byl zapsán do kroniky.");
    } catch (error) {
      toast.error(getDiceErrorMessage(error));
    } finally {
      setIsRolling(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(0,1.25fr)]">
      <PixelPanel tone="deep">
        <p className="font-pixel text-[9px] leading-5 text-amber-light">
          DICE CONSOLE
        </p>

        <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
          Připrav svůj hod
        </h2>

        <div className="mt-6">
          <p className="font-pixel text-[8px] leading-4 text-cream-muted">
            TYP KOSTKY
          </p>

          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7 xl:grid-cols-4">
            {DICE_SIDES.map((sides) => (
              <button
                key={sides}
                className={
                  dieSides === sides
                    ? "border-2 border-outline bg-amber px-2 py-3 font-pixel text-[9px] text-void shadow-pixel-sm"
                    : "border-2 border-outline bg-panel px-2 py-3 font-pixel text-[9px] text-cream-muted transition-colors hover:bg-panel-muted hover:text-cream"
                }
                onClick={() => handleDieSidesChange(sides)}
                type="button"
              >
                d{sides}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="font-pixel text-[8px] leading-4 text-cream-muted">
            REŽIM HODU
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            {modeOptions.map((option) => {
              const disabled =
                option.value !== "standard" && dieSides !== 20;

              const isActive = rollMode === option.value;

              return (
                <button
                  key={option.value}
                  className={
                    isActive
                      ? "border-2 border-outline bg-moss px-3 py-3 font-pixel text-[8px] text-void shadow-pixel-sm"
                      : "border-2 border-outline bg-panel px-3 py-3 font-pixel text-[8px] text-cream-muted transition-colors hover:bg-panel-muted hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
                  }
                  disabled={disabled}
                  onClick={() => handleModeChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {dieSides !== 20 ? (
            <p className="mt-3 text-xs leading-5 text-cream-muted">
              Výhoda a nevýhoda jsou dostupné pouze pro d20.
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <div>
            <p className="font-pixel text-[8px] leading-4 text-cream-muted">
              POČET KOSTEK
            </p>

            <div className="mt-3 flex items-center gap-2">
              <PixelButton
                aria-label="Odebrat kostku"
                className="px-3!"
                disabled={quantity <= 1 || isSpecialD20Mode}
                onClick={() => updateQuantity(-1)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Minus aria-hidden="true" size={15} />
              </PixelButton>

              <div className="flex-1 border-2 border-outline bg-panel-deep px-3 py-3 text-center font-pixel text-sm text-cream shadow-pixel-sm">
                {isSpecialD20Mode ? 1 : quantity}
              </div>

              <PixelButton
                aria-label="Přidat kostku"
                className="px-3!"
                disabled={quantity >= 20 || isSpecialD20Mode}
                onClick={() => updateQuantity(1)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Plus aria-hidden="true" size={15} />
              </PixelButton>
            </div>

            {isSpecialD20Mode ? (
              <p className="mt-3 text-xs leading-5 text-cream-muted">
                Výhoda i nevýhoda používají vždy jeden d20 hod ze dvou kostek.
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="font-pixel text-[8px] leading-4 text-cream-muted"
              htmlFor="dice-modifier"
            >
              MODIFIER
            </label>

            <input
              className={`${inputClassName} mt-3`}
              id="dice-modifier"
              max={100}
              min={-100}
              onChange={(event) => {
                const nextModifier = Number(event.target.value);

                setModifier(
                  Number.isFinite(nextModifier)
                    ? Math.trunc(nextModifier)
                    : 0,
                );
              }}
              type="number"
              value={modifier}
            />
          </div>
        </div>

        <div className="mt-6">
          <label
            className="font-pixel text-[8px] leading-4 text-cream-muted"
            htmlFor="dice-session"
          >
            PŘIŘADIT K SESSION
          </label>

          <select
            className={`${inputClassName} mt-3`}
            id="dice-session"
            onChange={(event) => setSessionId(event.target.value)}
            value={sessionId}
          >
            <option value="">Volný hod bez session</option>

            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </select>
        </div>

        <PixelButton
          className="mt-8"
          disabled={isRolling}
          fullWidth
          onClick={handleRoll}
          variant="amber"
        >
          {isRolling ? (
            <Sparkles aria-hidden="true" size={17} />
          ) : (
            <Dices aria-hidden="true" size={17} />
          )}

          {isRolling ? "Kostky letí…" : "Hodit kostkou"}
        </PixelButton>
      </PixelPanel>

      <DiceResult
        isRolling={isRolling}
        roll={latestRoll}
        rollKey={rollKey}
      />
    </div>
  );
}