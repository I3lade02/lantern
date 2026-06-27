"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { MemberAvatar } from "@/components/layout/member-avatar";
import { PixelButton } from "@/components/ui/pixel-button";
import { toast } from "@/components/ui/pixel-toast";
import { useAuth } from "@/features/auth/auth-provider";
import { signOutUser } from "@/features/auth/auth-service";

export function AppHeader() {
  const { profile, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName =
    profile?.displayName ||
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
    <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-outline bg-void/95 px-5 py-3 backdrop-blur lg:hidden">
      <Link
        aria-label="Přejít na dashboard LANtern"
        className="flex items-center gap-3"
        href="/dashboard"
      >
        <div className="grid size-10 place-items-center border-2 border-outline bg-amber text-xl shadow-pixel-sm">
          🏮
        </div>

        <div>
          <p className="font-pixel text-[10px] leading-5 text-cream">LANtern</p>
          <p className="font-pixel text-[7px] leading-4 text-amber-light">
            GAME NIGHT HUB
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <MemberAvatar
          color={profile?.avatarColor}
          name={displayName}
          size="sm"
        />

        <PixelButton
          aria-label="Odhlásit se"
          className="size-10 px-0! py-0!"
          disabled={isSigningOut}
          onClick={handleSignOut}
          size="sm"
          variant="ghost"
        >
          <LogOut aria-hidden="true" size={16} />
        </PixelButton>
      </div>
    </header>
  );
}