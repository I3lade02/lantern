const BAR_QR_TOKEN_PATTERN =
  /^[a-zA-Z0-9_-]{16,128}$/;

const KNOWN_LANTERN_ORIGINS = [
  "https://lantern.quest",
  "https://www.lantern.quest",
];

function normalizeOrigin(
  value: string | undefined,
): string | null {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  try {
    return new URL(normalizedValue).origin;
  } catch {
    return null;
  }
}

function getConfiguredAppOrigin(): string | null {
  return normalizeOrigin(
    process.env.NEXT_PUBLIC_APP_URL,
  );
}

function getQrTargetOrigin(): string {
  const configuredOrigin = getConfiguredAppOrigin();

  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://lantern.quest";
}

export function getBarScanUrl(
  qrToken: string,
): string {
  return `${getQrTargetOrigin()}/bar/scan/${encodeURIComponent(
    qrToken,
  )}`;
}

export function getBarQrTokenFromValue(
  rawValue: string,
): string | null {
  const value = rawValue.trim();

  if (!value || typeof window === "undefined") {
    return null;
  }

  try {
    const url = new URL(value);

    const acceptedOrigins = new Set([
      window.location.origin,
      ...KNOWN_LANTERN_ORIGINS,
    ]);

    const configuredOrigin = getConfiguredAppOrigin();

    if (configuredOrigin) {
      acceptedOrigins.add(configuredOrigin);
    }

    if (!acceptedOrigins.has(url.origin)) {
      return null;
    }

    const pathname = url.pathname.replace(
      /\/+$/,
      "",
    );

    const match = pathname.match(
      /^\/bar\/scan\/([^/]+)$/,
    );

    const token = match?.[1];

    if (!token || !BAR_QR_TOKEN_PATTERN.test(token)) {
      return null;
    }

    return token;
  } catch {
    return null;
  }
}