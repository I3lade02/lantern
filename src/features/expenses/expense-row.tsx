"use client";

import { Pencil, ReceiptText, UsersRound } from "lucide-react";

import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { ExpenseDeleteButton } from "@/features/expenses/expense-delete-button";
import type { ExpenseActor } from "@/features/expenses/expense-service";
import { formatExpenseDate } from "@/lib/formatters";
import { formatCzkFromCents } from "@/lib/money";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_SPLIT_TYPE_LABELS,
  type Expense,
} from "@/types/expense";

type ExpenseRowProps = {
  expense: Expense;
  isAdmin: boolean;
  actor: ExpenseActor | null;
  onEdit: (expense: Expense) => void;
  sessionTitle?: string;
  showSession?: boolean;
};

function getParticipantLabel(expense: Expense): string {
  if (expense.shares.length === 1) {
    return expense.shares[0].userName;
  }

  if (expense.shares.length <= 3) {
    return expense.shares.map((share) => share.userName).join(", ");
  }

  return `${expense.shares
    .slice(0, 2)
    .map((share) => share.userName)
    .join(", ")} +${expense.shares.length - 2}`;
}

export function ExpenseRow({
  expense,
  isAdmin,
  actor,
  onEdit,
  sessionTitle,
  showSession = false,
}: ExpenseRowProps) {
  return (
    <article className="grid gap-4 border-b-2 border-outline p-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 gap-3">
        <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-panel-muted text-amber shadow-pixel-sm">
          <ReceiptText aria-hidden="true" size={19} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-cream">
              {expense.title}
            </p>

            <PixelBadge tone="muted">
              {EXPENSE_CATEGORY_LABELS[expense.category]}
            </PixelBadge>
          </div>

          <p className="mt-1 text-xs leading-5 text-cream-muted">
            Zaplatil {expense.payerName} · {formatExpenseDate(expense.createdAt)}
          </p>

          {showSession && sessionTitle ? (
            <p className="mt-1 text-xs leading-5 text-amber-light">
              Session: {sessionTitle}
            </p>
          ) : null}

          {expense.note ? (
            <p className="mt-2 text-sm leading-6 text-cream-muted">
              {expense.note}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="min-w-36 border-2 border-outline bg-panel-deep px-3 py-2 text-right shadow-pixel-sm">
          <p className="font-pixel text-[10px] leading-5 text-cream">
            {formatCzkFromCents(expense.amountCents)}
          </p>

          <p className="mt-1 text-[11px] leading-4 text-cream-muted">
            {EXPENSE_SPLIT_TYPE_LABELS[expense.splitType]}
          </p>
        </div>

        <div
          className="flex max-w-52 items-center gap-2 text-xs leading-5 text-cream-muted"
          title={expense.shares
            .map(
              (share) =>
                `${share.userName}: ${formatCzkFromCents(share.amountCents)}`,
            )
            .join(", ")}
        >
          <UsersRound aria-hidden="true" className="shrink-0" size={15} />
          <span className="line-clamp-2">{getParticipantLabel(expense)}</span>
        </div>

        {isAdmin ? (
          <div className="flex gap-2">
            <PixelButton
              aria-label={`Upravit útratu ${expense.title}`}
              className="px-3!"
              onClick={() => onEdit(expense)}
              size="sm"
              variant="amber"
            >
              <Pencil aria-hidden="true" size={15} />
            </PixelButton>

            {actor ? (
              <ExpenseDeleteButton actor={actor} expense={expense} />
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}