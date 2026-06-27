export function parseCzkInputToCents(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [wholePart, decimalPart = ""] = normalized.split(".");

  const wholeCents = Number(wholePart) * 100;
  const decimalCents = Number(`${decimalPart}00`.slice(0, 2));

  const amountCents = wholeCents + decimalCents;

  if (!Number.isSafeInteger(amountCents)) {
    return null;
  }

  return amountCents;
}

export function formatCzkFromCents(amountCents: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function formatCentsForInput(amountCents: number): string {
  return (amountCents / 100).toLocaleString("cs-CZ", {
    minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function splitEvenly<T extends { userId: string; userName: string }>(
  amountCents: number,
  participants: T[],
) {
  const baseShare = Math.floor(amountCents / participants.length);
  const remainder = amountCents % participants.length;

  return participants.map((participant, index) => ({
    userId: participant.userId,
    userName: participant.userName,
    amountCents: baseShare + (index < remainder ? 1 : 0),
  }));
}