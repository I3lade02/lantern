import { Dices } from "lucide-react";

import { FeatureNotice } from "@/components/shared/feature-notice";
import { PageShell } from "@/components/shared/page-shell";

export const metadata = {
  title: "Dice Lab",
};

export default function DiceLabPage() {
  return (
    <PageShell
      description="Pixelová laboratoř pro d4, d6, d8, d10, d12, d20 i d100."
      eyebrow="RNG SANCTUARY"
      title="Dice Lab"
    >
      <FeatureNotice
        description="Tady vznikne 2D animovaný hod kostkou, modifier, advantage, disadvantage, critical hit, critical fail a Firestore historie hodů."
        eyebrow="DICE ENGINE"
        icon={Dices}
        nextStep="Dice Lab napojíme po Sessions a Debt systému, protože hody mohou volitelně patřit ke konkrétní session."
        title="Kostky ještě spí v pytlíku"
      />
    </PageShell>
  );
}