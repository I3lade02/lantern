import { PageShell } from "@/components/shared/page-shell";
import { GameOverview } from "@/features/games/game-overview";

export const metadata = {
  title: "Hry",
};

export default function GamesPage() {
  return (
    <PageShell
      description="Herní knihovna party, filtry podle počtu hráčů a plánování titulů k jednotlivým sessions."
      eyebrow="GAME SHELF"
      title="Hry"
    >
      <GameOverview />
    </PageShell>
  );
}