"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CreditCard,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import {
  buildCzechQrPayment,
  createLanternPaymentMessage,
  isValidVariableSymbol,
  normalizeCzechRecipientAccount,
  sanitizeSpaydMessage,
} from "@/lib/qr-payment";
import {
  getDebtErrorMessage,
  submitDebtPayment,
  type DebtActor,
} from "@/features/debts/debt-service";
import { formatCzkFromCents } from "@/lib/money";
import type { Debt } from "@/types/debt";
import type { AppSettings } from "@/types/settings";

type DebtQrPaymentModalProps = {
  debt: Debt;
  settings: AppSettings | null;
  actor: DebtActor;
  onClose: () => void;
};

export function DebtQrPaymentModal({
  debt,
  settings,
  actor,
  onClose,
}: DebtQrPaymentModalProps) {
  const [message, setMessage] = useState(() =>
    createLanternPaymentMessage(
      settings?.defaultPaymentMessage,
      debt.sessionTitle,
      debt.fromUserName,
    ),
  );

  const [variableSymbol, setVariableSymbol] = useState(
    settings?.defaultPaymantVariableSymbol ?? "",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountResult = settings?.paymentRecipientAccount
  ? normalizeCzechRecipientAccount(
      settings.paymentRecipientAccount,
    )
  : null;

  const recipientIban =
    accountResult && "iban" in accountResult
      ? accountResult.iban
      : null;

  const accountError =
    accountResult && "error" in accountResult
      ? accountResult.error
      : null;

  const recipientName = settings?.paymentRecipientName?.trim() ?? "";
  const sanitizedMessage = sanitizeSpaydMessage(message);

  const variableSymbolError =
    variableSymbol.trim() &&
    !isValidVariableSymbol(variableSymbol.trim())
      ? "Variabilní symbol musí obsahovat 1 až 10 číslic."
      : null;

  const qrPayload = useMemo(() => {
    if (
      !recipientIban ||
      !recipientName ||
      !sanitizedMessage ||
      variableSymbolError
    ) {
      return null;
    }

    try {
      return buildCzechQrPayment({
        recipientIban,
        amountCents: debt.amountCents,
        message: sanitizedMessage,
        variableSymbol: variableSymbol.trim() || null,
      });
    } catch {
      return null;
    }
  }, [
    debt.amountCents,
    recipientIban,
    recipientName,
    sanitizedMessage,
    variableSymbol,
    variableSymbolError,
  ]);

  const configurationError =
    !settings?.paymentRecipientAccount
      ? "Admin zatím nenastavil účet příjemce QR plateb."
      : !recipientName
        ? "Admin zatím nenastavil název příjemce."
        : accountError
          ? accountError
          : null;

  async function handlePaymentSubmitted() {
    if (
      !recipientIban ||
      !recipientName ||
      !qrPayload ||
      variableSymbolError
    ) {
      toast.error(
        "QR platbu nelze připravit. Zkontroluj nastavení platby.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      await submitDebtPayment(
        debt,
        {
          recipientAccount: recipientIban,
          recipientName,
          variableSymbol: variableSymbol.trim() || null,
          message: sanitizedMessage,
        },
        actor,
      );

      toast.success(
        "Platba byla označena jako odeslaná a čeká na potvrzení adminem.",
      );

      onClose();
    } catch (error) {
      toast.error(getDebtErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PixelModal
      description="Naskenuj QR ve své bankovní aplikaci a po odeslání platbu označ jako zaplacenou."
      onClose={onClose}
      open
      size="md"
      title="Zaplatit QR platbou"
    >
      {configurationError ? (
        <div className="border-2 border-danger bg-wine-dark p-5">
          <p className="font-pixel text-[10px] leading-6 text-cream">
            QR PLATBA NENÍ PŘIPRAVENÁ
          </p>

          <p className="mt-3 text-sm leading-6 text-cream-muted">
            {configurationError}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-5 border-2 border-outline bg-panel-deep p-5 shadow-pixel-sm sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="mx-auto grid size-56 place-items-center border-4 border-outline bg-cream p-3 shadow-pixel">
              {qrPayload ? (
                <QRCodeSVG
                  aria-label="QR kód pro českou platbu"
                  bgColor="#f8edcf"
                  fgColor="#0b1020"
                  level="M"
                  size={196}
                  value={qrPayload}
                />
              ) : (
                <QrCode
                  aria-hidden="true"
                  className="text-wine"
                  size={72}
                />
              )}
            </div>

            <div>
              <p className="font-pixel text-[9px] leading-5 text-amber-light">
                QR PLATBA
              </p>

              <p className="mt-3 font-pixel text-lg leading-9 text-cream">
                {formatCzkFromCents(debt.amountCents)}
              </p>

              <p className="mt-3 text-sm leading-6 text-cream-muted">
                <span className="font-semibold text-cream">
                  {debt.fromUserName}
                </span>{" "}
                pošle{" "}
                <span className="font-semibold text-cream">
                  {debt.toUserName}
                </span>
                .
              </p>

              <div className="mt-4 grid gap-2 border-t-2 border-outline-soft pt-4 text-sm text-cream-muted">
                <p>
                  Příjemce:{" "}
                  <span className="font-semibold text-cream">
                    {recipientName}
                  </span>
                </p>

                <p>
                  Účet:{" "}
                  <span className="font-semibold text-cream">
                    {recipientIban}
                  </span>
                </p>

                {variableSymbol.trim() ? (
                  <p>
                    VS:{" "}
                    <span className="font-semibold text-cream">
                      {variableSymbol}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <PixelInput
            error={variableSymbolError ?? undefined}
            id={`payment-vs-${debt.id}`}
            inputMode="numeric"
            label="Variabilní symbol"
            maxLength={10}
            hint="Nepovinné. Můžeš jej upravit před vytvořením QR kódu."
            value={variableSymbol}
            onChange={(event) =>
              setVariableSymbol(
                event.target.value.replace(/\D/g, ""),
              )
            }
          />

          <div className="grid gap-2">
            <label
              className="font-pixel text-[10px] leading-5 text-cream"
              htmlFor={`payment-message-${debt.id}`}
            >
              Zpráva pro příjemce
            </label>

            <textarea
              className="min-h-24 w-full resize-y border-2 border-outline bg-panel-deep px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0/0.35)] placeholder:text-cream-muted focus:border-amber focus:outline-none"
              id={`payment-message-${debt.id}`}
              maxLength={100}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />

            <p className="text-sm leading-6 text-cream-muted">
              QR standard odstraní diakritiku a speciální znaky, které by
              mohly rozbít platební řetězec.
            </p>
          </div>

          <div className="flex gap-3 border-2 border-outline bg-panel p-4 shadow-pixel-sm">
            <div className="grid size-10 shrink-0 place-items-center border-2 border-outline bg-amber text-void">
              <CreditCard aria-hidden="true" size={18} />
            </div>

            <p className="text-sm leading-6 text-cream-muted">
              LANtern neumí ověřit skutečný příchozí převod v bance. Tlačítko
              níže pouze označí platbu jako odeslanou. Admin ji potom ručně
              potvrdí.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t-2 border-outline-soft pt-5 sm:flex-row sm:justify-end">
            <PixelButton
              disabled={isSubmitting}
              onClick={onClose}
              variant="ghost"
            >
              Zavřít
            </PixelButton>

            <PixelButton
              disabled={isSubmitting || !qrPayload}
              onClick={handlePaymentSubmitted}
              variant="moss"
            >
              <BadgeCheck aria-hidden="true" size={16} />
              {isSubmitting
                ? "Ukládám…"
                : "Označit jako zaplaceno"}
            </PixelButton>
          </div>
        </div>
      )}
    </PixelModal>
  );
}