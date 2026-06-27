"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  RefreshCw,
  Settings2,
} from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { DebtList } from "@/features/debts/debt-list";
import { SettlementBuilder } from "@/features/debts/settlement-builder";
import { useDebts } from "@/features/debts/use-debts";
import { PaymentSettingsModal } from "@/features/payments/payment-settings-modal";
import { useAppSettings } from "@/features/payments/use-app-settings";
import { useSessions } from "@/features/sessions/use-sessions";
import { formatCzkFromCents } from "@/lib/money";

function getActorName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  return displayName?.trim() || email?.split("@")[0] || "Člen party";
}

export function DebtOverview() {
  const { profile, profileStatus, user } = useAuth();

  const {
    debts,
    isLoading: areDebtsLoading,
    error: debtsError,
  } = useDebts(profileStatus === "ready");

  const {
    sessions,
    isLoading: areSessionsLoading,
  } = useSessions(profileStatus === "ready");

  const {
    settings,
    isLoading: areSettingsLoading,
    error: settingsError,
  } = useAppSettings(profileStatus === "ready");

  const [sessionFilter, setSessionFilter] = useState("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isAdmin = profile?.role === "admin";

  const actor = user
    ? {
        id: user.uid,
        name: getActorName(profile?.displayName, user.email),
      }
    : null;

  const filteredDebts = useMemo(
    () =>
      sessionFilter === "all"
        ? debts
        : debts.filter((debt) => debt.sessionId === sessionFilter),
    [debts, sessionFilter],
  );

  const activeDebts = useMemo(
    () =>
      filteredDebts.filter(
        (debt) => debt.status === "open" || debt.status === "pending",
      ),
    [filteredDebts],
  );

  const resolvedDebts = useMemo(
    () =>
      filteredDebts.filter(
        (debt) =>
          debt.status === "paid" || debt.status === "forgiven",
      ),
    [filteredDebts],
  );

  const myDebts = useMemo(
    () =>
      activeDebts.filter((debt) => debt.fromUserId === user?.uid),
    [activeDebts, user?.uid],
  );

  const debtsToMe = useMemo(
    () =>
      activeDebts.filter((debt) => debt.toUserId === user?.uid),
    [activeDebts, user?.uid],
  );

  const totalToPay = myDebts.reduce(
    (total, debt) => total + debt.amountCents,
    0,
  );

  const totalToReceive = debtsToMe.reduce(
    (total, debt) => total + debt.amountCents,
    0,
  );

  if (
    areDebtsLoading ||
    areSessionsLoading ||
    areSettingsLoading
  ) {
    return <LoadingState label="Načítám vyrovnání party…" />;
  }

  if (debtsError || settingsError) {
    return (
      <PixelPanel className="max-w-2xl" padding="lg">
        <p className="font-pixel text-[10px] leading-5 text-wine-light">
          DEBT ERROR
        </p>

        <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
          Data se nepodařilo načíst
        </h2>

        <p className="mt-3 text-sm leading-6 text-cream-muted">
          {debtsError ?? settingsError}
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
              SETTLEMENT BOARD
            </p>

            <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
              Dluhy a vyrovnání party
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
              Sleduj, komu máš poslat peníze, kdo dluží tobě a které session už
              mají uzavřený účet.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid min-w-64 gap-2">
              <label
                className="font-pixel text-[8px] leading-4 text-cream-muted"
                htmlFor="debt-session-filter"
              >
                FILTR SESSION
              </label>

              <select
                className="w-full border-2 border-outline bg-panel px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0/0.35)] focus:border-amber focus:outline-none"
                id="debt-session-filter"
                onChange={(event) =>
                  setSessionFilter(event.target.value)
                }
                value={sessionFilter}
              >
                <option value="all">Všechny session</option>

                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin ? (
              <PixelButton
                onClick={() => setIsSettingsOpen(true)}
                variant="amber"
              >
                <Settings2 aria-hidden="true" size={16} />
                QR nastavení
              </PixelButton>
            ) : null}
          </div>
        </div>
      </PixelPanel>

      <section className="grid gap-5 sm:grid-cols-2">
        <PixelPanel tone="deep">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center border-2 border-outline bg-wine text-cream shadow-pixel-sm">
              <ArrowUpRight aria-hidden="true" size={21} />
            </div>

            <div>
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                TY DLUŽÍŠ
              </p>

              <p className="mt-2 font-pixel text-sm leading-7 text-cream">
                {formatCzkFromCents(totalToPay)}
              </p>

              <p className="mt-1 text-xs text-cream-muted">
                {myDebts.length} otevřených převodů
              </p>
            </div>
          </div>
        </PixelPanel>

        <PixelPanel tone="deep">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center border-2 border-outline bg-moss text-void shadow-pixel-sm">
              <ArrowDownLeft aria-hidden="true" size={21} />
            </div>

            <div>
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                DLUŽÍ TOBĚ
              </p>

              <p className="mt-2 font-pixel text-sm leading-7 text-cream">
                {formatCzkFromCents(totalToReceive)}
              </p>

              <p className="mt-1 text-xs text-cream-muted">
                {debtsToMe.length} otevřených převodů
              </p>
            </div>
          </div>
        </PixelPanel>
      </section>

      {isAdmin ? <SettlementBuilder /> : null}

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="font-pixel text-[9px] leading-5 text-cream-muted">
            VŠECHNY OTEVŘENÉ DLUHY
          </p>

          <p className="font-pixel text-[8px] leading-4 text-wine-light">
            {activeDebts.length} AKTIVNÍCH
          </p>
        </div>

        <DebtList
          actor={actor}
          debts={activeDebts}
          emptyDescription="Zatím nebyl vytvořen žádný otevřený dluh. Admin může nejprve spočítat settlement z útrat konkrétní session."
          emptyTitle="Žádné otevřené dluhy"
          isAdmin={isAdmin}
          settings={settings}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="font-pixel text-[9px] leading-5 text-cream-muted">
            HISTORIE VYŘEŠENÝCH DLUHŮ
          </p>

          <p className="font-pixel text-[8px] leading-4 text-moss-light">
            {resolvedDebts.length} UZAVŘENÝCH
          </p>
        </div>

        <DebtList
          actor={actor}
          debts={resolvedDebts}
          emptyDescription="Jakmile admin označí některý převod jako zaplacený nebo odpuštěný, zůstane jeho stopa zde."
          emptyTitle="Historie je zatím prázdná"
          isAdmin={isAdmin}
          settings={settings}
        />
      </section>

      {!isAdmin ? (
        <PixelPanel tone="muted">
          <div className="flex gap-4">
            <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-panel text-amber shadow-pixel-sm">
              <HandCoins aria-hidden="true" size={19} />
            </div>

            <p className="text-sm leading-6 text-cream-muted">
              U vlastního otevřeného dluhu můžeš použít QR platbu. Po označení
              platby jako odeslané ji admin ručně potvrdí.
            </p>
          </div>
        </PixelPanel>
      ) : null}

      {isAdmin && isSettingsOpen ? (
        <PaymentSettingsModal
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
        />
      ) : null}
    </div>
  );
}