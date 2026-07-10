"use client";

import { useMemo } from "react";
import { ReceiptText, UserRound } from "lucide-react";

import { PixelPanel } from "@/components/ui/pixel-panel";
import { formatCzkFromCents } from "@/lib/money";
import type { Expense } from "@/types/expense";

type ExpenseMemberTotalsProps = {
  expenses: Expense[];
  currentUserId: string | null;
  title: string;
  description?: string;
};

type MemberExpenseTotal = {
  userId: string;
  userName: string;
  amountCents: number;
  itemCount: number;
};

function formatItemCount(count: number): string {
  if (count === 1) {
    return "1 položka";
  }

  if (count >= 2 && count <= 4) {
    return `${count} položky`;
  }

  return `${count} položek`;
}

function getMemberExpenseTotals(
  expenses: Expense[],
): MemberExpenseTotal[] {
  const totals = new Map<string, MemberExpenseTotal>();

  for (const expense of expenses) {
    for (const share of expense.shares) {
      const existingTotal = totals.get(share.userId);

      if (existingTotal) {
        existingTotal.amountCents += share.amountCents;
        existingTotal.itemCount += 1;
        existingTotal.userName = share.userName;

        continue;
      }

      totals.set(share.userId, {
        userId: share.userId,
        userName: share.userName,
        amountCents: share.amountCents,
        itemCount: 1,
      });
    }
  }

  return [...totals.values()].sort((first, second) => {
    if (second.amountCents !== first.amountCents) {
      return second.amountCents - first.amountCents;
    }

    return first.userName.localeCompare(
      second.userName,
      "cs-CZ",
    );
  });
}

export function ExpenseMemberTotals({
  expenses,
  currentUserId,
  title,
  description,
}: ExpenseMemberTotalsProps) {
  const memberTotals = useMemo(
    () => getMemberExpenseTotals(expenses),
    [expenses],
  );

  const currentUserTotal = memberTotals.find(
    (total) => total.userId === currentUserId,
  );

  const totalAmountCents = memberTotals.reduce(
    (sum, total) => sum + total.amountCents,
    0,
  );

  if (memberTotals.length === 0) {
    return null;
  }

  return (
    <PixelPanel className="pixel-grid" tone="deep">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-amber text-void shadow-pixel-sm">
            <ReceiptText aria-hidden="true" size={19} />
          </div>

          <div>
            <p className="font-pixel text-[9px] leading-5 text-amber-light">
              SOUČET ÚTRAT
            </p>

            <h2 className="mt-2 font-pixel text-sm leading-8 text-cream">
              {title}
            </h2>

            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2 border-2 border-outline bg-panel-deep px-4 py-3 text-right shadow-pixel-sm">
          <p className="font-pixel text-[8px] text-cream-muted">
            CELKEM ROZEPSÁNO
          </p>

          <p className="text-xl font-semibold text-amber-light">
            {formatCzkFromCents(totalAmountCents)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="border-2 border-amber bg-amber/10 p-4 shadow-pixel-sm">
          <p className="font-pixel text-[8px] text-amber-light">
            TVOJE ÚTRATA
          </p>

          <p className="mt-3 text-2xl font-semibold text-cream">
            {formatCzkFromCents(
              currentUserTotal?.amountCents ?? 0,
            )}
          </p>

          <p className="mt-2 text-sm leading-6 text-cream-muted">
            {currentUserTotal
              ? formatItemCount(currentUserTotal.itemCount)
              : "Zatím bez položek"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {memberTotals.map((total) => {
            const isCurrentUser =
              total.userId === currentUserId;

            return (
              <article
                className={[
                  "flex items-center justify-between gap-4 border-2 p-4 shadow-pixel-sm",
                  isCurrentUser
                    ? "border-amber bg-amber/10"
                    : "border-outline bg-panel",
                ].join(" ")}
                key={total.userId}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={[
                      "grid size-9 shrink-0 place-items-center border-2",
                      isCurrentUser
                        ? "border-amber bg-amber text-void"
                        : "border-outline bg-panel-deep text-cream-muted",
                    ].join(" ")}
                  >
                    <UserRound aria-hidden="true" size={16} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-cream">
                        {total.userName}
                      </p>

                      {isCurrentUser ? (
                        <span className="border border-amber bg-panel-deep px-2 py-0.5 font-pixel text-[7px] text-amber-light">
                          TY
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs text-cream-muted">
                      {formatItemCount(total.itemCount)}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 text-base font-semibold text-amber-light">
                  {formatCzkFromCents(total.amountCents)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </PixelPanel>
  );
}