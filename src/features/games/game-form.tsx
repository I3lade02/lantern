"use client";

import { useState } from "react";
import {
  Save,
  Swords,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import {
  createGame,
  getGameErrorMessage,
  updateGame,
} from "@/features/games/game-service";
import { useAuth } from "@/features/auth/auth-provider";
import type {
  Game,
  GameCategory,
  GameOwnership,
} from "@/types/game";
import {
  GAME_CATEGORIES,
  GAME_CATEGORY_LABELS,
  GAME_OWNERSHIP_LABELS,
  GAME_OWNERSHIP_TYPES,
} from "@/types/game";

type GameFormProps = {
  open: boolean;
  onClose: () => void;
  game?: Game;
};

const fieldClassName =
  "w-full border-2 border-outline bg-panel-deep px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0_/_0.35)] placeholder:text-cream-muted focus:border-amber focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

function getActorName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  return displayName?.trim() || email?.split("@")[0] || "Člen party";
}

export function GameForm({
  open,
  onClose,
  game,
}: GameFormProps) {
  const { profile, user } = useAuth();

  const [title, setTitle] = useState(game?.title ?? "");
  const [category, setCategory] = useState<GameCategory>(
    game?.category ?? "boardgame",
  );

  const [minPlayers, setMinPlayers] = useState(
    String(game?.minPlayers ?? 2),
  );

  const [maxPlayers, setMaxPlayers] = useState(
    String(game?.maxPlayers ?? 4),
  );

  const [playTimeMinutes, setPlayTimeMinutes] = useState(
    String(game?.playTimeMinutes ?? 60),
  );

  const [complexity, setComplexity] = useState(
    String(game?.complexity ?? 2),
  );

  const [ownership, setOwnership] = useState<GameOwnership>(
    game?.ownership ?? "party",
  );

  const [ownerName, setOwnerName] = useState(
    game?.ownerName ?? "LANtern parta",
  );

  const [notes, setNotes] = useState(game?.notes ?? "");
  const [isAvailable, setIsAvailable] = useState(
    game?.isAvailable ?? true,
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(game);

  function getNumberValue(
    rawValue: string,
    label: string,
    minimum: number,
    maximum: number,
  ): number | null {
    const value = Number(rawValue);

    if (
      !Number.isInteger(value) ||
      value < minimum ||
      value > maximum
    ) {
      setFormError(
        `${label} musí být celé číslo od ${minimum} do ${maximum}.`,
      );

      return null;
    }

    return value;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!user) {
      setFormError("Přihlášení uživatele není připravené.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedOwnerName = ownerName.trim();
    const trimmedNotes = notes.trim();

    if (trimmedTitle.length < 2 || trimmedTitle.length > 100) {
      setFormError("Název hry musí mít 2 až 100 znaků.");
      return;
    }

    if (trimmedOwnerName.length < 2 || trimmedOwnerName.length > 80) {
      setFormError(
        "Vlastník nebo zdroj hry musí mít 2 až 80 znaků.",
      );

      return;
    }

    if (trimmedNotes.length > 1000) {
      setFormError("Poznámka může mít maximálně 1000 znaků.");
      return;
    }

    const nextMinPlayers = getNumberValue(
      minPlayers,
      "Minimální počet hráčů",
      1,
      20,
    );

    const nextMaxPlayers = getNumberValue(
      maxPlayers,
      "Maximální počet hráčů",
      1,
      20,
    );

    const nextPlayTimeMinutes = getNumberValue(
      playTimeMinutes,
      "Délka hry",
      5,
      600,
    );

    const nextComplexity = getNumberValue(
      complexity,
      "Obtížnost",
      1,
      5,
    );

    if (
      nextMinPlayers === null ||
      nextMaxPlayers === null ||
      nextPlayTimeMinutes === null ||
      nextComplexity === null
    ) {
      return;
    }

    if (nextMaxPlayers < nextMinPlayers) {
      setFormError(
        "Maximální počet hráčů nemůže být menší než minimální počet.",
      );

      return;
    }

    const input = {
      title: trimmedTitle,
      category,

      minPlayers: nextMinPlayers,
      maxPlayers: nextMaxPlayers,
      playTimeMinutes: nextPlayTimeMinutes,
      complexity: nextComplexity,

      ownership,
      ownerName: trimmedOwnerName,

      notes: trimmedNotes,
      isAvailable,
    };

    setIsSubmitting(true);

    try {
      if (game) {
        await updateGame(game.id, input);
        toast.success("Hra byla upravena.");
      } else {
        await createGame(input, {
          id: user.uid,
          name: getActorName(profile?.displayName, user.email),
        });

        toast.success("Hra byla přidána do knihovny.");
      }

      onClose();
    } catch (error) {
      toast.error(getGameErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PixelModal
      description={
        isEditMode
          ? "Uprav údaje hry, její dostupnost nebo vlastnictví."
          : "Přidej hru, kterou může parta vytáhnout z herní police."
      }
      onClose={onClose}
      open={open}
      size="lg"
      title={isEditMode ? "Upravit hru" : "Přidat hru"}
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <PixelInput
          id="game-title"
          label="Název hry"
          maxLength={100}
          placeholder="Například Root, Duna: Impérium, Munchkin…"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              className="font-pixel text-[10px] leading-5 text-cream"
              htmlFor="game-category"
            >
              Kategorie
            </label>

            <select
              className={fieldClassName}
              id="game-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as GameCategory)
              }
            >
              {GAME_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {GAME_CATEGORY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label
              className="font-pixel text-[10px] leading-5 text-cream"
              htmlFor="game-complexity"
            >
              Obtížnost 1 až 5
            </label>

            <select
              className={fieldClassName}
              id="game-complexity"
              value={complexity}
              onChange={(event) => setComplexity(event.target.value)}
            >
              <option value="1">1 · Rychlé vysvětlení</option>
              <option value="2">2 · Lehčí hra</option>
              <option value="3">3 · Střední hra</option>
              <option value="4">4 · Těžší strategie</option>
              <option value="5">5 · Mozková pevnost</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <PixelInput
            id="game-min-players"
            inputMode="numeric"
            label="Min. hráčů"
            max="20"
            min="1"
            required
            type="number"
            value={minPlayers}
            onChange={(event) => setMinPlayers(event.target.value)}
          />

          <PixelInput
            id="game-max-players"
            inputMode="numeric"
            label="Max. hráčů"
            max="20"
            min="1"
            required
            type="number"
            value={maxPlayers}
            onChange={(event) => setMaxPlayers(event.target.value)}
          />

          <PixelInput
            id="game-play-time"
            inputMode="numeric"
            label="Délka v minutách"
            max="600"
            min="5"
            required
            type="number"
            value={playTimeMinutes}
            onChange={(event) =>
              setPlayTimeMinutes(event.target.value)
            }
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              className="font-pixel text-[10px] leading-5 text-cream"
              htmlFor="game-ownership"
            >
              Vlastnictví
            </label>

            <select
              className={fieldClassName}
              id="game-ownership"
              value={ownership}
              onChange={(event) => {
                const nextOwnership = event.target.value as GameOwnership;

                setOwnership(nextOwnership);

                if (
                  nextOwnership === "party" &&
                  !ownerName.trim()
                ) {
                  setOwnerName("LANtern parta");
                }
              }}
            >
              {GAME_OWNERSHIP_TYPES.map((item) => (
                <option key={item} value={item}>
                  {GAME_OWNERSHIP_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          <PixelInput
            id="game-owner"
            label={
              ownership === "party"
                ? "Zdroj hry"
                : ownership === "borrowed"
                  ? "Od koho je zapůjčená"
                  : "Vlastník hry"
            }
            maxLength={80}
            placeholder={
              ownership === "party"
                ? "LANtern parta"
                : "Například Petr"
            }
            required
            value={ownerName}
            onChange={(event) => setOwnerName(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label
            className="font-pixel text-[10px] leading-5 text-cream"
            htmlFor="game-notes"
          >
            Poznámka
          </label>

          <textarea
            className={`${fieldClassName} min-h-28 resize-y`}
            id="game-notes"
            maxLength={1000}
            placeholder="Například: Rozšíření Říční lid, doporučené až od čtyř hráčů, pravidla máme vytištěná…"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 border-2 border-outline bg-panel-deep p-4 text-sm text-cream shadow-pixel-sm">
          <input
            checked={isAvailable}
            className="size-4 accent-amber"
            type="checkbox"
            onChange={(event) => setIsAvailable(event.target.checked)}
          />

          <span>
            Hra je aktuálně k dispozici pro další game night.
          </span>
        </label>

        {formError ? (
          <div className="border-2 border-danger bg-wine-dark p-3 text-sm leading-6 text-cream">
            {formError}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t-2 border-outline-soft pt-5 sm:flex-row sm:justify-end">
          <PixelButton
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            Zrušit
          </PixelButton>

          <PixelButton
            disabled={isSubmitting}
            type="submit"
            variant={isEditMode ? "amber" : "moss"}
          >
            {isEditMode ? (
              <Save aria-hidden="true" size={16} />
            ) : (
              <Swords aria-hidden="true" size={16} />
            )}

            {isSubmitting
              ? "Ukládám…"
              : isEditMode
                ? "Uložit změny"
                : "Přidat hru"}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}