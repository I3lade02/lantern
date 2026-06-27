import Link from "next/link";
import {
  CalendarDays,
  Dices,
  HandCoins,
  ReceiptText,
  UsersRound,
} from "lucide-react";

import { PageShell } from "@/components/shared/page-shell";
import { PixelPanel } from "@/components/ui/pixel-panel";

const quickRoutes = [
  {
    href: "/sessions",
    label: "Sessions",
    description: "Plánuj další game night a RSVP.",
    icon: CalendarDays,
    tone: "bg-amber text-void",
  },
  {
    href: "/expenses",
    label: "Útraty",
    description: "Zapisuj limonády, pizzu i dortíky.",
    icon: ReceiptText,
    tone: "bg-moss text-void",
  },
  {
    href: "/debts",
    label: "Dluhy",
    description: "Vyrovnej bitevní účet party.",
    icon: HandCoins,
    tone: "bg-wine text-cream",
  },
  {
    href: "/dice",
    label: "Dice Lab",
    description: "Hoď d20, d100 nebo celý arzenál kostek.",
    icon: Dices,
    tone: "bg-cream text-void",
  },
  {
    href: "/members",
    label: "Členové",
    description: "Správa party a budoucích rolí.",
    icon: UsersRound,
    tone: "bg-panel-muted text-cream",
  },
];

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <PageShell
      description="Hlavní rozcestník LANternu. V dalším kroku sem připojíme skutečný dashboard s nejbližší session, dluhy a aktivitou party."
      eyebrow="PRIVATE GAME NIGHT HUB"
      title="Dashboard"
    >
      <PixelPanel className="pixel-grid" tone="deep">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-pixel text-[10px] leading-6 text-amber-light">
              THE LANTERN IS LIT
            </p>

            <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
              Základna party je připravená
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-cream-muted">
              Přihlášení, role, Firestore profil i responzivní navigace už drží
              pohromadě. Teď můžeme do jednotlivých místností přidávat skutečná
              data a herní logiku.
            </p>
          </div>

          <div className="border-2 border-outline bg-panel p-4 text-center shadow-pixel-sm">
            <p className="font-pixel text-[9px] leading-5 text-moss-light">
              VERSION
            </p>

            <p className="mt-2 font-pixel text-lg leading-8 text-cream">
              MVP
            </p>
          </div>
        </div>
      </PixelPanel>

      <section className="mt-6">
        <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
          RYCHLÉ CESTY
        </p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickRoutes.map((route) => {
            const Icon = route.icon;

            return (
              <Link
                key={route.href}
                className="group border-2 border-outline bg-panel p-5 shadow-pixel transition-[transform,box-shadow,filter] hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                href={route.href}
              >
                <div
                  className={`grid size-11 place-items-center border-2 border-outline shadow-pixel-sm ${route.tone}`}
                >
                  <Icon aria-hidden="true" size={20} />
                </div>

                <h2 className="mt-5 font-pixel text-[11px] leading-6 text-cream">
                  {route.label}
                </h2>

                <p className="mt-2 text-sm leading-6 text-cream-muted">
                  {route.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}