import { PageShell } from "@/components/shared/page-shell";
import { DebtOverview } from "@/features/debts/debt-overview";

export const metadata = {
  title: "Dluhy",
};

export default function DebtsPage() {
  return (
    <PageShell
      description="Vypočítej férové vyrovnání útrat, sleduj otevřené převody a ukládej historii zaplacených dluhů."
      eyebrow="SETTLEMENT BOARD"
      title="Dluhy"
    >
      <DebtOverview />
    </PageShell>
  );
}