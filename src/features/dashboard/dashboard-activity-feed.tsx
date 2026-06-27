import {
  CalendarCheck,
  Dices,
  Gamepad2,
  ReceiptText,
  Sparkles,
  UserPlus,
  HandCoins,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { formatRelativeTime } from "@/lib/formatters";
import type { ActivityLogEntry, ActivityType } from "@/types/activity";

type DashboardActivityFeedProps = {
  activities: ActivityLogEntry[];
};

const activityIcons: Record<ActivityType, typeof Sparkles> = {
  session_created: CalendarCheck,
  session_updated: CalendarCheck,
  session_rsvp: CalendarCheck,
  expense_created: ReceiptText,
  expense_updated: ReceiptText,
  debt_paid: Sparkles,
  debts_calculated: HandCoins,
  debt_resolved: HandCoins,
  dice_rolled: Dices,
  game_added: Gamepad2,
  member_joined: UserPlus,
  other: Sparkles,
};

export function DashboardActivityFeed({
  activities,
}: DashboardActivityFeedProps) {
  return (
    <section>
      <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
        POSLEDNÍ AKTIVITA
      </p>

      {activities.length === 0 ? (
        <EmptyState
          description="Až někdo potvrdí session, přidá útratu, hodí kostkou nebo zapíše hru, její stopa se objeví tady."
          icon={Sparkles}
          title="Taverní kronika je zatím prázdná"
        />
      ) : (
        <PixelPanel padding="none" tone="deep">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type] ?? Sparkles;

            return (
              <div
                key={activity.id}
                className={
                  index === activities.length - 1
                    ? "flex gap-4 p-4"
                    : "flex gap-4 border-b-2 border-outline p-4"
                }
              >
                <div className="grid size-10 shrink-0 place-items-center border-2 border-outline bg-panel-muted text-amber shadow-pixel-sm">
                  <Icon aria-hidden="true" size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-6 text-cream">{activity.message}</p>

                  <p className="mt-1 text-xs text-cream-muted">
                    {activity.actorName} · {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </PixelPanel>
      )}
    </section>
  );
}