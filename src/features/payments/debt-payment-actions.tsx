"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { DebtQrPaymentModal } from "@/features/payments/debt-qr-payment-modal";
import type { DebtActor } from "@/features/debts/debt-service";
import type { Debt } from "@/types/debt";
import type { AppSettings } from "@/types/settings";

type DebtPaymentActionsProps = {
  debt: Debt;
  actor: DebtActor;
  settings: AppSettings | null;
};

export function DebtPaymentActions({
  debt,
  actor,
  settings,
}: DebtPaymentActionsProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);

  const canPay =
    debt.status === "open" && debt.fromUserId === actor.id;

  if (!canPay) {
    return null;
  }

  return (
    <>
      <PixelButton
        className="px-3!"
        onClick={() => setIsQrOpen(true)}
        size="sm"
        variant="amber"
      >
        <QrCode aria-hidden="true" size={15} />
        QR platba
      </PixelButton>

      {isQrOpen ? (
        <DebtQrPaymentModal
          actor={actor}
          debt={debt}
          onClose={() => setIsQrOpen(false)}
          settings={settings}
        />
      ) : null}
    </>
  );
}