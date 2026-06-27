"use client";

import { useState } from "react";
import { BadgeCheck, HeartHandshake } from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import {
  getDebtErrorMessage,
  resolveDebt,
  type DebtActor,
} from "@/features/debts/debt-service";
import { formatCzkFromCents } from "@/lib/money";
import type { Debt } from "@/types/debt";

type DebtResolutionActionsProps = {
  debt: Debt;
  actor: DebtActor;
};

type Resolution = "paid" | "forgiven";

export function DebtResolutionActions({
  debt,
  actor,
}: DebtResolutionActionsProps) {
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!resolution) {
      return;
    }

    setIsSubmitting(true);

    try {
      await resolveDebt(debt, resolution, actor);

      toast.success(
        resolution === "paid"
          ? "Dluh byl označen jako zaplacený."
          : "Dluh byl odpuštěn.",
      );

      setResolution(null);
    } catch (error) {
      toast.error(getDebtErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isOpen = debt.status === "open" || debt.status === "pending";

  if (!isOpen) {
    return null;
  }

  const isPaid = resolution === "paid";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PixelButton
          className="px-3!"
          onClick={() => setResolution("paid")}
          size="sm"
          variant="moss"
        >
          <BadgeCheck aria-hidden="true" size={15} />
          Zaplaceno
        </PixelButton>

        <PixelButton
          className="px-3!"
          onClick={() => setResolution("forgiven")}
          size="sm"
          variant="wine"
        >
          <HeartHandshake aria-hidden="true" size={15} />
          Odpustit
        </PixelButton>
      </div>

      <PixelModal
        description="Tato změna se uloží do historie vyrovnání."
        onClose={() => setResolution(null)}
        open={resolution !== null}
        size="sm"
        title={isPaid ? "Označit jako zaplacené?" : "Odpustit dluh?"}
      >
        <p className="text-sm leading-6 text-cream-muted">
          Potvrdit změnu dluhu{" "}
          <span className="font-semibold text-cream">
            {debt.fromUserName} → {debt.toUserName}
          </span>{" "}
          za{" "}
          <span className="font-semibold text-cream">
            {formatCzkFromCents(debt.amountCents)}
          </span>
          ?
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <PixelButton
            disabled={isSubmitting}
            onClick={() => setResolution(null)}
            variant="ghost"
          >
            Zrušit
          </PixelButton>

          <PixelButton
            disabled={isSubmitting}
            onClick={handleConfirm}
            variant={isPaid ? "moss" : "wine"}
          >
            {isPaid ? (
              <BadgeCheck aria-hidden="true" size={16} />
            ) : (
              <HeartHandshake aria-hidden="true" size={16} />
            )}

            {isSubmitting
              ? "Ukládám…"
              : isPaid
                ? "Ano, zaplaceno"
                : "Ano, odpustit"}
          </PixelButton>
        </div>
      </PixelModal>
    </>
  );
}