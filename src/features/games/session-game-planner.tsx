"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Gamepad2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { toast } from "@/components/ui/pixel-toast";
import { useAuth } from "@/features/auth/auth-provider";
import {
  addGameToSession,
  getGameErrorMessage,
  removeGameFromSession,
} from "@/features/games/game-service";
import { useGames } from "@/features/games/use-games";
import type { Session } from "@/types/session";

type SessionGamePlannerProps = {
  session: Session;
};

function getActorName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  return displayName?.trim() || email?.split("@")[0] || "Člen party";
}

export function SessionGamePlanner({
  session,
}: SessionGamePlannerProps) {
  const { profile, profileStatus, user } = useAuth();

  const {
    games,
    isLoading,
    error,
  } = useGames(profileStatus === "ready");

  const [selectedGameId, setSelectedGameId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = profile?.role === "admin";

  const plannedGames = games.filter((game) =>
    session.plannedGameIds.includes(game.id),
  );

  const availableGames = games.filter(
    (game) =>
      game.isAvailable &&
      !session.plannedGameIds.includes(game.id),
  );

  async function handleAddGame() {
    if (!user || !selectedGameId) {
      return;
    }

    const selectedGame = games.find(
      (game) => game.id === selectedGameId,
    );

    if (!selectedGame) {
      toast.error("Vybranou hru se nepodařilo najít.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addGameToSession(session, selectedGame, {
        id: user.uid,
        name: getActorName(profile?.displayName, user.email),
      });

      setSelectedGameId("");
      toast.success(`Hra „${selectedGame.title}“ byla přidána k session.`);
    } catch (error) {
      toast.error(getGameErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveGame(gameId: string) {
    setIsSubmitting(true);

    try {
      await removeGameFromSession(session.id, gameId);
      toast.success("Hra byla odebrána z plánu session.");
    } catch (error) {
      toast.error(getGameErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <PixelPanel tone="deep">
        <p className="text-sm text-cream-muted">
          Načítám herní knihovnu…
        </p>
      </PixelPanel>
    );
  }

  if (error) {
    return (
      <PixelPanel tone="deep">
        <div className="flex gap-3">
          <RefreshCw
            aria-hidden="true"
            className="shrink-0 text-wine-light"
            size={18}
          />

          <p className="text-sm leading-6 text-cream-muted">
            {error}
          </p>
        </div>
      </PixelPanel>
    );
  }

  return (
    <PixelPanel tone="deep">
      <div className="grid size-11 place-items-center border-2 border-outline bg-panel-muted text-amber shadow-pixel-sm">
        <Gamepad2 aria-hidden="true" size={20} />
      </div>

      <h2 className="mt-5 font-pixel text-[11px] leading-7 text-cream">
        Plánované hry
      </h2>

      <p className="mt-3 text-sm leading-6 text-cream-muted">
        Hry, které čekají na stůl během této game night.
      </p>

      {plannedGames.length === 0 ? (
        <p className="mt-5 border-2 border-outline bg-panel p-3 text-sm leading-6 text-cream-muted">
          Zatím není vybraný žádný titul.
        </p>
      ) : (
        <div className="mt-5 grid gap-2">
          {plannedGames.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between gap-3 border-2 border-outline bg-panel p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-cream">
                  {game.title}
                </p>

                <p className="mt-1 text-xs text-cream-muted">
                  {game.minPlayers} až {game.maxPlayers} hráčů ·{" "}
                  {game.playTimeMinutes} min
                </p>
              </div>

              {isAdmin ? (
                <PixelButton
                  aria-label={`Odebrat hru ${game.title} z plánu`}
                  className="!px-3"
                  disabled={isSubmitting}
                  onClick={() => handleRemoveGame(game.id)}
                  size="sm"
                  variant="wine"
                >
                  <X aria-hidden="true" size={15} />
                </PixelButton>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {isAdmin ? (
        <div className="mt-5 grid gap-3 border-t-2 border-outline-soft pt-5">
          <select
            className="w-full border-2 border-outline bg-panel px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0_/_0.35)] focus:border-amber focus:outline-none"
            disabled={isSubmitting || availableGames.length === 0}
            value={selectedGameId}
            onChange={(event) => setSelectedGameId(event.target.value)}
          >
            <option value="">
              {availableGames.length === 0
                ? "Žádné další dostupné hry"
                : "Vyber hru pro session"}
            </option>

            {availableGames.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title} · {game.minPlayers} až {game.maxPlayers} hráčů
              </option>
            ))}
          </select>

          <PixelButton
            disabled={!selectedGameId || isSubmitting}
            fullWidth
            onClick={handleAddGame}
            size="sm"
            variant="moss"
          >
            <Plus aria-hidden="true" size={15} />
            {isSubmitting ? "Ukládám…" : "Přidat do plánu"}
          </PixelButton>
        </div>
      ) : null}

      <Link
        className="mt-5 inline-flex text-sm font-semibold text-amber-light underline underline-offset-4 hover:text-amber"
        href="/games"
      >
        Otevřít herní knihovnu
      </Link>
    </PixelPanel>
  );
}