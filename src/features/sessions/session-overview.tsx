"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, RefreshCw } from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/features/auth/auth-provider";
import { SessionForm } from "@/features/sessions/session-form";
import { SessionList } from "@/features/sessions/session-list";
import { useSessions } from "@/features/sessions/use-sessions";
import type { Session } from "@/types/session";

function sortByStartAtAscending(sessions: Session[]): Session[] {
  return [...sessions].sort(
    (first, second) =>
      (first.startAt?.toMillis() ?? 0) - (second.startAt?.toMillis() ?? 0),
  );
}

function sortByStartAtDescending(sessions: Session[]): Session[] {
  return [...sessions].sort(
    (first, second) =>
      (second.startAt?.toMillis() ?? 0) - (first.startAt?.toMillis() ?? 0),
  );
}

export function SessionOverview() {
  const { profileStatus } = useAuth();
  const { sessions, isLoading, error } = useSessions(
    profileStatus === "ready",
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const upcomingSessions = useMemo(
    () =>
      sortByStartAtAscending(
        sessions.filter(
          (session) =>
            session.status === "upcoming" || session.status === "active",
        ),
      ),
    [sessions],
  );

  const previousSessions = useMemo(
    () =>
      sortByStartAtDescending(
        sessions.filter(
          (session) =>
            session.status === "finished" || session.status === "cancelled",
        ),
      ),
    [sessions],
  );

  if (isLoading) {
    return <LoadingState label="Načítám session tabuli…" />;
  }

  if (error) {
    return (
      <PixelPanel className="max-w-2xl" padding="lg">
        <p className="font-pixel text-[10px] leading-5 text-wine-light">
          SESSION ERROR
        </p>

        <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
          Session se nepodařilo načíst
        </h2>

        <p className="mt-3 text-sm leading-6 text-cream-muted">{error}</p>

        <PixelButton
          className="mt-6"
          onClick={() => window.location.reload()}
          variant="moss"
        >
          <RefreshCw aria-hidden="true" size={16} />
          Obnovit stránku
        </PixelButton>
      </PixelPanel>
    );
  }

  return (
    <div className="grid gap-10">
      <section className="flex flex-col gap-4 border-2 border-outline bg-panel-deep p-5 shadow-pixel sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-pixel text-[9px] leading-5 text-amber-light">
            GAME NIGHT PLANNER
          </p>

          <p className="mt-2 text-sm leading-6 text-cream-muted">
            Naplánuj večer, vyber hostitele a zjisti, kdo vytahuje kostky z
            pytlíku.
          </p>
        </div>

        <PixelButton onClick={() => setIsCreateOpen(true)} variant="moss">
          <CalendarPlus aria-hidden="true" size={16} />
          Nová session
        </PixelButton>
      </section>

      <section>
        <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
          NADCHÁZEJÍCÍ SESSION
        </p>

        <SessionList
          emptyDescription="Zatím není nic naplánováno. Vytvoř první game night pro partu."
          emptyTitle="Session tabule je prázdná"
          sessions={upcomingSessions}
        />
      </section>

      <section>
        <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
          MINULÉ A ZRUŠENÉ SESSION
        </p>

        <SessionList
          emptyDescription="Až se nějaký večer dohraje nebo zruší, jeho záznam se objeví tady."
          emptyTitle="Historie je zatím prázdná"
          sessions={previousSessions}
        />
      </section>

      <SessionForm
        key={isCreateOpen ? "create-session-open" : "create-session-closed"}
        onClose={() => setIsCreateOpen(false)}
        open={isCreateOpen}
      />
    </div>
  );
}