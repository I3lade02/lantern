"use client";

import Link from "next/link";
import { HandCoins } from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { useDebts } from "@/features/debts/use-debts";
import { formatCzkFromCents } from "@/lib/money";

type SessionDebtSummaryProps = {
  sessionId: string;
};

export function SessionDebtSummary({
  sessionId,
}: SessionDebtSummaryProps) {
  const { profileStatus } = useAuth();

  const { debts, isLoading } = useDebts(profileStatus === "ready");

  if (isLoading) {
    return <LoadingState label="Načítám dluhy session…" />;
  }

  const sessionDebts = debts.filter((debt) => debt.sessionId === sessionId);

  const activeDebts = sessionDebts.filter(
    (debt) => debt.status === "open" || debt.status === "pending",
  );

  const totalOpenCents = activeDebts.reduce(
    (total, debt) => total + debt.amountCents,
    0,
  );

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-pixel text-[9px] leading-5 text-cream-muted">
          SOUHRN DLUHŮ
        </p>

        <Link
          className="font-pixel text-[8px] leading-4 text-amber-light underline underline-offset-4 hover:text-amber"
          href="/debts"
        >
          OTEVŘÍT DLUHY
        </Link>
      </div>

      <PixelPanel tone="deep">
        {activeDebts.length === 0 ? (
          <div className="flex gap-4">
            <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-moss text-void shadow-pixel-sm">
              <HandCoins aria-hidden="true" size={20} />
            </div>

            <div>
              <h2 className="font-pixel text-[10px] leading-6 text-cream">
                Žádné otevřené dluhy
              </h2>

              <p className="mt-2 text-sm leading-6 text-cream-muted">
                Buď ještě nebyl vytvořen settlement, nebo už jsou všechny
                převody uzavřené.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-outline-soft pb-4">
              <div>
                <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                  OTEVŘENÉ PŘEVODY
                </p>

                <p className="mt-2 font-pixel text-sm leading-7 text-cream">
                  {formatCzkFromCents(totalOpenCents)}
                </p>
              </div>

              <PixelBadge tone="wine">
                {activeDebts.length} OTEVŘENÝCH
              </PixelBadge>
            </div>

            {activeDebts.slice(0, 3).map((debt) => (
              <div
                key={debt.id}
                className="flex items-center justify-between gap-4"
              >
                <p className="text-sm text-cream">
                  {debt.fromUserName} → {debt.toUserName}
                </p>

                <p className="font-pixel text-[9px] leading-5 text-amber-light">
                  {formatCzkFromCents(debt.amountCents)}
                </p>
              </div>
            ))}
          </div>
        )}
      </PixelPanel>
    </section>
  );
}