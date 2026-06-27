"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAVIGATION } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isNavigationItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobilní navigace"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-outline bg-panel-deep pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex overflow-x-auto px-2 py-2">
        {APP_NAVIGATION.map((item) => {
          const Icon = item.icon;
          const isActive = isNavigationItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                [
                  "flex min-w-18 flex-1 shrink-0 flex-col items-center justify-center gap-1",
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
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}