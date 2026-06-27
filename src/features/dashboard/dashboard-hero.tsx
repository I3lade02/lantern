import { BellRing, CalendarDays } from "lucide-react";

import { PixelPanel } from "@/components/ui/pixel-panel";
import { formatCurrentDate } from "@/lib/formatters";

type DashboardHeroProps = {
  displayName: string;
  partyNotice: string | null | undefined;
};

export function DashboardHero({
  displayName,
  partyNotice,
}: DashboardHeroProps) {
  const notice =
    partyNotice?.trim() ||
    "Žádný nový party notice. Přineste kostky, dobrou náladu a případně něco k zakousnutí.";

  return (
    <PixelPanel className="pixel-grid overflow-hidden" padding="none" tone="deep">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-pixel text-[9px] leading-5 text-amber-light">
            PRIVATE GAME NIGHT HUB
          </p>

          <h2 className="mt-4 font-pixel text-lg leading-10 text-cream sm:text-xl">
            Vítej zpátky, {displayName}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-cream-muted">
            Lucerna svítí, tabule je připravená a další herní večer čeká na
            svůj příběh.
          </p>
        </div>

        <div className="border-2 border-outline bg-panel p-4 shadow-pixel-sm">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center border-2 border-outline bg-amber text-void">
              <CalendarDays aria-hidden="true" size={18} />
            </div>

            <div>
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                DNES JE
              </p>

              <p className="mt-1 text-sm font-semibold text-cream">
                {formatCurrentDate()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-outline bg-panel px-6 py-4 sm:px-8">
        <div className="flex gap-3">
          <BellRing
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-moss-light"
            size={18}
          />

          <div>
            <p className="font-pixel text-[8px] leading-4 text-moss-light">
              PARTY NOTICE
            </p>

            <p className="mt-1 text-sm leading-6 text-cream-muted">{notice}</p>
          </div>
        </div>
      </div>
    </PixelPanel>
  );
}