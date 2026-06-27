import {
  CircleAlert,
  Flame,
  History,
  Sparkles,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { formatRelativeTime } from "@/lib/formatters";
import type { DiceRoll } from "@/types/dice";

type DiceHistoryProps = {
  rolls: DiceRoll[];
};

function getRollLabel(roll: DiceRoll): string {
  if (roll.rollMode === "advantage") {
    return "d20 VÝHODA";
  }

  if (roll.rollMode === "disadvantage") {
    return "d20 NEVÝHODA";
  }

  return `${roll.quantity}d${roll.dieSides}`;
}

function getRollDetails(roll: DiceRoll): string {
  const modifier =
    roll.modifier === 0
      ? ""
      : ` ${roll.modifier > 0 ? "+" : "−"} ${Math.abs(roll.modifier)}`;

  if (roll.rollMode === "standard") {
    return `${roll.individualRolls.join(", ")}${modifier}`;
  }

  return `${roll.individualRolls.join(", ")} → ${roll.keptRoll}${modifier}`;
}

export function DiceHistory({ rolls }: DiceHistoryProps) {
  if (rolls.length === 0) {
    return (
      <EmptyState
        description="Zatím nikdo nehodil žádnou kostkou. První hod zapíše začátek taverní kroniky."
        icon={History}
        title="Kronika hodů je prázdná"
      />
    );
  }

  return (
    <PixelPanel padding="none" tone="deep">
      {rolls.map((roll, index) => (
        <article
          key={roll.id}
          className={
            index === rolls.length - 1
              ? "grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              : "grid gap-4 border-b-2 border-outline p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          }
        >
          <div className="flex min-w-0 gap-3">
            <div
              className={
                roll.isCriticalHit
                  ? "grid size-11 shrink-0 place-items-center border-2 border-outline bg-moss text-void shadow-pixel-sm"
                  : roll.isCriticalFail
                    ? "grid size-11 shrink-0 place-items-center border-2 border-outline bg-wine text-cream shadow-pixel-sm"
                    : "grid size-11 shrink-0 place-items-center border-2 border-outline bg-panel-muted text-amber shadow-pixel-sm"
              }
            >
              {roll.isCriticalHit ? (
                <Flame aria-hidden="true" size={19} />
              ) : roll.isCriticalFail ? (
                <CircleAlert aria-hidden="true" size={19} />
              ) : (
                <Sparkles aria-hidden="true" size={19} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-cream">
                  {roll.rollerName}
                </p>

                <PixelBadge
                  tone={
                    roll.isCriticalHit
                      ? "moss"
                      : roll.isCriticalFail
                        ? "wine"
                        : "muted"
                  }
                >
                  {roll.isCriticalHit
                    ? "CRIT"
                    : roll.isCriticalFail
                      ? "FAIL"
                      : getRollLabel(roll)}
                </PixelBadge>
              </div>

              <p className="mt-1 text-sm leading-6 text-cream-muted">
                Hod: {getRollDetails(roll)}
              </p>

              <p className="mt-1 text-xs leading-5 text-cream-muted">
                {roll.sessionTitle
                  ? `Session: ${roll.sessionTitle}`
                  : "Volný hod"}{" "}
                · {formatRelativeTime(roll.createdAt)}
              </p>
            </div>
          </div>

          <div className="border-2 border-outline bg-panel-deep px-4 py-3 text-right shadow-pixel-sm">
            <p className="font-pixel text-lg leading-7 text-cream">
              {roll.total}
            </p>

            <p className="mt-1 font-pixel text-[7px] leading-4 text-cream-muted">
              VÝSLEDEK
            </p>
          </div>
        </article>
      ))}
    </PixelPanel>
  );
}