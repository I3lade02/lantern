"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CircleAlert,
  QrCode,
} from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { BarQrCameraScanner } from "@/features/bar/bar-qr-camera-scanner";
import { getBarQrTokenFromValue } from "@/features/bar/bar-qr-url";

export function BarCameraScanPageContent() {
  const router = useRouter();

  const {
    profile,
    profileStatus,
    status,
    user,
  } = useAuth();

  const isReady =
    status === "authenticated" &&
    profileStatus === "ready" &&
    Boolean(profile) &&
    Boolean(user);

  function handleDetected(rawValue: string): boolean {
    const qrToken = getBarQrTokenFromValue(rawValue);

    if (!qrToken) {
      return false;
    }

    router.replace(
      `/bar/scan/${encodeURIComponent(qrToken)}`,
    );

    return true;
  }

  if (!isReady) {
    return (
      <LoadingState label="Otevírám taverní kameru…" />
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 pb-16">
      <section className="border-b-2 border-outline pb-7">
        <Link
          className="inline-flex items-center gap-2 font-pixel text-[8px] text-cream-muted transition hover:text-amber-light"
          href="/bar"
        >
          <ArrowLeft aria-hidden="true" size={15} />
          ZPĚT NA BAR
        </Link>

        <p className="mt-6 font-pixel text-[10px] leading-6 text-amber-light">
          TAVERNÍ BAR
        </p>

        <h1 className="mt-3 font-pixel text-xl leading-10 text-cream">
          Naskenovat nápoj
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-7 text-cream-muted">
          Namiř kameru na LANtern QR štítek u
          nápoje. Po načtení se otevře potvrzení
          před připsáním do útraty.
        </p>
      </section>

      <section className="mt-7">
        <BarQrCameraScanner
          onDetected={handleDetected}
        />
      </section>

      <PixelPanel className="mt-7" tone="deep">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-panel text-amber-light">
            <QrCode aria-hidden="true" size={20} />
          </div>

          <div>
            <p className="font-pixel text-[8px] text-cream-muted">
              JEN LANTERN QR
            </p>

            <p className="mt-2 text-sm leading-6 text-cream-muted">
              Scanner přijme pouze QR štítky vytvořené
              v Taverním baru. Cizí QR kódy se
              neotevřou a nic nepřidají do útrat.
            </p>
          </div>
        </div>
      </PixelPanel>

      <div className="mt-6 flex items-start gap-3 border-2 border-outline bg-panel-deep p-4">
        <CircleAlert
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-amber-light"
          size={18}
        />

        <p className="text-sm leading-6 text-cream-muted">
          Kamera funguje přes HTTPS nebo na
          <code className="mx-1 border border-outline bg-panel px-1.5 py-0.5 text-xs text-cream">
            localhost
          </code>
          . Na produkci otevři
          <span className="ml-1 font-semibold text-cream">
            lantern.quest
          </span>
          , ne nezabezpečenou IP adresu v lokální síti.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-cream-muted">
        <Camera aria-hidden="true" size={14} />
        LANtern používá kameru jen během aktivního
        skenování.
      </div>
    </main>
  );
}