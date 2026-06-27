"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/features/auth/auth-provider";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { profileStatus, status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (
    status === "loading" ||
    (status === "authenticated" && profileStatus === "loading")
  ) {
    return <LoadingState label="Kontroluji vstup do herny…" />;
  }

  if (status === "authenticated" && profileStatus === "error") {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-5 py-10">
        <PixelPanel className="w-full text-center" padding="lg">
          <p className="font-pixel text-[10px] leading-6 text-wine-light">
            ACCESS DENIED
          </p>

          <h1 className="mt-4 font-pixel text-sm leading-8 text-cream">
            Přístup zatím není schválen
          </h1>

          <p className="mt-4 text-sm leading-6 text-cream-muted">
            Tento účet není v seznamu členů party, nebo se profil nepodařilo
            načíst.
          </p>

          <PixelButton
            className="mt-7"
            onClick={() => window.location.reload()}
            variant="moss"
          >
            Zkusit znovu
          </PixelButton>
        </PixelPanel>
      </main>
    );
  }

  if (status !== "authenticated") {
    return <LoadingState label="Rozsvěcím vstupní lucernu…" />;
  }

  return <>{children}</>;
}