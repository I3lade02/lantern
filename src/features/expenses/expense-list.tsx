import { ReceiptText } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { ExpenseRow } from "@/features/expenses/expense-row";
import type { ExpenseActor } from "@/features/expenses/expense-service";
import type { Expense } from "@/types/expense";

type ExpenseListProps = {
  expenses: Expense[];
  isAdmin: boolean;
  actor: ExpenseActor | null;
  onEdit: (expense: Expense) => void;
  sessionTitles?: Map<string, string>;
  showSession?: boolean;
  emptyTitle: string;
  emptyDescription: string;
};

export function ExpenseList({
  expenses,
  isAdmin,
  actor,
  onEdit,
  sessionTitles = new Map(),
  showSession = false,
  emptyTitle,
  emptyDescription,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        description={emptyDescription}
        icon={ReceiptText}
        title={emptyTitle}
      />
    );
  }

  return (
    <PixelPanel padding="none" tone="deep">
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.id}
          actor={actor}
          expense={expense}
          isAdmin={isAdmin}
          onEdit={onEdit}
          sessionTitle={sessionTitles.get(expense.sessionId)}
          showSession={showSession}
        />
      ))}
    </PixelPanel>
  );
}