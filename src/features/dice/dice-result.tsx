"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  CircleAlert,
  Flame,
  Sparkles,
  Swords,
} from "lucide-react";

import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { PixelDie } from "@/features/dice/pixel-die";
import type { DiceRollDraft } from "@/types/dice";

type DiceResultProps = {
  roll: DiceRollDraft | null;
  isRolling: boolean;
  rollKey: number;
};

function getModeLabel(roll: DiceRollDraft): string {
  if (roll.rollMode === "advantage") {
    return "S VÝHODOU";
  }

  if (roll.rollMode === "disadvantage") {
    return "S NEVÝHODOU";
  }

  return "STANDARDNÍ HOD";
}

function getExpression(roll: DiceRollDraft): string {
  const dicePart =
    roll.rollMode === "standard"
      ? `${roll.quantity}d${roll.dieSides}`
      : `d20 ${roll.rollMode === "advantage" ? "výhoda" : "nevýhoda"}`;

  if (roll.modifier === 0) {
    return dicePart;
  }

  return `${dicePart} ${roll.modifier > 0 ? "+" : "−"} ${Math.abs(
    roll.modifier,
  )}`;
}

export function DiceResult({
  roll,
  isRolling,
  rollKey,
}: DiceResultProps) {
  if (!roll) {
    return (
      <PixelPanel className="pixel-grid min-h-92" tone="deep">
        <div className="grid min-h-76 place-items-center text-center">
          <div>
            <div className="mx-auto grid size-16 place-items-center border-2 border-outline bg-panel-muted text-amber shadow-pixel">
              <Swords aria-hidden="true" size={28} />
            </div>

            <h2 className="mt-6 font-pixel text-sm leading-8 text-cream">
              Kostky čekají na povel
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-cream-muted">
              Vyber kostku, případně modifier, a pošli ji do digitální propasti.
            </p>
          </div>
        </div>
      </PixelPanel>
    );
  }

  const isSpecialRoll =
    roll.rollMode === "advantage" ||
    roll.rollMode === "disadvantage";

  return (
    <PixelPanel className="pixel-grid overflow-hidden" padding="none" tone="deep">
      <AnimatePresence mode="wait">
        <motion.div
          key={rollKey}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8"
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.22 }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <PixelBadge
                  tone={
                    roll.isCriticalHit
                      ? "moss"
                      : roll.isCriticalFail
                        ? "wine"
                        : "amber"
                  }
                >
                  {roll.isCriticalHit
                    ? "CRITICAL HIT"
                    : roll.isCriticalFail
                      ? "CRITICAL FAIL"
                      : getModeLabel(roll)}
                </PixelBadge>

                <p className="font-pixel text-[9px] leading-5 text-amber-light">
                  {getExpression(roll)}
                </p>
              </div>

              <div className="mt-5 flex items-end gap-4">
                <p
                  className={
                    roll.isCriticalHit
                      ? "font-pixel text-5xl leading-none text-moss-light"
                      : roll.isCriticalFail
                        ? "font-pixel text-5xl leading-none text-wine-light"
                        : "font-pixel text-5xl leading-none text-cream"
                  }
                >
                  {roll.total}
                </p>

                <div className="pb-1">
                  <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                    VÝSLEDEK
                  </p>

                  <p className="mt-1 text-sm text-cream-muted">
                    {roll.modifier === 0
                      ? "Bez modifieru"
                      : `Modifier ${roll.modifier > 0 ? "+" : ""}${roll.modifier}`}
                  </p>
                </div>
              </div>

              {roll.isCriticalHit ? (
                <div className="mt-5 flex gap-3 border-2 border-moss bg-moss-dark/40 p-3">
                  <Flame
                    aria-hidden="true"
                    className="shrink-0 text-moss-light"
                    size={18}
                  />

                  <p className="text-sm leading-6 text-cream">
                    Přirozená dvacítka. Kritický úspěch, hostinský právě tleská.
                  </p>
                </div>
              ) : null}

              {roll.isCriticalFail ? (
                <div className="mt-5 flex gap-3 border-2 border-wine bg-wine-dark/40 p-3">
                  <CircleAlert
                    aria-hidden="true"
                    className="shrink-0 text-wine-light"
                    size={18}
                  />

                  <p className="text-sm leading-6 text-cream">
                    Přirozená jednička. Kostka si dnes vzala volno.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-4">
              {roll.individualRolls.map((value, index) => (
                <PixelDie
                  key={`${rollKey}-${index}-${value}`}
                  isKept={
                    isSpecialRoll &&
                    value === roll.keptRoll &&
                    index ===
                      roll.individualRolls.findIndex(
                        (rollValue) => rollValue === roll.keptRoll,
                      )
                  }
                  isRolling={isRolling}
                  sides={roll.dieSides}
                  value={value}
                />
              ))}
            </div>
          </div>

          {isSpecialRoll ? (
            <div className="mt-7 border-t-2 border-outline-soft pt-5">
              <div className="flex items-center gap-3 text-sm leading-6 text-cream-muted">
                <Sparkles aria-hidden="true" className="text-amber-light" size={17} />

                <p>
                  Hozeno:{" "}
                  <span className="font-semibold text-cream">
                    {roll.individualRolls.join(", ")}
                  </span>
                  . Použitý hod:{" "}
                  <span className="font-semibold text-amber-light">
                    {roll.keptRoll}
                  </span>
                  .
                </p>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </PixelPanel>
  );
}