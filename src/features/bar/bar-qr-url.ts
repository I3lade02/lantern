const BAR_QR_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{16,128}$/;

export function getBarQrTokenFromValue(
    rawValue: string,
): string | null {
    const value = rawValue.trim();

    if (!value) {
        return null;
    }

    try {
        const url = new URL(value);

        if (url.origin !== window.location.origin) {
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