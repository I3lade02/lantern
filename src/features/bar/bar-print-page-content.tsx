"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  Printer,
  RefreshCw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { getBarAdminOverview } from "@/features/bar/bar-admin-api";
import { BarPrintMenu } from "@/features/bar/bar-print-menu";
import type { BarAdminOverview } from "@/types/bar";

const DEFAULT_TITLE = "LANtern Tavern Menu";
const DEFAULT_SUBTITLE =
  "Vyber si drink, naskenuj QR kód a připíšeme ho na tvůj účet.";

export function BarPrintPageContent() {
  const {
    profile,
    profileStatus,
    status,
    user,
  } = useAuth();

  const [overview, setOverview] =
    useState<BarAdminOverview | null>(null);

  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(
    DEFAULT_SUBTITLE,
  );

  const [showUnavailable, setShowUnavailable] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isPreparingPrint, setIsPreparingPrint] =
    useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthReady =
    status === "authenticated" &&
    profileStatus === "ready";

  const loadOverview = useCallback(async () => {
    if (!user || profile?.role !== "admin") {
      return;
    }

    setIsLoading(true);

    try {
      const nextOverview = await getBarAdminOverview(user);

      setOverview(nextOverview);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Tiskovou nabídku se nepodařilo načíst.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [profile?.role, user]);

  useEffect(() => {
    if (
      !isAuthReady ||
      !user ||
      profile?.role !== "admin"
    ) {
      return;
    }

    let isActive = true;

    void getBarAdminOverview(user)
      .then((nextOverview) => {
        if (!isActive) {
          return;
        }

        setOverview(nextOverview);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!isActive) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Tiskovou nabídku se nepodařilo načíst.",
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isAuthReady, profile?.role, user]);

  const visibleDrinks = useMemo(() => {
    const drinks = overview?.drinks ?? [];

    return showUnavailable
      ? drinks
      : drinks.filter((drink) => drink.isAvailable);
  }, [overview?.drinks, showUnavailable]);

  async function handlePrint() {
    setIsPreparingPrint(true);

    try {
      const menuImages = Array.from(
        document.querySelectorAll<HTMLImageElement>(
          ".bar-print-document img",
        ),
      );

      await Promise.allSettled([
        document.fonts.ready,
        ...menuImages.map((image) => image.decode()),
      ]);

      window.print();
    } finally {
      setIsPreparingPrint(false);
    }
  }

  if (!isAuthReady) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-5 py-8">
        <div className="text-center">
          <LoaderCircle
            aria-hidden="true"
            className="mx-auto animate-spin text-amber-light"
            size={30}
          />

          <p className="mt-4 text-sm text-cream-muted">
            Rozsvěcím taverní vývěsní štít…
          </p>
        </div>
      </main>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-8">
        <PixelPanel tone="deep">
          <p className="font-pixel text-sm leading-7 text-cream">
            TISK NABÍDKY JE PRO ADMINA
          </p>

          <p className="mt-4 text-sm leading-7 text-cream-muted">
            Šablona obsahuje neveřejné QR odkazy a správu
            dostupnosti nápojů.
          </p>

          <Link
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-light hover:text-amber"
            href="/bar"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Zpět do baru
          </Link>
        </PixelPanel>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-5 py-8">
        <div className="text-center">
          <LoaderCircle
            aria-hidden="true"
            className="mx-auto animate-spin text-amber-light"
            size={30}
          />

          <p className="mt-4 text-sm text-cream-muted">
            Rozsvěcím taverní vývěsní štít…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="bar-print-page mx-auto w-full max-w-[1480px] px-5 py-8 pb-16">
      <section className="bar-print-controls border-b-2 border-outline pb-7">
        <Link
          className="inline-flex items-center gap-2 font-pixel text-[9px] text-cream-muted transition hover:text-amber-light"
          href="/bar"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Zpět do baru
        </Link>

        <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="font-pixel text-[10px] leading-6 text-amber-light">
              PRINT WORKSHOP
            </p>

            <h1 className="mt-3 font-pixel text-xl leading-10 text-cream">
              Taverní QR nabídka
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-cream-muted">
              A4 šablona na šířku používá ostré SVG QR
              kódy a automaticky vytvoří další stránku po
              dvanácti nápojích.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <PixelButton
              onClick={() => {
                void loadOverview();
              }}
              size="sm"
              variant="ghost"
            >
              <RefreshCw aria-hidden="true" size={15} />
              Obnovit
            </PixelButton>

            <PixelButton
              disabled={
                visibleDrinks.length === 0 ||
                isPreparingPrint
              }
              onClick={() => {
                void handlePrint();
              }}
              size="sm"
              variant="amber"
            >
              {isPreparingPrint ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={16}
                />
              ) : (
                <Printer aria-hidden="true" size={16} />
              )}
              {isPreparingPrint
                ? "Připravuji…"
                : "Vytisknout / PDF"}
            </PixelButton>
          </div>
        </div>
      </section>

      {error ? (
        <div className="bar-print-controls mt-6 border-2 border-danger bg-wine-dark p-5 text-sm leading-7 text-cream">
          {error}
        </div>
      ) : null}

      <PixelPanel
        className="bar-print-controls mt-6"
        tone="deep"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] xl:items-end">
          <PixelInput
            id="bar-menu-title"
            label="Nadpis nabídky"
            maxLength={32}
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />

          <PixelInput
            id="bar-menu-subtitle"
            label="Krátký text"
            maxLength={100}
            onChange={(event) => setSubtitle(event.target.value)}
            value={subtitle}
          />

          <PixelButton
            onClick={() =>
              setShowUnavailable((current) => !current)
            }
            variant={showUnavailable ? "moss" : "ghost"}
          >
            {showUnavailable ? (
              <Eye aria-hidden="true" size={16} />
            ) : (
              <EyeOff aria-hidden="true" size={16} />
            )}
            {showUnavailable
              ? "Skryté zobrazeny"
              : "Jen dostupné"}
          </PixelButton>
        </div>

        <p className="mt-4 text-xs leading-6 text-cream-muted">
          V náhledu je {visibleDrinks.length} položek. Při
          ukládání do PDF zapni v tiskovém dialogu grafiku
          na pozadí, aby zůstaly zachované barvy taverny.
        </p>
      </PixelPanel>

      <div className="bar-print-preview mt-8">
        <BarPrintMenu
          drinks={visibleDrinks}
          subtitle={subtitle.trim() || DEFAULT_SUBTITLE}
          title={title.trim() || DEFAULT_TITLE}
        />
      </div>
    </main>
  );
}
