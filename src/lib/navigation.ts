import type { LucideIcon } from "lucide-react";
import {
    CalendarDays,
    Dices,
    HandCoins,
    LayoutDashboard,
    ReceiptText,
    UsersRound,
} from "lucide-react";

export type AppNavigationItem = {
    href: string;
    label: string;
    shortLabel: string;
    icon: LucideIcon;
};

export const APP_NAVIGATION: AppNavigationItem[] = [
    {
        href: "/dashboard",
        label: "Dashboard",
        shortLabel: "Domů",
        icon: LayoutDashboard,
    },
    {
        href: "/sessions",
        label: "Sessions",
        shortLabel: "Session",
        icon: CalendarDays,
    },
    {
        href: "/expenses",
        label: "Útraty",
        shortLabel: "Útraty",
        icon: ReceiptText,
    },
    {
        href: "/debts",
        label: "Dluhy",
        shortLabel: "Dluhy",
        icon: HandCoins,
    },
    {
        href: "/dice",
        label: "Dice lab",
        shortLabel: "Kostky",
        icon: Dices
    },
    {
        href: "/members",
        label: "Členové",
        shortLabel: "Parta",
        icon: UsersRound,
    },
];