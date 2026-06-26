"use client";

import { useState } from "react";
import {
  CalendarDays,
  Dices,
  ReceiptText,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelModal } from "@/components/ui/pixel-modal";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { PixelTabs } from "@/components/ui/pixel-tabs";
import { SectionTitle } from "@/components/ui/section-title";
import { toast } from "@/components/ui/pixel-toast";

type PreviewTab = "overview" | "activity" | "members";

const tabs = [
  { value: "overview", label: "Přehled", icon: Sparkles },
  { value: "activity", label: "Aktivita", icon: ReceiptText },
  { value: "members", label: "Členové", icon: UsersRound },
] as const;

export function DesignSystemPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <SectionTitle
        action={(
          <PixelButton onClick={() => setIsModalOpen(true)} variant="moss">
            <Dices aria-hidden="true" size={16} />
            Otevřít modal
          </PixelButton>
        ) as unknown as string}
        description="Sada znovupoužitelných komponent pro budoucí dashboard, sessions, útraty, dluhy i Dice Lab."
        eyebrow="LANtern UI Kit v1"
        title="Pixel design systém"
      />

      <section className="mt-8 grid gap-6">
        <PixelTabs
          ariaLabel="Ukázka záložek"
          onValueChange={setActiveTab}
          tabs={tabs}
          value={activeTab}
        />

        <PixelPanel className="pixel-grid" tone="deep">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-pixel text-[10px] leading-5 text-amber-light">
                ACTIVE SESSION
              </p>

              <h2 className="mt-2 font-pixel text-sm leading-8 text-cream">
                Pátek u Ondry
              </h2>

              <p className="mt-2 text-sm leading-6 text-cream-muted">
                {activeTab === "overview"
                  ? "Další session je připravená. Potřebujeme jen sesbírat partu a rozhodnout hru."
                  : activeTab === "activity"
                    ? "Zatím žádná nová aktivita. Lucerna se jen lehce pohupuje v průvanu."
                    : "Členové party se později načtou z Firebase Authentication a Firestore."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <PixelBadge tone="amber">
                <CalendarDays aria-hidden="true" size={13} />
                28. 6.
              </PixelBadge>

              <PixelBadge tone="moss">4 / 7 JDE</PixelBadge>

              <PixelBadge tone="wine">ROOT?</PixelBadge>
            </div>
          </div>
        </PixelPanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <PixelPanel>
            <h2 className="font-pixel text-xs leading-7 text-cream">
              Pixel buttons
            </h2>

            <div className="mt-5 flex flex-wrap gap-4">
              <PixelButton
                onClick={() => toast.success("Útrata byla přidána do inventáře.")}
              >
                Přidat útratu
              </PixelButton>

              <PixelButton
                onClick={() => toast("Kostka se kutálí…")}
                variant="moss"
              >
                Hodit d20
              </PixelButton>

              <PixelButton
                onClick={() => toast.error("Testovací červený toast.")}
                variant="danger"
              >
                Test chyby
              </PixelButton>

              <PixelButton variant="ghost">Sekundární</PixelButton>
            </div>
          </PixelPanel>

          <PixelPanel tone="muted">
            <h2 className="font-pixel text-xs leading-7 text-cream">
              Form input
            </h2>

            <div className="mt-5">
              <PixelInput
                defaultValue="Pátek u Ondry"
                hint="Tento typ inputu využijeme při tvorbě session."
                id="session-title-preview"
                label="Název session"
                placeholder="Například: Pátek u Ondry"
              />
            </div>
          </PixelPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <EmptyState
            action={
              <PixelButton size="sm" variant="moss">
                Přidat první hru
              </PixelButton>
            }
            description="Až bude herní knihovna hotová, tady se ukáže první hra připravená na večer."
            icon={Dices}
            title="Knihovna je zatím prázdná"
          />

          <LoadingState label="Volám hostitele party…" />
        </div>
      </section>

      <PixelModal
        description="Toto bude základ pro přidávání útrat, potvrzování plateb, editaci session i QR platby."
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        title="Pixel modal připraven"
      >
        <div className="grid gap-5">
          <p className="text-sm leading-6 text-cream-muted">
            Modal má podporu klávesy Escape, kliknutí mimo obsah a krátkou
            Motion animaci.
          </p>

          <PixelButton
            fullWidth
            onClick={() => {
              setIsModalOpen(false);
              toast.success("Modal uzavřen.");
            }}
            variant="amber"
          >
            Zavřít modal
          </PixelButton>
        </div>
      </PixelModal>
    </main>
  );
}