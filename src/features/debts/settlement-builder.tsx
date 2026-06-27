"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  HandCoins,
  RefreshCw,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelModal } from "@/components/ui/pixel-modal";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { toast } from "@/components/ui/pixel-toast";
import { useAuth } from "@/features/auth/auth-provider";
import {
  calculateDebtSettlement,
  type DebtCalculation,
} from "@/features/debts/debt-calculator";
import {
  createDebtSettlement,
  getDebtErrorMessage,
} from "@/features/debts/debt-service";
import { useSettlements } from "@/features/debts/use-settlements";
import { useExpenses } from "@/features/expenses/use-expenses";
import { useSessions } from "@/features/sessions/use-sessions";
import { formatCzkFromCents } from "@/lib/money";

function getActorName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  return displayName?.trim() || email?.split("@")[0] || "Člen party";
}

export function SettlementBuilder() {
  const { profile, profileStatus, user } = useAuth();

  const { sessions, isLoading: areSessionsLoading } = useSessions(
    profileStatus === "ready",
  );

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );

  const {
    expenses,
    isLoading: areExpensesLoading,
    error: expensesError,
  } = useExpenses(
    profileStatus === "ready" && Boolean(selectedSessionId),
    {
      sessionId: selectedSessionId || undefined,
    },
  );

  const {
    settlements,
    isLoading: areSettlementsLoading,
    error: settlementsError,
  } = useSettlements(
    selectedSessionId,
    profileStatus === "ready" && Boolean(selectedSessionId),
  );

  const settledExpenseIds = useMemo(
    () =>
      new Set(
        settlements.flatMap((settlement) => settlement.sourceExpenseIds),
      ),
    [settlements],
  );

  const unsettledExpenses = useMemo(
    () =>
      expenses.filter((expense) => !settledExpenseIds.has(expense.id)),
    [expenses, settledExpenseIds],
  );

  const calculationResult = useMemo(() => {
    if (unsettledExpenses.length === 0) {
      return {
        calculation: null as DebtCalculation | null,
        error: null as string | null,
      };
    }

    try {
      return {
        calculation: calculateDebtSettlement(unsettledExpenses),
        error: null,
      };
    } catch (error) {
      return {
        calculation: null,
        error:
          error instanceof Error
            ? error.message
            : "Vyrovnání se nepodařilo spočítat.",
      };
    }
  }, [unsettledExpenses]);

  const isLoading =
    Boolean(selectedSessionId) &&
    (areExpensesLoading || areSettlementsLoading);

  const hasError = expensesError || settlementsError || calculationResult.error;

  async function handleCreateSettlement() {
    if (!user || !selectedSession || !calculationResult.calculation) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createDebtSettlement({
        session: selectedSession,
        expenses: unsettledExpenses,
        calculation: calculationResult.calculation,
        actor: {
          id: user.uid,
          name: getActorName(profile?.displayName, user.email),
        },
      });

      toast.success("Vyrovnání bylo zapsáno do knihy dluhů.");
      setIsConfirmOpen(false);
    } catch (error) {
      toast.error(getDebtErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PixelPanel className="pixel-grid" tone="deep">
      <div className="flex flex-col gap-5 border-b-2 border-outline pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-pixel text-[9px] leading-5 text-amber-light">
            SETTLEMENT FORGE
          </p>

          <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
            Vypočítat vyrovnání session
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
            Výpočet vezme pouze útraty, které ještě nebyly použité v žádném
            předchozím settlementu.
          </p>
        </div>

        <div className="grid min-w-64 gap-2">
          <label
            className="font-pixel text-[8px] leading-4 text-cream-muted"
            htmlFor="settlement-session"
          >
            VYBER SESSION
          </label>

          <select
            className="w-full border-2 border-outline bg-panel px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0/0.35)] focus:border-amber focus:outline-none"
            disabled={areSessionsLoading}
            id="settlement-session"
            onChange={(event) => setSelectedSessionId(event.target.value)}
            value={selectedSessionId}
          >
            <option value="">
              {areSessionsLoading ? "Načítám sessions…" : "Vyber session"}
            </option>

            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedSessionId ? (
        <div className="pt-6">
          <EmptyState
            description="Vyber konkrétní game night. Potom se zobrazí nové útraty, čisté zůstatky a výsledné převody."
            icon={Calculator}
            title="Vyber session pro výpočet"
          />
        </div>
      ) : null}

      {isLoading ? (
        <div className="pt-6">
          <LoadingState label="Počítám taverní účet…" />
        </div>
      ) : null}

      {!isLoading && hasError ? (
        <div className="pt-6">
          <PixelPanel tone="muted">
            <div className="flex gap-4">
              <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-wine text-cream shadow-pixel-sm">
                <RefreshCw aria-hidden="true" size={18} />
              </div>

              <div>
                <p className="font-pixel text-[9px] leading-5 text-wine-light">
                  SETTLEMENT ERROR
                </p>

                <p className="mt-2 text-sm leading-6 text-cream-muted">
                  {hasError}
                </p>
              </div>
            </div>
          </PixelPanel>
        </div>
      ) : null}

      {!isLoading && !hasError && selectedSession ? (
        <div className="grid gap-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border-2 border-outline bg-panel p-4 shadow-pixel-sm">
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                NOVÉ ÚTRATY
              </p>

              <p className="mt-2 font-pixel text-sm leading-7 text-cream">
                {unsettledExpenses.length}
              </p>
            </div>

            <div className="border-2 border-outline bg-panel p-4 shadow-pixel-sm">
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                STARŠÍ SETTLEMENTY
              </p>

              <p className="mt-2 font-pixel text-sm leading-7 text-cream">
                {settlements.length}
              </p>
            </div>

            <div className="border-2 border-outline bg-panel p-4 shadow-pixel-sm">
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                NOVÁ ÚTRATA CELKEM
              </p>

              <p className="mt-2 font-pixel text-sm leading-7 text-cream">
                {formatCzkFromCents(
                  calculationResult.calculation?.totalExpenseCents ?? 0,
                )}
              </p>
            </div>
          </div>

          {unsettledExpenses.length === 0 ? (
            <EmptyState
              description="Všechny útraty této session už patří do některého settlementu. Nově přidané položky se zde objeví při dalším výpočtu."
              icon={CheckCircle2}
              title="Session je už vyrovnaná"
            />
          ) : null}

          {calculationResult.calculation ? (
            <>
              <section>
                <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
                  ČISTÉ ZŮSTATKY
                </p>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {calculationResult.calculation.balances.map((balance) => (
                    <div
                      key={balance.userId}
                      className="border-2 border-outline bg-panel p-4 shadow-pixel-sm"
                    >
                      <p className="text-sm font-semibold text-cream">
                        {balance.userName}
                      </p>

                      <p
                        className={
                          balance.netCents > 0
                            ? "mt-2 font-pixel text-[10px] leading-5 text-moss-light"
                            : balance.netCents < 0
                              ? "mt-2 font-pixel text-[10px] leading-5 text-wine-light"
                              : "mt-2 font-pixel text-[10px] leading-5 text-cream-muted"
                        }
                      >
                        {balance.netCents > 0
                          ? `DOSTANE ${formatCzkFromCents(balance.netCents)}`
                          : balance.netCents < 0
                            ? `DLUŽÍ ${formatCzkFromCents(
                                Math.abs(balance.netCents),
                              )}`
                            : "VYROVNÁNO"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="font-pixel text-[9px] leading-5 text-cream-muted">
                    NAVRHOVANÉ PŘEVODY
                  </p>

                  <p className="font-pixel text-[8px] leading-4 text-amber-light">
                    {calculationResult.calculation.transfers.length} PŘEVODŮ
                  </p>
                </div>

                {calculationResult.calculation!.transfers.length === 0 ? (
                  <PixelPanel tone="muted">
                    <div className="flex gap-4">
                      <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-moss text-void shadow-pixel-sm">
                        <CheckCircle2 aria-hidden="true" size={19} />
                      </div>

                      <div>
                        <h3 className="font-pixel text-[10px] leading-6 text-cream">
                          Nikdo nikomu nic nedluží
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-cream-muted">
                          Útraty jsou mezi členy vyrovnané. Můžeš session
                          uzavřít bez vytvoření dluhů.
                        </p>
                      </div>
                    </div>
                  </PixelPanel>
                ) : (
                  <PixelPanel padding="none" tone="deep">
                    {calculationResult.calculation!.transfers.map(
                      (transfer, index) => (
                        <div
                          key={`${transfer.fromUserId}-${transfer.toUserId}`}
                          className={
                            index ===
                            calculationResult.calculation!.transfers.length - 1
                              ? "flex items-center justify-between gap-4 p-4"
                              : "flex items-center justify-between gap-4 border-b-2 border-outline p-4"
                          }
                        >
                          <p className="text-sm text-cream">
                            <span className="font-semibold">
                              {transfer.fromUserName}
                            </span>{" "}
                            pošle{" "}
                            <span className="font-semibold">
                              {transfer.toUserName}
                            </span>
                          </p>

                          <p className="font-pixel text-[10px] leading-5 text-amber-light">
                            {formatCzkFromCents(transfer.amountCents)}
                          </p>
                        </div>
                      ),
                    )}
                  </PixelPanel>
                )}
              </section>

              <PixelButton
                disabled={isSubmitting}
                onClick={() => setIsConfirmOpen(true)}
                variant="moss"
              >
                <HandCoins aria-hidden="true" size={16} />
                {calculationResult.calculation.transfers.length === 0
                  ? "Uzavřít bez převodů"
                  : "Vytvořit dluhy"}
              </PixelButton>
            </>
          ) : null}
        </div>
      ) : null}

      <PixelModal
        description="Tímto krokem vznikne auditní snapshot použitých útrat. Další výpočet už je nebude započítávat znovu."
        onClose={() => setIsConfirmOpen(false)}
        open={isConfirmOpen}
        size="md"
        title="Potvrdit vyrovnání?"
      >
        <p className="text-sm leading-6 text-cream-muted">
          Pro session{" "}
          <span className="font-semibold text-cream">
            {selectedSession?.title}
          </span>{" "}
          se použije {unsettledExpenses.length} nových útrat.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <PixelButton
            disabled={isSubmitting}
            onClick={() => setIsConfirmOpen(false)}
            variant="ghost"
          >
            Ještě ne
          </PixelButton>

          <PixelButton
            disabled={isSubmitting}
            onClick={handleCreateSettlement}
            variant="moss"
          >
            <HandCoins aria-hidden="true" size={16} />
            {isSubmitting ? "Zapisuji…" : "Potvrdit vyrovnání"}
          </PixelButton>
        </div>
      </PixelModal>
    </PixelPanel>
  );
}