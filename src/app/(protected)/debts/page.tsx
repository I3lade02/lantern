import { HandCoins } from "lucide-react";

import { FeatureNotice } from "@/components/shared/feature-notice";
import { PageShell } from "@/components/shared/page-shell";

export const metadata = {
  title: "Dluhy",
};

export default function DebtsPage() {
  return (
    <PageShell
      description="Vyrovnání účtů party bez zbytečné záplavy drobných převodů."
      eyebrow="SETTLEMENT BOARD"
      title="Dluhy"
    >
      <FeatureNotice
        description="Zde bude přehled toho, komu dlužíš, kdo dluží tobě, otevřené platby, jejich potvrzení a historie vyřešených dluhů."
        eyebrow="DEBT ENGINE"
        icon={HandCoins}
        nextStep="Po implementaci útrat vytvoříme algoritmus, který minimalizuje počet převodů mezi členy party."
        title="Pokladna je zatím čistá"
      />
    </PageShell>
  );
}