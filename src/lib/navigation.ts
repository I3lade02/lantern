import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Dices,
  Gamepad2,
  HandCoins,
  LayoutDashboard,
  ReceiptText,
  UsersRound,
  Vote,
  MessageCircleMore,
  Beer,
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
    href: "/polls",
    label: "Ankety",
    shortLabel: "Ankety",
    icon: Vote,
  },
  {
    href: "/chat",
    label: "Chat",
    shortLabel: "Chat",
    icon: MessageCircleMore,
  },
  {
    href: "/expenses",
    label: "Útraty",
    shortLabel: "Útraty",
    icon: ReceiptText,
  },
  {
    href: "/bar",
    label: "Bar",
    shortLabel: "Bar",
    icon: Beer,
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
    icon: Dices,
  },
  {
    href: "/members",
    label: "Členové",
    shortLabel: "Parta",
    icon: UsersRound,
  },
  {
    href: "/games",
    label: "Hry",
    shortLabel: "Hry",
    icon: Gamepad2,
  },
];