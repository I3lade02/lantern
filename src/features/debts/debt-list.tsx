import { HandCoins } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { DebtRow } from "@/features/debts/debt-row";
import type { DebtActor } from "@/features/debts/debt-service";
import type { Debt } from "@/types/debt";

type DebtListProps = {
  debts: Debt[];
  emptyTitle: string;
  emptyDescription: string;
  isAdmin: boolean;
  actor: DebtActor | null;
};

export function DebtList({
  debts,
  emptyTitle,
  emptyDescription,
  isAdmin,
  actor,
}: DebtListProps) {
  if (debts.length === 0) {
    return (
      <EmptyState
        description={emptyDescription}
        icon={HandCoins}
        title={emptyTitle}
      />
    );
  }

  return (
    <PixelPanel padding="none" tone="deep">
      {debts.map((debt) => (
        <DebtRow
          key={debt.id}
          actor={actor}
          debt={debt}
          isAdmin={isAdmin}
        />
      ))}
    </PixelPanel>
  );
}