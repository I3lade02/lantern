type AccountValidationSuccess = {
  iban: string;
  displayAccount: string;
};

type AccountValidationFailure = {
  error: string;
};

export type AccountValidationResult =
  | AccountValidationSuccess
  | AccountValidationFailure;

type SpaydPaymentInput = {
  recipientIban: string;
  amountCents: number;
  message: string;
  variableSymbol?: string | null;
};

function remainder97(value: string): number {
  let remainder = 0;

  for (const character of value) {
    remainder = (remainder * 10 + Number(character)) % 97;
  }

  return remainder;
}

function ibanToNumericString(iban: string): string {
  return iban.replace(/[A-Z]/g, (character) =>
    String(character.charCodeAt(0) - 55),
  );
}

function isValidIban(iban: string): boolean {
  const compactIban = iban.replace(/\s/g, "").toUpperCase();

  if (!/^CZ\d{22}$/.test(compactIban)) {
    return false;
  }

  const rearranged =
    compactIban.slice(4) + compactIban.slice(0, 4);

  return remainder97(ibanToNumericString(rearranged)) === 1;
}

export function normalizeCzechRecipientAccount(
  rawAccount: string,
): AccountValidationResult {
  const compactAccount = rawAccount.replace(/\s/g, "").toUpperCase();

  if (compactAccount.startsWith("CZ")) {
    if (!isValidIban(compactAccount)) {
      return {
        error:
          "Český IBAN není platný. Očekává se formát například CZ6508000000192000145399.",
      };
    }

    return {
      iban: compactAccount,
      displayAccount: compactAccount,
    };
  }

  const localAccountMatch = compactAccount.match(
    /^(?:(\d{1,6})-)?(\d{1,10})\/(\d{4})$/,
  );

  if (!localAccountMatch) {
    return {
      error:
        "Zadej český účet ve tvaru 123456-1234567890/0100, 1234567890/0100 nebo český IBAN.",
    };
  }

  const [, rawPrefix = "", rawAccountNumber, bankCode] =
    localAccountMatch;

  const prefix = rawPrefix.padStart(6, "0");
  const accountNumber = rawAccountNumber.padStart(10, "0");

  const bban = `${bankCode}${prefix}${accountNumber}`;
  const checkDigits = 98 - remainder97(`${bban}123500`);

  const iban = `CZ${String(checkDigits).padStart(2, "0")}${bban}`;

  if (!isValidIban(iban)) {
    return {
      error:
        "Účet se nepodařilo převést na platný český IBAN. Zkontroluj číslo účtu a kód banky.",
    };
  }

  const displayAccount = rawPrefix
    ? `${rawPrefix}-${rawAccountNumber}/${bankCode}`
    : `${rawAccountNumber}/${bankCode}`;

  return {
    iban,
    displayAccount,
  };
}

export function isValidVariableSymbol(value: string): boolean {
  return /^\d{1,10}$/.test(value);
}

export function sanitizeSpaydMessage(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[*:]/g, " ")
    .replace(/[^A-Z0-9 .,\-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function createLanternPaymentMessage(
  defaultMessage: string | null | undefined,
  sessionTitle: string,
  payerName: string,
): string {
  const prefix = defaultMessage?.trim() || "LANtern";

  return `${prefix} - ${sessionTitle} - ${payerName}`;
}

export function buildCzechQrPayment(
  input: SpaydPaymentInput,
): string {
  if (!isValidIban(input.recipientIban)) {
    throw new Error("Účet příjemce není platný český IBAN.");
  }

  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Částka QR platby musí být větší než 0 Kč.");
  }

  const variableSymbol = input.variableSymbol?.trim() ?? "";

  if (variableSymbol && !isValidVariableSymbol(variableSymbol)) {
    throw new Error(
      "Variabilní symbol musí obsahovat 1 až 10 číslic.",
    );
  }

  const message = sanitizeSpaydMessage(input.message);

  if (!message) {
    throw new Error("Zpráva pro příjemce nesmí být prázdná.");
  }

  const amount = (input.amountCents / 100).toFixed(2);

  const parts = [
    "SPD*1.0",
    `ACC:${input.recipientIban}`,
    `AM:${amount}`,
    "CC:CZK",
    `MSG:${message}`,
  ];

  if (variableSymbol) {
    parts.push(`X-VS:${variableSymbol}`);
  }

  return parts.join("*");
}