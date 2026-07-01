import { Fragment, type ReactNode } from "react";

type ChatLinkifiedTextProps = {
    text: string;
};

const URL_PATTERN = /https?:\/\/[^\s<>"'`[\]{}]+/gi;

function trimTrailingUrlPunctuation(value: string): string {
    return value.replace(/[.,!?;:]+$/g, "");
}

function isSafeHttpUrl(value: string): boolean {
    try {
        const parsedUrl = new URL(value);

        return (
            parsedUrl.protocol === "http:" ||
            parsedUrl.protocol === "https:"
        );
    } catch {
        return false;
    }
}

function renderPlainText(
    text: string,
    keyPrefix: string,
): ReactNode[] {
    return text.split("\n").map((line, index) => (
        <Fragment key={`${keyPrefix}-${index}`}>
            {index > 0 ? <br /> : null}
            {line}
        </Fragment>
    ));
}

export function ChatLinkifiedText({
    text,
}: ChatLinkifiedTextProps) {
    const parts: ReactNode[] = [];

    let cursor = 0;
    let linkIndex = 0;

    for (const match of text.matchAll(URL_PATTERN)) {
        const rawUrl = match[0];
        const matchStart = match.index ?? 0;

        const beforeLink = text.slice(cursor, matchStart);

        if (beforeLink) {
            parts.push(
                ...renderPlainText(
                    beforeLink,
                    `plain-before${linkIndex}`,
                ),
            );
        }

        const trimmedUrl = trimTrailingUrlPunctuation(rawUrl);
        const trailingText = rawUrl.slice(trimmedUrl.length);

        if (trimmedUrl && isSafeHttpUrl(trimmedUrl)) {
            parts.push(
                <a
                    className="break-all font-semibold text-amber-light underline decoration-amber/60 underline-offset-4 hover:text-amber"
                    href={trimmedUrl}
                    key={`link-${linkIndex}`}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    {trimmedUrl}
                </a>,
            );
        } else {
            parts.push(
                ...renderPlainText(
                    trimmedUrl,
                    `unsafe-link-${linkIndex}`,
                ),
            );
        }

        if (trailingText) {
            parts.push(
                ...renderPlainText(
                    trailingText,
                    `trailing-link-${linkIndex}`,
                ),
            );
        }

        cursor = matchStart + rawUrl.length;
        linkIndex += 1;
    }

    const remainingText = text.slice(cursor);

    if (remainingText || parts.length === 0) {
        parts.push(
            ...renderPlainText(
                remainingText,
                "plain-final",
            ),
        );
    }

    return <>{parts}</>;
}