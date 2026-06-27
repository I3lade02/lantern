import { PageShell } from "@/components/shared/page-shell";
import { ExpenseOverview } from "@/features/expenses/expense-overview";

export const metadata = {
  title: "Útraty",
};

export default function ExpensesPage() {
  return (
    <PageShell
      description="Zapisuj společné položky, kdo platil a jak se částka rozdělí mezi partu."
      eyebrow="PARTY EXPENSE LEDGER"
      title="Útraty"
    >
      <ExpenseOverview />
    </PageShell>
  );
}