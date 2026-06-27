import {
  ArrowRight,
  Clock3,
  ReceiptText,
} from "lucide-react";

import { PixelBadge } from "@/components/ui/pixel-badge";
import { DebtResolutionActions } from "@/features/debts/debt-resolution-actions";
import type { DebtActor } from "@/features/debts/debt-service";
import { DebtPaymentActions } from "@/features/payments/debt-payment-actions";
import { formatExpenseDate } from "@/lib/formatters";
import { formatCzkFromCents } from "@/lib/money";
import type { Debt, DebtStatus } from "@/types/debt";
import type { AppSettings } from "@/types/settings";

type DebtRowProps = {
  debt: Debt;
  isAdmin: boolean;
  actor: DebtActor | null;
  settings: AppSettings | null;
};

const statusLabels: Record<DebtStatus, string> = {
  open: "OTEVŘENO",
  pending: "ČEKÁ NA POTVRZENÍ",
  paid: "ZAPLACENO",
  forgiven: "ODPUŠTĚNO",
};

const statusTones: Record<
  DebtStatus,
  "amber" | "moss" | "wine" | "muted"
> = {
  open: "wine",
  pending: "amber",
  paid: "moss",
  forgiven: "muted",
};

export function DebtRow({
  debt,
  isAdmin,
  actor,
  settings,
}: DebtRowProps) {
  return (
    <article className="grid gap-4 border-b-2 border-outline p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="flex min-w-0 gap-3">
        <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-panel-muted text-amber shadow-pixel-sm">
          <ReceiptText aria-hidden="true" size={19} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-cream">
              {debt.fromUserName}
            </p>

            <ArrowRight
              aria-hidden="true"
              className="text-cream-muted"
              size={16}
            />

            <p className="text-sm font-semibold text-cream">
              {debt.toUserName}
            </p>

            <PixelBadge tone={statusTones[debt.status]}>
              {statusLabels[debt.status]}
            </PixelBadge>
          </div>

          <p className="mt-2 text-sm leading-6 text-cream-muted">
            Session: {debt.sessionTitle}
          </p>

          {debt.note ? (
            <p className="mt-1 text-xs leading-5 text-cream-muted">
              {debt.note}
            </p>
          ) : null}

          <div className="mt-2 flex items-center gap-2 text-xs text-cream-muted">
            <Clock3 aria-hidden="true" size={14} />
            <span>{formatExpenseDate(debt.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <div className="border-2 border-outline bg-panel-deep px-4 py-3 text-right shadow-pixel-sm">
          <p className="font-pixel text-[11px] leading-5 text-cream">
            {formatCzkFromCents(debt.amountCents)}
          </p>

          <p className="mt-1 text-[11px] text-cream-muted">
            {debt.status === "pending"
              ? "Platba čeká na potvrzení"
              : debt.status === "paid"
                ? `Potvrdil ${debt.settledByName ?? "admin"}`
                : debt.status === "forgiven"
                  ? `Odpustil ${debt.settledByName ?? "admin"}`
                  : "Čeká na vyrovnání"}
          </p>
        </div>

        {actor ? (
          <DebtPaymentActions
            actor={actor}
            debt={debt}
            settings={settings}
          />
        ) : null}

        {isAdmin && actor ? (
          <DebtResolutionActions actor={actor} debt={debt} />
        ) : null}
      </div>
    </article>
  );
}