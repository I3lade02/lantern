"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Beer,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { toast } from "@/components/ui/pixel-toast";
import {
  claimBarDrink,
  getBarDrinkForQrToken,
} from "@/features/bar/bar-claim-api";
import { useAuth } from "@/features/auth/auth-provider";
import { useSessions } from "@/features/sessions/use-sessions";
import { formatSessionDate } from "@/lib/formatters";
import { formatCzkFromCents } from "@/lib/money";
import type {
  BarClaimResponse,
  BarScanDrink,
} from "@/types/bar";
import type { Session } from "@/types/session";

type BarScanPageContentProps = {
  qrToken: string;
};

function sortClaimableSessions(
  sessions: Session[],
): Session[] {
  return [...sessions].sort((first, second) => {
    const firstRank =
      first.status === "active" ? 0 : 1;

    const secondRank =
      second.status === "active" ? 0 : 1;

    if (firstRank !== secondRank) {
      return firstRank - secondRank;
    }

    return (
      (first.startAt?.toMillis() ?? 0) -
      (second.startAt?.toMillis() ?? 0)
    );
  });
}

export function BarScanPageContent({
  qrToken,
}: BarScanPageContentProps) {
  const {
    profile,
    profileStatus,
    status,
    user,
  } = useAuth();

  const isReady =
    status === "authenticated" &&
    profileStatus === "ready" &&
    Boolean(profile) &&
    Boolean(user);

  const {
    sessions,
    isLoading: areSessionsLoading,
    error: sessionsError,
  } = useSessions(isReady);

  const [drink, setDrink] =
    useState<BarScanDrink | null>(null);

  const [drinkError, setDrinkError] =
    useState<string | null>(null);

  const [isDrinkLoading, setIsDrinkLoading] =
    useState(true);

  const [selectedSessionId, setSelectedSessionId] =
    useState("");

  const [isClaiming, setIsClaiming] =
    useState(false);

  const [claimResult, setClaimResult] =
    useState<BarClaimResponse | null>(null);

  const claimableSessions = useMemo(
    () =>
      sortClaimableSessions(
        sessions.filter(
          (session) =>
            session.status === "active" ||
            session.status === "upcoming",
        ),
      ),
    [sessions],
  );

  const effectiveSessionId =
    selectedSessionId ||
    claimableSessions[0]?.id ||
    "";

  const selectedSession = claimableSessions.find(
    (session) => session.id === effectiveSessionId,
  );

  useEffect(() => {
    if (!isReady || !user) {
      return;
    }

    const currentUser = user;
    let isMounted = true;

    async function loadDrink() {
      setIsDrinkLoading(true);
      setDrinkError(null);
      setDrink(null);
      setClaimResult(null);

      try {
        const nextDrink =
          await getBarDrinkForQrToken(
            currentUser,
            qrToken,
          );

        if (!isMounted) {
          return;
        }

        setDrink(nextDrink);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setDrinkError(
          loadError instanceof Error
            ? loadError.message
            : "Nápoj z QR kódu se nepodařilo načíst.",
        );
      } finally {
        if (isMounted) {
          setIsDrinkLoading(false);
        }
      }
    }

    void loadDrink();

    return () => {
      isMounted = false;
    };
  }, [isReady, qrToken, user]);

  async function handleClaim() {
    if (
      !user ||
      !drink ||
      !effectiveSessionId ||
      isClaiming
    ) {
      return;
    }

    setIsClaiming(true);

    try {
      const result = await claimBarDrink(
        user,
        qrToken,
        effectiveSessionId,
      );

      setClaimResult(result);

      toast.success(
        `${drink.name} byl přidán do tvé útraty.`,
      );
    } catch (claimError) {
      toast.error(
        claimError instanceof Error
          ? claimError.message
          : "Nápoj se nepodařilo přidat do útraty.",
      );
    } finally {
      setIsClaiming(false);
    }
  }

  if (!isReady) {
    return (
      <LoadingState label="Ověřuji hosta u taverního pultu…" />
    );
  }

  if (isDrinkLoading) {
    return (
      <LoadingState label="Načítám nápoj z QR kódu…" />
    );
  }

  if (drinkError || !drink) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-10">
        <PixelPanel tone="deep">
          <CircleAlert
            aria-hidden="true"
            className="text-wine-light"
            size={30}
          />

          <p className="mt-5 font-pixel text-[10px] text-wine-light">
            QR NÁPOJ NENÍ K DISPOZICI
          </p>

          <h1 className="mt-3 font-pixel text-base leading-8 text-cream">
            Tenhle štítek dnes neotevřel pult
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-cream-muted">
            {drinkError ??
              "Nápoj se nepodařilo načíst. Zkus QR načíst znovu nebo zavolej správce baru."}
          </p>

          <Link
            className="mt-6 inline-flex items-center gap-2 border-2 border-outline bg-panel px-4 py-3 font-pixel text-[9px] text-cream transition hover:border-amber hover:text-amber-light"
            href="/sessions"
          >
            Zpět na session
            <ChevronRight aria-hidden="true" size={15} />
          </Link>
        </PixelPanel>
      </main>
    );
  }

  if (claimResult) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-10">
        <PixelPanel tone="deep">
          <CheckCircle2
            aria-hidden="true"
            className="text-moss-light"
            size={34}
          />

          <p className="mt-5 font-pixel text-[10px] text-moss-light">
            NÁPOJ PŘIDÁN
          </p>

          <h1 className="mt-3 font-pixel text-base leading-8 text-cream">
            {drink.name} je v knize útrat
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-cream-muted">
            Do session{" "}
            <span className="font-semibold text-cream">
              {selectedSession?.title ??
                "vybraná session"}
            </span>{" "}
            se přidala útrata{" "}
            <span className="font-semibold text-amber-light">
              {formatCzkFromCents(drink.priceCents)}
            </span>
            . Pohledávka se připíše provozovateli{" "}
            <span className="font-semibold text-cream">
              {drink.operatorName}
            </span>
            .
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 border-2 border-outline bg-moss px-4 py-3 font-pixel text-[9px] text-cream shadow-pixel-sm transition hover:brightness-110"
              href="/expenses"
            >
              <ReceiptText aria-hidden="true" size={16} />
              Otevřít útraty
            </Link>

            <Link
              className="inline-flex items-center justify-center gap-2 border-2 border-outline bg-panel px-4 py-3 font-pixel text-[9px] text-cream transition hover:border-amber hover:text-amber-light"
              href="/sessions"
            >
              Zpět na session
            </Link>
          </div>
        </PixelPanel>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 pb-16">
      <section className="border-b-2 border-outline pb-7">
        <p className="font-pixel text-[10px] leading-6 text-amber-light">
          TAVERNÍ BAR
        </p>

        <h1 className="mt-3 font-pixel text-xl leading-10 text-cream">
          Přidat nápoj do útraty
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-7 text-cream-muted">
          QR štítek našel položku z nabídky.
          Zkontroluj session a potvrď připsání.
        </p>
      </section>

      <PixelPanel
        className="mt-7"
        tone="deep"
      >
        <div className="flex items-start gap-4">
          <div className="grid size-13 shrink-0 place-items-center border-2 border-outline bg-amber text-void shadow-pixel-sm">
            <Beer aria-hidden="true" size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-pixel text-[8px] text-cream-muted">
              NASKENOVANÝ NÁPOJ
            </p>

            <h2 className="mt-2 text-xl font-semibold text-cream">
              {drink.name}
            </h2>

            <p className="mt-3 text-2xl font-semibold text-amber-light">
              {formatCzkFromCents(drink.priceCents)}
            </p>
          </div>

          <PixelBadge tone="amber">
            {drink.category.toUpperCase()}
          </PixelBadge>
        </div>

        <div className="mt-6 border-t-2 border-outline-soft pt-5">
          <div className="flex items-start gap-3">
            <WalletCards
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-moss-light"
              size={18}
            />

            <p className="text-sm leading-6 text-cream-muted">
              Nápoj se připíše tobě. Při vyrovnání
              vznikne dluh vůči provozovateli{" "}
              <span className="font-semibold text-cream">
                {drink.operatorName}
              </span>
              .
            </p>
          </div>
        </div>
      </PixelPanel>

      <section className="mt-7">
        <div className="flex items-center gap-3">
          <CalendarDays
            aria-hidden="true"
            className="text-amber-light"
            size={19}
          />

          <div>
            <p className="font-pixel text-[9px] text-cream-muted">
              PŘIŘADIT K SESSION
            </p>

            <h2 className="mt-1 font-pixel text-sm text-cream">
              KAM NÁPOJ PATŘÍ?
            </h2>
          </div>
        </div>

        {areSessionsLoading ? (
          <div className="mt-5 flex items-center gap-3 border-2 border-outline bg-panel-deep p-5 text-sm text-cream-muted">
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin text-amber-light"
              size={18}
            />
            Hledám aktivní game night…
          </div>
        ) : null}

        {!areSessionsLoading &&
        sessionsError ? (
          <div className="mt-5 border-2 border-danger bg-wine-dark p-5 text-sm leading-6 text-cream">
            {sessionsError}
          </div>
        ) : null}

        {!areSessionsLoading &&
        !sessionsError &&
        claimableSessions.length === 0 ? (
          <div className="mt-5 border-2 border-outline bg-panel-deep p-5">
            <p className="font-pixel text-[9px] text-wine-light">
              NENÍ KAM PŘIPSAT NÁPOJ
            </p>

            <p className="mt-3 text-sm leading-6 text-cream-muted">
              Pro připsání nápoje potřebuješ alespoň
              jednu připravovanou nebo aktivní session.
            </p>

            <Link
              className="mt-5 inline-flex items-center gap-2 font-pixel text-[9px] text-amber-light hover:text-cream"
              href="/sessions"
            >
              Otevřít session
              <ChevronRight aria-hidden="true" size={15} />
            </Link>
          </div>
        ) : null}

        {!areSessionsLoading &&
        !sessionsError &&
        claimableSessions.length > 0 ? (
          <div className="mt-5">
            <label
              className="grid gap-2"
              htmlFor="bar-claim-session"
            >
              <span className="font-pixel text-[9px] text-cream">
                Vybraná session
              </span>

              <select
                className="w-full border-2 border-outline bg-panel-deep px-3 py-3 text-sm text-cream outline-none focus:border-amber disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isClaiming}
                id="bar-claim-session"
                onChange={(event) =>
                  setSelectedSessionId(
                    event.target.value,
                  )
                }
                value={effectiveSessionId}
              >
                {claimableSessions.map((session) => (
                  <option
                    key={session.id}
                    value={session.id}
                  >
                    {session.status === "active"
                      ? "● PRÁVĚ BĚŽÍ · "
                      : ""}
                    {session.title} ·{" "}
                    {formatSessionDate(session.startAt)}
                  </option>
                ))}
              </select>
            </label>

            {selectedSession ? (
              <p className="mt-3 text-sm leading-6 text-cream-muted">
                {selectedSession.status === "active"
                  ? "Tahle session právě běží, proto je vybraná jako první."
                  : "Můžeš vybrat libovolnou připravovanou session."}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <PixelButton
        className="mt-8 w-full"
        disabled={
          isClaiming ||
          !effectiveSessionId ||
          areSessionsLoading ||
          Boolean(sessionsError)
        }
        onClick={() => {
          void handleClaim();
        }}
        variant="moss"
      >
        {isClaiming ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={17}
            />
            Přidávám do útraty…
          </>
        ) : (
          <>
            <ReceiptText aria-hidden="true" size={17} />
            Přidat {drink.name} za{" "}
            {formatCzkFromCents(drink.priceCents)}
          </>
        )}
      </PixelButton>
    </main>
  );
}