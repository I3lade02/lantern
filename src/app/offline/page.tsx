import Link from "next/link";
import {
  RefreshCw,
  SignalZero,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <PixelPanel
        className="pixel-grid w-full max-w-xl text-center"
        padding="lg"
        tone="deep"
      >
        <div className="mx-auto grid size-16 place-items-center border-2 border-outline bg-wine text-cream shadow-pixel">
          <SignalZero aria-hidden="true" size={29} />
        </div>

        <p className="mt-7 font-pixel text-[9px] leading-5 text-amber-light">
          LANTERN OFFLINE
        </p>

        <h1 className="mt-4 font-pixel text-base leading-9 text-cream">
          Lucerna svítí, ale síť spí
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-cream-muted">
          Offline režim udrží LANtern připravený, ale živá data party,
          přihlášení a Firestore zápisy potřebují připojení k internetu.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard">
            <PixelButton variant="moss">
              <RefreshCw aria-hidden="true" size={16} />
              Zkusit znovu
            </PixelButton>
          </Link>

          <Link href="/">
            <PixelButton variant="ghost">
              Zpět na vstup
            </PixelButton>
          </Link>
        </div>
      </PixelPanel>
    </main>
  );
}