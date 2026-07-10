"use client";

import { useMemo, useState } from "react";
import { Plus, ReceiptText, RefreshCw } from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { ExpenseForm } from "@/features/expenses/expense-form";
import { ExpenseList } from "@/features/expenses/expense-list";
import { ExpenseMemberTotals } from "@/features/expenses/expense-member-totals";
import { useExpenses } from "@/features/expenses/use-expenses";
import { useSessions } from "@/features/sessions/use-sessions";
import {
  EXPENSE_PRESETS,
  type Expense,
  type ExpensePreset,
} from "@/types/expense";

type ExpenseModalState =
  | {
      mode: "create";
      preset?: ExpensePreset;
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

export function ExpenseOverview() {
  const { profile, profileStatus, user } = useAuth();

  const { expenses, isLoading, error } = useExpenses(
    profileStatus === "ready",
  );

  const { sessions } = useSessions(profileStatus === "ready");

  const [modalState, setModalState] =
    useState<ExpenseModalState>(null);

  const isAdmin = profile?.role === "admin";

  const actor = user
    ? {
        id: user.uid,
        name: getActorName(profile?.displayName, user.email),
      }
    : null;

  const sessionTitles = useMemo(
    () =>
      new Map(
        sessions.map((session) => [
          session.id,
          session.title,
        ]),
      ),
    [sessions],
  );

  if (isLoading) {
    return <LoadingState label="Načítám knihu útrat…" />;
  }

  if (error) {
    return (
      <PixelPanel className="max-w-2xl" padding="lg">
        <p className="font-pixel text-[10px] leading-5 text-wine-light">
          EXPENSE ERROR
        </p>

        <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
          Útraty se nepodařilo načíst
        </h2>

        <p className="mt-3 text-sm leading-6 text-cream-muted">
          {error}
        </p>

        <PixelButton
          className="mt-6"
          onClick={() => window.location.reload()}
          variant="moss"
        >
          <RefreshCw aria-hidden="true" size={16} />
          Obnovit stránku
        </PixelButton>
      </PixelPanel>
    );
  }

  return (
    <div className="grid gap-8">
      <PixelPanel className="pixel-grid" tone="deep">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-pixel text-[9px] leading-5 text-amber-light">
              PARTY EXPENSE LEDGER
            </p>

            <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
              Útraty pro celou výpravu
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
              Zapiš limonády, pivo nebo cokoliv dalšího, co zmizelo z
              herního stolu rychleji než připravený plán.
            </p>
          </div>

          <PixelButton
            onClick={() => setModalState({ mode: "create" })}
            variant="moss"
          >
            <Plus aria-hidden="true" size={16} />
            Přidat útratu
          </PixelButton>
        </div>

        <div className="mt-6 border-t-2 border-outline pt-5">
          <p className="font-pixel text-[8px] leading-4 text-cream-muted">
            RYCHLÉ PŘEDVOLBY
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            {Object.entries(EXPENSE_PRESETS).map(
              ([key, preset]) => (
                <PixelButton
                  key={key}
                  onClick={() =>
                    setModalState({
                      mode: "create",
                      preset,
                    })
                  }
                  size="sm"
                  variant="ghost"
                >
                  <ReceiptText aria-hidden="true" size={14} />
                  {preset.title}
                </PixelButton>
              ),
            )}

            <PixelButton
              onClick={() => setModalState({ mode: "create" })}
              size="sm"
              variant="amber"
            >
              <Plus aria-hidden="true" size={14} />
              Vlastní položka
            </PixelButton>
          </div>
        </div>
      </PixelPanel>

      {expenses.length > 0 ? (
        <ExpenseMemberTotals
          currentUserId={user?.uid ?? null}
          description="Přehled ukazuje, kolik má každý člen dohromady připsáno v aktuálně načtených útratách."
          expenses={expenses}
          title="Součet útrat podle členů"
        />
      ) : null}

      <section>
        <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
          POSLEDNÍ ÚTRATY
        </p>

        <ExpenseList
          actor={actor}
          emptyDescription="Zatím není zapsaná žádná pizza, limonáda ani dortík. První položka čeká na svého hrdinu."
          emptyTitle="Kniha útrat je prázdná"
          expenses={expenses}
          isAdmin={isAdmin}
          onEdit={(expense) =>
            setModalState({
              mode: "edit",
              expense,
            })
          }
          sessionTitles={sessionTitles}
          showSession
        />
      </section>

      {modalState?.mode === "create" ? (
        <ExpenseForm
          key={`create-${modalState.preset?.title ?? "custom"}`}
          onClose={() => setModalState(null)}
          open
          preset={modalState.preset}
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
    </div>
  );
}