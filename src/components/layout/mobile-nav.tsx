"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  useNotificationsContext,
} from "@/features/notifications/notifications-provider";
import { APP_NAVIGATION } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isNavigationItemActive(
  pathname: string,
  href: string,
): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();

  const { hasUnreadChat } =
    useNotificationsContext();

  return (
    <nav
      aria-label="Mobilní navigace"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-outline bg-panel-deep pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex overflow-x-auto px-2 py-2">
        {APP_NAVIGATION.map((item) => {
          const Icon = item.icon;

          const isActive = isNavigationItemActive(
            pathname,
            item.href,
          );

          const showChatBadge =
            item.href === "/chat" && hasUnreadChat;

          return (
            <Link
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                [
                  "relative flex min-w-18 flex-1 shrink-0 flex-col items-center justify-center gap-1",
                  "border-2 border-outline px-2 py-2",
                  "font-pixel text-[7px] leading-3",
                  "transition-colors duration-100",
                  "focus-visible:outline-none",
                ],
                isActive
                  ? "bg-amber text-void shadow-pixel-sm"
                  : "bg-panel text-cream-muted hover:bg-panel-muted hover:text-cream",
              )}
              href={item.href}
            >
              <Icon aria-hidden="true" size={17} />

              {showChatBadge ? (
                <span
                  className={[
                    "absolute right-2 top-2 size-2 border border-outline",
                    isActive ? "bg-wine" : "bg-amber",
                  ].join(" ")}
                >
                  <span className="sr-only">
                    Nové zprávy v chatu
                  </span>
                </span>
              ) : null}

              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}