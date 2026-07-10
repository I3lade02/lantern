"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { ExpenseForm } from "@/features/expenses/expense-form";
import { ExpenseList } from "@/features/expenses/expense-list";
import { ExpenseMemberTotals } from "@/features/expenses/expense-member-totals";
import { useExpenses } from "@/features/expenses/use-expenses";
import type { Expense } from "@/types/expense";

type SessionExpensesPanelProps = {
  sessionId: string;
  sessionTitle: string;
};

type ModalState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      expense: Expense;
    }
  | null;

function getActorName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  return displayName?.trim() || email?.split("@")[0] || "Člen party";
}

export function SessionExpensesPanel({
  sessionId,
  sessionTitle,
}: SessionExpensesPanelProps) {
  const { profile, profileStatus, user } = useAuth();

  const { expenses, isLoading, error } = useExpenses(
    profileStatus === "ready",
    { sessionId },
  );

  const [modalState, setModalState] =
    useState<ModalState>(null);

  const isAdmin = profile?.role === "admin";

  const actor = user
    ? {
        id: user.uid,
        name: getActorName(profile?.displayName, user.email),
      }
    : null;

  if (isLoading) {
    return <LoadingState label="Načítám útraty session…" />;
  }

  if (error) {
    return (
      <PixelPanel tone="deep">
        <p className="font-pixel text-[10px] leading-5 text-wine-light">
          EXPENSE ERROR
        </p>

        <p className="mt-3 text-sm leading-6 text-cream-muted">
          {error}
        </p>
      </PixelPanel>
    );
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <p className="font-pixel text-[9px] leading-5 text-cream-muted">
          ÚTRATY SESSION
        </p>

        <PixelButton
          onClick={() => setModalState({ mode: "create" })}
          size="sm"
          variant="moss"
        >
          <Plus aria-hidden="true" size={14} />
          Přidat útratu
        </PixelButton>
      </div>

      {expenses.length > 0 ? (
        <ExpenseMemberTotals
          currentUserId={user?.uid ?? null}
          description="Součet vychází z rozepsaných podílů u jednotlivých útrat, takže správně započítá i rozdělené položky a QR nápoje z baru."
          expenses={expenses}
          title="Součet útrat v této session"
        />
      ) : null}

      <div className={expenses.length > 0 ? "mt-6" : ""}>
        <ExpenseList
          actor={actor}
          emptyDescription={`Pro session „${sessionTitle}“ zatím nikdo nezapsal žádnou útratu.`}
          emptyTitle="Session pokladna je zatím prázdná"
          expenses={expenses}
          isAdmin={isAdmin}
          onEdit={(expense) =>
            setModalState({
              mode: "edit",
              expense,
            })
          }
        />
      </div>

      {modalState?.mode === "create" ? (
        <ExpenseForm
          fixedSessionId={sessionId}
          key={`create-${sessionId}`}
          onClose={() => setModalState(null)}
          open
        />
      ) : null}

      {modalState?.mode === "edit" ? (
        <ExpenseForm
          key={`edit-${modalState.expense.id}`}
          expense={modalState.expense}
          onClose={() => setModalState(null)}
          open
        />
      ) : null}
    </section>
  );
}