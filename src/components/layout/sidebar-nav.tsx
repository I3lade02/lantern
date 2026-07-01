"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";

import { MemberAvatar } from "@/components/layout/member-avatar";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { toast } from "@/components/ui/pixel-toast";
import { useAuth } from "@/features/auth/auth-provider";
import { signOutUser } from "@/features/auth/auth-service";
import { APP_NAVIGATION } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useNotificationsContext } from "@/features/notifications/notifications-provider";

function isNavigationItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();
  const { profile, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { hasUnreadChat } = useNotificationsContext();

  const displayName =
    profile?.displayName ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Člen party";

  const isAdmin = profile?.role === "admin";

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOutUser();
      toast.success("Lucerna zhasnuta. Uvidíme se příště!");
    } catch {
      toast.error("Odhlášení se nepovedlo. Zkus to znovu.");
      setIsSigningOut(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r-2 border-outline bg-panel-deep lg:flex lg:flex-col">
      <div className="border-b-2 border-outline bg-panel px-6 py-7">
        <Link
          aria-label="Přejít na dashboard LANtern"
          className="group flex items-center gap-4"
          href="/dashboard"
        >
          <div className="grid size-13 place-items-center border-2 border-outline bg-amber text-2xl shadow-pixel transition-transform group-hover:-translate-y-0.5">
            🏮
          </div>

          <div>
            <p className="font-pixel text-sm leading-7 text-cream">LANtern</p>

            <p className="mt-1 font-pixel text-[8px] leading-4 text-amber-light">
              GAME NIGHT HUB
            </p>
          </div>
        </Link>
      </div>

      <nav
        aria-label="Hlavní navigace"
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <p className="mb-3 px-2 font-pixel text-[8px] leading-4 text-cream-muted">
          PARTY MENU
        </p>

        <div className="grid gap-2">
          {APP_NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(pathname, item.href);
            const showChatBadge = item.href === "/chat" && hasUnreadChat;

            return (
              <Link
                key={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  [
                    "flex items-center gap-3 border-2 border-outline px-3 py-3",
                    "font-pixel text-[10px] leading-5",
                    "transition-[transform,background-color,color,box-shadow] duration-100",
                    "focus-visible:outline-none",
                  ],
                  isActive
                    ? "bg-amber text-void shadow-pixel-sm"
                    : "bg-panel text-cream-muted hover:bg-panel-muted hover:text-cream",
                )}
                href={item.href}
              >
                <Icon aria-hidden="true" size={17} />
                <span>{item.label}</span>
                {showChatBadge ? (
                  <span
                    aria-label="Nové zprávy v chatu"
                    className={[
                      "ml-auto size-2 shrink-0 border border-outline",
                      isActive ? "bg-wine" : "bg-amber",
                    ].join(" ")}
                  >
                    <span className="sr-only">
                      Nové zprávy v chatu
                    </span>
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t-2 border-outline bg-panel p-4">
        <div className="flex items-center gap-3 border-2 border-outline bg-panel-deep p-3 shadow-pixel-sm">
          <MemberAvatar
            color={profile?.avatarColor}
            name={displayName}
            size="md"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-cream">
                {displayName}
              </p>

              {isAdmin ? (
                <PixelBadge tone="amber">
                  <ShieldCheck aria-hidden="true" size={11} />
                  ADMIN
                </PixelBadge>
              ) : null}
            </div>

            <p className="truncate text-xs text-cream-muted">
              {user?.email ?? "Přihlášený člen"}
            </p>
          </div>
        </div>

        <PixelButton
          className="mt-4"
          disabled={isSigningOut}
          fullWidth
          onClick={handleSignOut}
          size="sm"
          variant="ghost"
        >
          <UserRound aria-hidden="true" size={14} />
          <span>{isSigningOut ? "Odcházím…" : "Odhlásit se"}</span>
          <LogOut aria-hidden="true" size={14} />
        </PixelButton>
      </div>
    </aside>
  );
}