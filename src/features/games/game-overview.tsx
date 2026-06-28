"use client";

import { useState } from "react";
import {
  Gamepad2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { GameCard } from "@/features/games/game-card";
import { GameForm } from "@/features/games/game-form";
import { useGames } from "@/features/games/use-games";
import type {
  Game,
  GameCategory,
} from "@/types/game";
import {
  GAME_CATEGORIES,
  GAME_CATEGORY_LABELS,
} from "@/types/game";

type GameModalState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      game: Game;
    }
  | null;

export function GameOverview() {
  const { profile, profileStatus } = useAuth();

  const {
    games,
    isLoading,
    error,
  } = useGames(profileStatus === "ready");

  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    GameCategory | "all"
  >("all");

  const [playerCountFilter, setPlayerCountFilter] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);

  const [modalState, setModalState] =
    useState<GameModalState>(null);

  const isAdmin = profile?.role === "admin";

  const requestedPlayerCount = Number(playerCountFilter);

  const visibleGames = games.filter((game) => {
    const normalizedSearch = searchValue.trim().toLocaleLowerCase(
      "cs-CZ",
    );

    const matchesSearch =
      !normalizedSearch ||
      game.title.toLocaleLowerCase("cs-CZ").includes(normalizedSearch) ||
      game.ownerName
        .toLocaleLowerCase("cs-CZ")
        .includes(normalizedSearch);

    const matchesCategory =
      categoryFilter === "all" || game.category === categoryFilter;

    const matchesPlayerCount =
      !playerCountFilter ||
      (
        Number.isInteger(requestedPlayerCount) &&
        requestedPlayerCount >= game.minPlayers &&
        requestedPlayerCount <= game.maxPlayers
      );

    const matchesAvailability =
      showUnavailable || game.isAvailable;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPlayerCount &&
      matchesAvailability
    );
  });

  if (isLoading) {
    return <LoadingState label="Otevírám herní polici…" />;
  }

  if (error) {
    return (
      <PixelPanel className="max-w-2xl" padding="lg">
        <p className="font-pixel text-[10px] leading-5 text-wine-light">
          GAME LIBRARY ERROR
        </p>

        <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
          Herní knihovnu se nepodařilo načíst
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
              GAME SHELF
            </p>

            <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
              Herní knihovna party
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
              Všechny hry, které může parta vytáhnout na stůl, rozložit,
              vysvětlovat třicet minut a pak stejně zjistit, že někdo četl
              pravidla obráceně.
            </p>
          </div>

          {isAdmin ? (
            <PixelButton
              onClick={() => setModalState({ mode: "create" })}
              variant="moss"
            >
              <Plus aria-hidden="true" size={16} />
              Přidat hru
            </PixelButton>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 border-t-2 border-outline pt-5 lg:grid-cols-[minmax(0,1fr)_13rem_10rem]">
          <label className="grid gap-2">
            <span className="font-pixel text-[8px] leading-4 text-cream-muted">
              HLEDAT
            </span>

            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted"
                size={16}
              />

              <input
                className="w-full border-2 border-outline bg-panel px-10 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0/0.35)] placeholder:text-cream-muted focus:border-amber focus:outline-none"
                placeholder="Název hry nebo vlastník"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="font-pixel text-[8px] leading-4 text-cream-muted">
              KATEGORIE
            </span>

            <select
              className="border-2 border-outline bg-panel px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0/0.35)] focus:border-amber focus:outline-none"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as GameCategory | "all",
                )
              }
            >
              <option value="all">Všechny hry</option>

              {GAME_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {GAME_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="font-pixel text-[8px] leading-4 text-cream-muted">
              POČET HRÁČŮ
            </span>

            <input
              className="border-2 border-outline bg-panel px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0/0.35)] placeholder:text-cream-muted focus:border-amber focus:outline-none"
              inputMode="numeric"
              max="20"
              min="1"
              placeholder="Např. 4"
              type="number"
              value={playerCountFilter}
              onChange={(event) =>
                setPlayerCountFilter(event.target.value)
              }
            />
          </label>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-cream-muted">
          <input
            checked={showUnavailable}
            className="size-4 accent-amber"
            type="checkbox"
            onChange={(event) =>
              setShowUnavailable(event.target.checked)
            }
          />

          Zobrazit i aktuálně nedostupné hry
        </label>
      </PixelPanel>

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="font-pixel text-[9px] leading-5 text-cream-muted">
            HRY V KNIHOVNĚ
          </p>

          <p className="font-pixel text-[8px] leading-4 text-amber-light">
            {visibleGames.length} HER
          </p>
        </div>

        {visibleGames.length === 0 ? (
          <EmptyState
            description={
              games.length === 0
                ? isAdmin
                  ? "Herní police je zatím prázdná. Přidej první titul pro partu."
                  : "Herní police je zatím prázdná. Admin sem může přidat první titul."
                : "Těmto filtrům momentálně neodpovídá žádná hra."
            }
            icon={Gamepad2}
            title={
              games.length === 0
                ? "Zatím žádné hry"
                : "Žádná hra neprošla filtrem"
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isAdmin={isAdmin}
                onEdit={(selectedGame) =>
                  setModalState({
                    mode: "edit",
                    game: selectedGame,
                  })
                }
              />
            ))}
          </div>
        )}
      </section>

      {modalState?.mode === "create" ? (
        <GameForm
          key="create-game"
          onClose={() => setModalState(null)}
          open
        />
      ) : null}

      {modalState?.mode === "edit" ? (
        <GameForm
          key={`edit-game-${modalState.game.id}`}
          game={modalState.game}
          onClose={() => setModalState(null)}
          open
        />
      ) : null}
    </div>
  );
}