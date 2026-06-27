import Link from "next/link";
import {
  CalendarPlus,
  Dices,
  Gamepad2,
  HandCoins,
  ReceiptText,
} from "lucide-react";

const quickActions = [
  {
    href: "/expenses",
    label: "Přidat útratu",
    icon: ReceiptText,
    tone: "bg-amber text-void",
  },
  {
    href: "/debts",
    label: "Zobrazit dluhy",
    icon: HandCoins,
    tone: "bg-wine text-cream",
  },
  {
    href: "/dice",
    label: "Hodit kostkou",
    icon: Dices,
    tone: "bg-moss text-void",
  },
  {
    href: "/sessions",
    label: "Přidat se na session",
    icon: CalendarPlus,
    tone: "bg-cream text-void",
  },
  {
    href: "/sessions",
    label: "Vybrat hru",
    icon: Gamepad2,
    tone: "bg-panel-muted text-cream",
  },
];

export function DashboardQuickActions() {
  return (
    <section>
      <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
        RYCHLÉ AKCE
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.label}
              className="group flex min-h-34 flex-col justify-between border-2 border-outline bg-panel p-4 shadow-pixel transition-[transform,box-shadow,filter] hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              href={action.href}
            >
              <div
                className={`grid size-10 place-items-center border-2 border-outline shadow-pixel-sm ${action.tone}`}
              >
                <Icon aria-hidden="true" size={18} />
              </div>

              <p className="mt-6 font-pixel text-[9px] leading-5 text-cream">
                {action.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}