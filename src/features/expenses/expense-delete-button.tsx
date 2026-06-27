"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import {
  deleteExpense,
  getExpenseErrorMessage,
  type ExpenseActor,
} from "@/features/expenses/expense-service";
import type { Expense } from "@/types/expense";

type ExpenseDeleteButtonProps = {
  expense: Expense;
  actor: ExpenseActor;
};

export function ExpenseDeleteButton({
  expense,
  actor,
}: ExpenseDeleteButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await deleteExpense(expense.id, expense.title, expense.sessionId, actor);

      toast.success("Útrata byla smazána.");
      setIsConfirmOpen(false);
    } catch (error) {
      toast.error(getExpenseErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PixelButton
        aria-label={`Smazat útratu ${expense.title}`}
        className="px-3!"
        onClick={() => setIsConfirmOpen(true)}
        size="sm"
        variant="danger"
      >
        <Trash2 aria-hidden="true" size={15} />
      </PixelButton>

      <PixelModal
        description="Tato akce smaže položku z knihy útrat. Historii nelze obnovit."
        onClose={() => setIsConfirmOpen(false)}
        open={isConfirmOpen}
        size="sm"
        title="Smazat útratu?"
      >
        <p className="text-sm leading-6 text-cream-muted">
          Opravdu chceš smazat položku{" "}
          <span className="font-semibold text-cream">„{expense.title}“</span>?
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <PixelButton
            disabled={isDeleting}
            onClick={() => setIsConfirmOpen(false)}
            variant="ghost"
          >
            Nechat být
          </PixelButton>

          <PixelButton
            disabled={isDeleting}
            onClick={handleDelete}
            variant="danger"
          >
            <Trash2 aria-hidden="true" size={16} />
            {isDeleting ? "Mažu…" : "Ano, smazat"}
          </PixelButton>
        </div>
      </PixelModal>
    </>
  );
}