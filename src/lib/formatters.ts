import { format, formatDistanceToNow } from "date-fns";
import { cs } from "date-fns/locale";
import type { Timestamp } from "firebase/firestore";

function capitalizeFirst(value: string): string {
    if (!value) {
        return value;
    }

    return value.charAt(0).toLocaleUpperCase("cs-CZ") + value.slice(1);
}

export function formatCzk(amount: number): string {
    return new Intl.NumberFormat("cs-CZ", {
        style: "currency",
        currency: "CZK",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatCurrentDate(date = new Date()): string {
    return capitalizeFirst(format(date, "EEEE d. MMMM yyyy", { locale: cs }));
}

export function formatSessionDate(timestamp: Timestamp | null): string {
    if (!timestamp) {
        return "Datum se teprve domlouvá";
    }

    return capitalizeFirst(
        format(timestamp.toDate(), "EEEE d. MMMM - HH:mm", {
            locale: cs,
        }),
    );
}

export function formatRelativeTime(timestamp: Timestamp | null): string {
    if (!timestamp) {
        return "právě teď";
    }
    return formatDistanceToNow(timestamp.toDate(), {
        addSuffix: true,
        locale: cs,
    });
}