"use client";

import { AlertTriangle } from "lucide-react";

import { DashboardActivityFeed } from "@/features/dashboard/dashboard-activity-feed";
import { DashboardDebtSummary } from "@/features/dashboard/dashboard-debt-summary";
import { DashboardHero } from "@/features/dashboard/dashboard-hero";
import { DashboardNextSession } from "@/features/dashboard/dashboard-next-session";
import { DashboardQuickActions } from "@/features/dashboard/dashboard-quick-actions";
import { useDashboardData } from "@/features/dashboard/use-dashboard-data";
import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import type { Session } from "@/types/session";

function getNextSession(sessions: Session[]): Session | null {
  return (
    sessions.find(
      (session) =>
        session.status === "upcoming" || session.status === "active",
    ) ?? null
  );
}

export function DashboardOverview() {
  const { profile, profileStatus, user } = useAuth();

  const {
    sessions,
    debts,
    activities,
    settings,
    isLoading,
    error,
  } = useDashboardData(profileStatus === "ready");

  const displayName =
    profile?.displayName ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Člene party";

  if (isLoading) {
    return <LoadingState label="Načítám taverní tabuli…" />;
  }

  if (error) {
    return (
      <PixelPanel className="max-w-2xl" padding="lg">
        <div className="flex gap-4">
          <div className="grid size-12 shrink-0 place-items-center border-2 border-outline bg-wine text-cream shadow-pixel-sm">
            <AlertTriangle aria-hidden="true" size={22} />
          </div>

          <div>
            <p className="font-pixel text-[10px] leading-5 text-wine-light">
              DASHBOARD ERROR
            </p>

            <h2 className="mt-2 font-pixel text-xs leading-7 text-cream">
              Něco brání načtení dat
            </h2>

            <p className="mt-3 text-sm leading-6 text-cream-muted">{error}</p>

            <PixelButton
              className="mt-6"
              onClick={() => window.location.reload()}
              variant="moss"
            >
              Obnovit dashboard
            </PixelButton>
          </div>
        </div>
      </PixelPanel>
    );
  }

  const nextSession = getNextSession(sessions);

  return (
    <div className="grid gap-8">
      <DashboardHero
        displayName={displayName}
        partyNotice={settings?.partyNotice}
      />

      <DashboardQuickActions />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <DashboardNextSession session={nextSession} />

        <DashboardDebtSummary debts={debts} userId={user?.uid ?? ""} />
      </div>

      <DashboardActivityFeed activities={activities} />
    </div>
  );
}