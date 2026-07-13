import { randomBytes } from "node:crypto";

import {
  DRINK_CATEGORIES,
  type BarAdminDrink,
  type DrinkCategory,
} from "@/types/bar";

export class BarServerRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "BarServerRequestError";
  }
}

export type StoredDrink = BarAdminDrink;

export function parseRequiredText(
  value: unknown,
  fieldLabel: string,
  minLength: number,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    throw new BarServerRequestError(
      `${fieldLabel} musí být text.`,
    );
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length < minLength) {
    throw new BarServerRequestError(
      `${fieldLabel} musí mít alespoň ${minLength} znaky.`,
    );
  }

  if (normalizedValue.length > maxLength) {
    throw new BarServerRequestError(
      `${fieldLabel} může mít maximálně ${maxLength} znaků.`,
    );
  }

  return normalizedValue;
}

export function parseDocumentId(
  value: unknown,
  fieldLabel: string,
): string {
  return parseRequiredText(
    value,
    fieldLabel,
    1,
    128,
  );
}

export function parseDrinkCategory(
  value: unknown,
): DrinkCategory {
  if (
    typeof value !== "string" ||
    !DRINK_CATEGORIES.includes(value as DrinkCategory)
  ) {
    throw new BarServerRequestError(
      "Kategorie nápoje není platná.",
    );
  }

  return value as DrinkCategory;
}

export function parsePriceCents(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value)
  ) {
    throw new BarServerRequestError(
      "Cena nápoje musí být celé číslo v haléřích.",
    );
  }

  if (value < 1 || value > 100_000) {
    throw new BarServerRequestError(
      "Cena nápoje musí být mezi 0,01 Kč a 1 000 Kč.",
    );
  }

  return value;
}

export function parseAvailability(
  value: unknown,
): boolean {
  if (typeof value !== "boolean") {
    throw new BarServerRequestError(
      "Dostupnost nápoje musí být ano nebo ne.",
    );
  }

  return value;
}

export function parseDrinkImageUrl(
  value: unknown,
): string | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    throw new BarServerRequestError(
      "Obrázek nápoje musí být odkaz.",
    );
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length > 500) {
    throw new BarServerRequestError(
      "Odkaz na obrázek může mít maximálně 500 znaků.",
    );
  }

  if (
    normalizedValue.startsWith("/") &&
    !normalizedValue.startsWith("//")
  ) {
    return normalizedValue;
  }

  try {
    const url = new URL(normalizedValue);

    if (url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }

    return url.toString();
  } catch {
    throw new BarServerRequestError(
      "Použij cestu začínající / nebo platný HTTPS odkaz na obrázek.",
    );
  }
}

export function parseStoredDrink(
  drinkId: string,
  data: Record<string, unknown>,
): StoredDrink {
  const name = parseRequiredText(
    data.name,
    "Název nápoje",
    2,
    100,
  );

  const priceCents = parsePriceCents(
    data.priceCents,
  );

  const category = parseDrinkCategory(
    data.category,
  );

  const imageUrl = parseDrinkImageUrl(
    data.imageUrl,
  );

  const qrToken = parseRequiredText(
    data.qrToken,
    "QR token",
    16,
    128,
  );

  const isAvailable = parseAvailability(
    data.isAvailable,
  );

  return {
    id: drinkId,
    name,
    priceCents,
    category,
    imageUrl,
    qrToken,
    isAvailable,
  };
}

export function createQrToken(): string {
  return randomBytes(24).toString("base64url");
}
