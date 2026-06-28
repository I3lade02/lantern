"use client";

import {
  Clock3,
  Pencil,
  UsersRound,
} from "lucide-react";

import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import type { Game } from "@/types/game";
import {
  GAME_CATEGORY_LABELS,
  GAME_OWNERSHIP_LABELS,
} from "@/types/game";

type GameCardProps = {
  game: Game;
  isAdmin: boolean;
  onEdit: (game: Game) => void;
};

function getComplexityLabel(complexity: number): string {
  return `${"◆".repeat(complexity)}${"◇".repeat(5 - complexity)}`;
}

export function GameCard({
  game,
  isAdmin,
  onEdit,
}: GameCardProps) {
  return (
    <article className="flex h-full flex-col border-2 border-outline bg-panel p-5 shadow-pixel">
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-12 shrink-0 place-items-center border-2 border-outline bg-panel-deep font-pixel text-xl text-amber shadow-pixel-sm">
          G
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <PixelBadge tone={game.isAvailable ? "moss" : "wine"}>
            {game.isAvailable ? "K DISPOZICI" : "NEDOSTUPNÁ"}
          </PixelBadge>

          <PixelBadge tone="muted">
            {GAME_CATEGORY_LABELS[game.category]}
          </PixelBadge>
        </div>
      </div>

      <h2 className="mt-5 font-pixel text-[11px] leading-7 text-cream">
        {game.title}
      </h2>

      <div className="mt-4 grid gap-3 border-y-2 border-outline-soft py-4 text-sm text-cream-muted">
        <div className="flex items-center gap-3">
          <UsersRound
            aria-hidden="true"
            className="shrink-0 text-moss-light"
            size={16}
          />

          <span>
            {game.minPlayers} až {game.maxPlayers} hráčů
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Clock3
            aria-hidden="true"
            className="shrink-0 text-amber-light"
            size={16}
          />

          <span>Přibližně {game.playTimeMinutes} min</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <p className="text-cream-muted">
          Obtížnost:{" "}
          <span className="font-pixel text-[9px] text-amber-light">
            {getComplexityLabel(game.complexity)}
          </span>
        </p>

        <p className="text-cream-muted">
          {GAME_OWNERSHIP_LABELS[game.ownership]}:{" "}
          <span className="font-semibold text-cream">
            {game.ownerName}
          </span>
        </p>
      </div>

      {game.notes ? (
        <p className="mt-4 text-sm leading-6 text-cream-muted">
          {game.notes}
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-cream-muted">
          Bez poznámky. Pravidla číhají někde poblíž herní police.
        </p>
      )}

      <div className="mt-auto pt-5">
        {isAdmin ? (
          <PixelButton
            fullWidth
            onClick={() => onEdit(game)}
            size="sm"
            variant="amber"
          >
            <Pencil aria-hidden="true" size={15} />
            Upravit hru
          </PixelButton>
        ) : null}
      </div>
    </article>
  );
}