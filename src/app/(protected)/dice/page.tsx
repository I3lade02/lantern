import { PageShell } from "@/components/shared/page-shell";
import { DiceLab } from "@/features/dice/dice-lab";

export const metadata = {
  title: "Dice Lab",
};

export default function DiceLabPage() {
  return (
    <PageShell
      description="Hody d4 až d100, výhoda, nevýhoda, critical hity a společná kronika kostek."
      eyebrow="RNG SANCTUARY"
      title="Dice Lab"
    >
      <DiceLab />
    </PageShell>
  );
}