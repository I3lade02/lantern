"use client";

import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";

import { PixelButton } from "@/components/ui/pixel-button";
import { toast } from "@/components/ui/pixel-toast";
import { useAuth } from "@/features/auth/auth-provider";
import { signOutUser } from "@/features/auth/auth-service";

export function AuthenticatedHeader() {
  const { user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Člen party";

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
    <header className="sticky top-0 z-40 border-b-2 border-outline bg-void/95 px-5 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center border-2 border-outline bg-amber text-xl shadow-pixel-sm">
            🏮
          </div>

          <div className="min-w-0">
            <p className="font-pixel text-[10px] leading-5 text-cream">
              LANtern
            </p>

            <p className="truncate text-xs text-cream-muted">
              Přihlášen jako {displayName}
            </p>
          </div>
        </div>

        <PixelButton
          aria-label="Odhlásit se"
          disabled={isSigningOut}
          onClick={handleSignOut}
          size="sm"
          variant="ghost"
        >
          <UserRound aria-hidden="true" size={14} />
          <span className="hidden sm:inline">
            {isSigningOut ? "Odcházím…" : "Odhlásit"}
          </span>
          <LogOut aria-hidden="true" size={14} />
        </PixelButton>
      </div>
    </header>
  );
}