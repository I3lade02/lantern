import { ReceiptText } from "lucide-react";

import { FeatureNotice } from "@/components/shared/feature-notice";
import { PageShell } from "@/components/shared/page-shell";

export const metadata = {
  title: "Útraty",
};

export default function ExpensesPage() {
  return (
    <PageShell
      description="Pivo, limonáda, pizza, snacky, dortíky a všechny malé finanční side-questy."
      eyebrow="PARTY INVENTORY"
      title="Útraty"
    >
      <FeatureNotice
        description="Zde přidáme formulář útraty, rychlé předvolby položek, výběr plátce, lidí kteří se dělí, napojení na session a editaci pro admina."
        eyebrow="EXPENSE LEDGER"
        icon={ReceiptText}
        nextStep="Po sessions vytvoříme Expense formulář a uložíme každou položku do top-level Firestore kolekce expenses."
        title="Kniha útrat čeká na první zápis"
      />
    </PageShell>
  );
}