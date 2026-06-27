"use client";

import { useState } from "react";
import { Save, Settings2 } from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import {
  isValidVariableSymbol,
  normalizeCzechRecipientAccount,
} from "@/lib/qr-payment";
import {
  savePaymentSettings,
} from "@/features/payments/payment-settings-service";
import type { AppSettings } from "@/types/settings";

type PaymentSettingsModalProps = {
  settings: AppSettings | null;
  onClose: () => void;
};

export function PaymentSettingsModal({
  settings,
  onClose,
}: PaymentSettingsModalProps) {
  const [recipientAccount, setRecipientAccount] = useState(
    settings?.paymentRecipientAccount ?? "",
  );

  const [recipientName, setRecipientName] = useState(
    settings?.paymentRecipientName ?? "",
  );

  const [defaultMessage, setDefaultMessage] = useState(
    settings?.defaultPaymentMessage ?? "LANtern",
  );

  const [defaultVariableSymbol, setDefaultVariableSymbol] = useState(
    settings?.defaultPaymantVariableSymbol ?? "",
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const accountResult = normalizeCzechRecipientAccount(
      recipientAccount,
    );

    if ("error" in accountResult) {
      setFormError(accountResult.error);
      return;
    }

    const trimmedRecipientName = recipientName.trim();
    const trimmedMessage = defaultMessage.trim();
    const trimmedVariableSymbol = defaultVariableSymbol.trim();

    if (trimmedRecipientName.length < 2) {
      setFormError("Název příjemce musí mít alespoň 2 znaky.");
      return;
    }

    if (trimmedRecipientName.length > 120) {
      setFormError("Název příjemce může mít maximálně 120 znaků.");
      return;
    }

    if (trimmedMessage.length > 60) {
      setFormError(
        "Výchozí zpráva pro platbu může mít maximálně 60 znaků.",
      );
      return;
    }

    if (
      trimmedVariableSymbol &&
      !isValidVariableSymbol(trimmedVariableSymbol)
    ) {
      setFormError(
        "Výchozí variabilní symbol musí obsahovat 1 až 10 číslic.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await savePaymentSettings({
        currentSettings: settings,
        recipientAccount: accountResult.iban,
        recipientName: trimmedRecipientName,
        defaultMessage: trimmedMessage || null,
        defaultVariableSymbol: trimmedVariableSymbol || null,
      });

      toast.success("Nastavení QR plateb bylo uloženo.");
      onClose();
    } catch (error) {
      console.error("Nepodařilo se uložit QR nastavení:", error);

      toast.error(
        "Nastavení QR plateb se nepodařilo uložit. Zkus to znovu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PixelModal
      description="Nastav účet, na který mají členové party posílat vyrovnání dluhů."
      onClose={onClose}
      open
      size="md"
      title="Nastavení QR plateb"
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="flex gap-3 border-2 border-outline bg-panel-deep p-4 shadow-pixel-sm">
          <div className="grid size-10 shrink-0 place-items-center border-2 border-outline bg-amber text-void">
            <Settings2 aria-hidden="true" size={18} />
          </div>

          <p className="text-sm leading-6 text-cream-muted">
            Můžeš zadat účet ve formátu{" "}
            <span className="font-semibold text-cream">
              1234567890/0100
            </span>
            ,{" "}
            <span className="font-semibold text-cream">
              123456-1234567890/0100
            </span>{" "}
            nebo rovnou český IBAN.
          </p>
        </div>

        <PixelInput
          id="payment-recipient-account"
          label="Účet příjemce"
          placeholder="1234567890/0100 nebo CZ..."
          required
          value={recipientAccount}
          onChange={(event) => setRecipientAccount(event.target.value)}
        />

        <PixelInput
          id="payment-recipient-name"
          label="Název příjemce"
          placeholder="Například Ondra Beránek"
          required
          value={recipientName}
          onChange={(event) => setRecipientName(event.target.value)}
        />

        <PixelInput
          id="payment-default-message"
          label="Výchozí zpráva pro platbu"
          maxLength={60}
          placeholder="LANtern"
          value={defaultMessage}
          onChange={(event) => setDefaultMessage(event.target.value)}
        />

        <PixelInput
          id="payment-default-variable-symbol"
          inputMode="numeric"
          label="Výchozí variabilní symbol"
          maxLength={10}
          hint="Nepovinné. Musí obsahovat pouze číslice."
          placeholder="Například 20260001"
          value={defaultVariableSymbol}
          onChange={(event) =>
            setDefaultVariableSymbol(
              event.target.value.replace(/\D/g, ""),
            )
          }
        />

        {formError ? (
          <p className="border-2 border-danger bg-wine-dark p-3 text-sm leading-6 text-cream">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t-2 border-outline-soft pt-5 sm:flex-row sm:justify-end">
          <PixelButton
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            Zrušit
          </PixelButton>

          <PixelButton
            disabled={isSubmitting}
            type="submit"
            variant="moss"
          >
            <Save aria-hidden="true" size={16} />
            {isSubmitting ? "Ukládám…" : "Uložit nastavení"}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}