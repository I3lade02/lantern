"use client";

import Link from "next/link";
import {
  Beer,
  QrCode,
  ScanLine,
} from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { BarAdminPanel } from "@/features/bar/bar-admin-panel";

export function BarPageContent() {
  const {
    profile,
    profileStatus,
    status,
    user,
  } = useAuth();

  const isReady =
    status === "authenticated" &&
    profileStatus === "ready" &&
    Boolean(user) &&
    Boolean(profile);

  if (!isReady) {
    return (
      <LoadingState label="Otevírám taverní pult…" />
    );
  }

  if (profile?.role === "admin" && user) {
    return <BarAdminPanel user={user} />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 pb-16">
      <section className="border-b-2 border-outline pb-7">
        <p className="font-pixel text-[10px] leading-6 text-amber-light">
          TAVERNÍ BAR
        </p>

        <h1 className="mt-3 font-pixel text-xl leading-10 text-cream">
          Nápoje na účet
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-7 text-cream-muted">
          Naskenuj QR štítek u nápoje a LANtern ho
          po potvrzení připíše do tvé útraty.
        </p>
      </section>

      <PixelPanel className="mt-7" tone="deep">
        <div className="flex items-start gap-4">
          <div className="grid size-13 shrink-0 place-items-center border-2 border-outline bg-amber text-void shadow-pixel-sm">
            <Beer aria-hidden="true" size={24} />
          </div>

          <div>
            <p className="font-pixel text-[8px] text-cream-muted">
              QR NÁPOJE
            </p>

            <h2 className="mt-2 font-pixel text-sm leading-7 text-cream">
              Vezmi nápoj, pípni štítek
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-cream-muted">
              Kamera rozpozná LANtern QR kód a otevře
              potvrzení s cenou i výběrem session.
            </p>
          </div>
        </div>

        <Link
          className="mt-6 inline-flex w-full items-center justify-center gap-2 border-2 border-outline bg-moss px-4 py-3 font-pixel text-[9px] text-cream shadow-pixel-sm transition hover:brightness-110 sm:w-auto"
          href="/bar/scan"
        >
          <ScanLine aria-hidden="true" size={17} />
          Skenovat QR nápoj
        </Link>
      </PixelPanel>

      <PixelPanel className="mt-6" tone="deep">
        <div className="flex items-start gap-4">
          <QrCode
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-amber-light"
            size={21}
          />

          <p className="text-sm leading-7 text-cream-muted">
            Po načtení se nic nepřipíše automaticky.
            Nejdřív uvidíš nápoj, cenu a session,
            kam má být útrata zařazená.
          </p>
        </div>
      </PixelPanel>
    </main>
  );
}