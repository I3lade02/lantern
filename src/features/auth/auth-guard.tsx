"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { signOutUser } from "@/features/auth/auth-service";
import { useAuth } from "@/features/auth/auth-provider";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();

  const {
    accessStatus,
    profileStatus,
    status,
  } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (
      status === "authenticated" &&
      accessStatus === "pending"
    ) {
      router.replace("/cekani-na-schvaleni");
    }
  }, [accessStatus, router, status]);

  if (
    status === "loading" ||
    (status === "authenticated" &&
      accessStatus === "loading")
  ) {
    return <LoadingState label="Kontroluji vstup do herny…" />;
  }

  if (
    status === "authenticated" &&
    accessStatus === "pending"
  ) {
    return <LoadingState label="Přesměrovávám do čekárny…" />;
  }

  if (
    status === "authenticated" &&
    accessStatus === "denied"
  ) {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-5 py-10">
        <PixelPanel className="w-full text-center" padding="lg">
          <p className="font-pixel text-[10px] leading-6 text-wine-light">
            ACCESS DENIED
          </p>

          <h1 className="mt-4 font-pixel text-sm leading-8 text-cream">
            Přístup do LANternu není aktivní
          </h1>

          <p className="mt-4 text-sm leading-6 text-cream-muted">
            Tento účet není schválený člen party, jeho žádost byla
            odmítnuta nebo se profil nepodařilo načíst.
          </p>

          <PixelButton
            className="mt-7"
            onClick={() => {
              void signOutUser();
            }}
            variant="moss"
          >
            Odhlásit se
          </PixelButton>
        </PixelPanel>
      </main>
    );
  }

  if (
    status !== "authenticated" ||
    accessStatus !== "approved" ||
    profileStatus !== "ready"
  ) {
    return <LoadingState label="Rozsvěcím vstupní lucernu…" />;
  }

  return <>{children}</>;
}