import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, HandCoins } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { formatCzkFromCents } from "@/lib/money";
import type { Debt } from "@/types/debt";

type DashboardDebtSummaryProps = {
  debts: Debt[];
  userId: string;
};

export function DashboardDebtSummary({
  debts,
  userId,
}: DashboardDebtSummaryProps) {
  const activeDebts = debts.filter(
    (debt) => debt.status === "open" || debt.status === "pending",
  );

  const debtsToPay = activeDebts.filter(
    (debt) => debt.fromUserId === userId,
  );

  const debtsToReceive = activeDebts.filter(
    (debt) => debt.toUserId === userId,
  );

  const totalToPay = debtsToPay.reduce(
    (total, debt) => total + debt.amountCents,
    0,
  );

  const totalToReceive = debtsToReceive.reduce(
    (total, debt) => total + debt.amountCents,
    0,
  );

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-pixel text-[9px] leading-5 text-cream-muted">
          PŘEHLED DLUHŮ
        </p>

        <Link
          className="font-pixel text-[8px] leading-4 text-amber-light underline underline-offset-4 hover:text-amber"
          href="/debts"
        >
          ZOBRAZIT VŠE
        </Link>
      </div>

      {activeDebts.length === 0 ? (
        <EmptyState
          action={
            <Link
              className="border-2 border-outline bg-amber px-4 py-3 font-pixel text-[9px] text-void shadow-pixel-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              href="/expenses"
            >
              Přidat útratu
            </Link>
          }
          description="Zatím žádné otevřené dluhy. Až vytvoříš settlement z útrat session, vyrovnání se objeví právě tady."
          icon={HandCoins}
          title="Pokladna je vyrovnaná"
        />
      ) : (
        <PixelPanel padding="none" tone="deep">
          <div className="grid sm:grid-cols-2">
            <div className="border-b-2 border-outline p-5 sm:border-b-0 sm:border-r-2">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center border-2 border-outline bg-wine text-cream shadow-pixel-sm">
                  <ArrowUpRight aria-hidden="true" size={18} />
                </div>

                <div>
                  <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                    TY DLUŽÍŠ
                  </p>

                  <p className="mt-1 font-pixel text-sm leading-7 text-cream">
                    {formatCzkFromCents(totalToPay)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center border-2 border-outline bg-moss text-void shadow-pixel-sm">
                  <ArrowDownLeft aria-hidden="true" size={18} />
                </div>

                <div>
                  <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                    DLUŽÍ TOBĚ
                  </p>

                  <p className="mt-1 font-pixel text-sm leading-7 text-cream">
                    {formatCzkFromCents(totalToReceive)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-outline">
            {debtsToPay.slice(0, 2).map((debt) => (
              <div
                key={debt.id}
                className="flex items-center justify-between gap-4 border-b-2 border-outline p-4 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-cream">
                    Poslat {debt.toUserName}
                  </p>

                  <p className="mt-1 text-xs text-cream-muted">
                    {debt.note || debt.sessionTitle}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-pixel text-[10px] leading-5 text-cream">
                    {formatCzkFromCents(debt.amountCents)}
                  </p>

                  <PixelBadge
                    className="mt-2"
                    tone={debt.status === "pending" ? "amber" : "wine"}
                  >
                    {debt.status === "pending" ? "ČEKÁ" : "OTEVŘENO"}
                  </PixelBadge>
                </div>
              </div>
            ))}

            {debtsToPay.length === 0 ? (
              <div className="p-4 text-sm text-cream-muted">
                Aktuálně nikomu nic nedlužíš.
              </div>
            ) : null}
          </div>
        </PixelPanel>
      )}
    </section>
  );
}