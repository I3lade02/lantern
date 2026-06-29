"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Dices,
  MapPin,
  Pencil,
  UserRound,
} from "lucide-react";

import { MemberAvatar } from "@/components/layout/member-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { SessionDebtSummary } from "@/features/debts/session-debt-summary";
import { SessionExpensesPanel } from "@/features/expenses/session-expense-panel";
import { SessionGamePlanner } from "@/features/games/session-game-planner";
import { useMembers } from "@/features/members/use-members";
import { SessionForm } from "@/features/sessions/session-form";
import { SessionRsvpActions } from "@/features/sessions/session-rsvp-actions";
import { useSessionDetail } from "@/features/sessions/use-session-detail";
import { formatSessionDate } from "@/lib/formatters";
import type {
  SessionRsvpStatus,
  SessionStatus,
} from "@/types/session";

type SessionDetailViewProps = {
  sessionId: string;
};

const sessionStatusLabels: Record<SessionStatus, string> = {
  upcoming: "PŘIPRAVUJE SE",
  active: "PRÁVĚ BĚŽÍ",
  finished: "DOHRÁNO",
  cancelled: "ZRUŠENO",
};

const sessionStatusTones: Record<
  SessionStatus,
  "amber" | "moss" | "wine" | "muted"
> = {
  upcoming: "amber",
  active: "moss",
  finished: "muted",
  cancelled: "wine",
};

const rsvpLabels: Record<SessionRsvpStatus, string> = {
  going: "JDU",
  maybe: "MOŽNÁ",
  notGoing: "NEJEDU",
};

const rsvpTones: Record<
  SessionRsvpStatus,
  "amber" | "moss" | "wine"
> = {
  going: "moss",
  maybe: "amber",
  notGoing: "wine",
};

function getActorName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  return displayName?.trim() || email?.split("@")[0] || "Člen party";
}

export function SessionDetailView({
  sessionId,
}: SessionDetailViewProps) {
  const { profile, profileStatus, user } = useAuth();

  const {
    session,
    rsvps,
    isLoading,
    error,
  } = useSessionDetail(sessionId, profileStatus === "ready");

  const {
    members,
    isLoading: areMembersLoading,
  } = useMembers(profileStatus === "ready");

  const [isEditOpen, setIsEditOpen] = useState(false);

  const rsvpByUserId = useMemo(
    () => new Map(rsvps.map((rsvp) => [rsvp.userId, rsvp])),
    [rsvps],
  );

  const actor = user
    ? {
        id: user.uid,
        name: getActorName(profile?.displayName, user.email),
      }
    : null;

  const currentRsvp = user ? rsvpByUserId.get(user.uid) : undefined;
  const isAdmin = profile?.role === "admin";

  if (isLoading || areMembersLoading) {
    return <LoadingState label="Načítám session a družinu…" />;
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
          Obnovit stránku
        </PixelButton>
      </PixelPanel>
    );
  }

  if (!session) {
    return (
      <EmptyState
        description="Tato session neexistuje, byla odstraněna nebo se k ní nedostaneš."
        icon={CalendarClock}
        title="Session nebyla nalezena"
      />
    );
  }

  return (
    <div className="grid gap-8">
      <PixelPanel className="pixel-grid" padding="none" tone="deep">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <PixelBadge tone={sessionStatusTones[session.status]}>
                {sessionStatusLabels[session.status]}
              </PixelBadge>

              <p className="font-pixel text-[9px] leading-5 text-amber-light">
                GAME NIGHT
              </p>
            </div>

            <h2 className="mt-5 font-pixel text-lg leading-10 text-cream">
              {session.title}
            </h2>

            {session.description ? (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-cream-muted">
                {session.description}
              </p>
            ) : (
              <p className="mt-4 text-sm leading-7 text-cream-muted">
                Bez poznámky. Čistá herní mlha a prostor pro improvizaci.
              </p>
            )}
          </div>

          {isAdmin ? (
            <PixelButton onClick={() => setIsEditOpen(true)} variant="amber">
              <Pencil aria-hidden="true" size={16} />
              Upravit
            </PixelButton>
          ) : null}
        </div>

        <div className="grid border-t-2 border-outline md:grid-cols-3">
          <div className="flex gap-3 border-b-2 border-outline p-5 md:border-b-0 md:border-r-2">
            <CalendarClock
              aria-hidden="true"
              className="shrink-0 text-amber-light"
              size={19}
            />

            <div>
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                DATUM A ČAS
              </p>

              <p className="mt-1 text-sm leading-6 text-cream">
                {formatSessionDate(session.startAt)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 border-b-2 border-outline p-5 md:border-b-0 md:border-r-2">
            <MapPin
              aria-hidden="true"
              className="shrink-0 text-moss-light"
              size={19}
            />

            <div>
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                MÍSTO
              </p>

              <p className="mt-1 text-sm leading-6 text-cream">
                {session.location}
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-5">
            <UserRound
              aria-hidden="true"
              className="shrink-0 text-wine-light"
              size={19}
            />

            <div>
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                HOSTITEL
              </p>

              <p className="mt-1 text-sm leading-6 text-cream">
                {session.hostName}
              </p>
            </div>
          </div>
        </div>
      </PixelPanel>

      {actor ? (
        <PixelPanel>
          <p className="font-pixel text-[9px] leading-5 text-amber-light">
            TVOJE ÚČAST
          </p>

          <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
            Dorazíš ke stolu?
          </h2>

          <p className="mt-2 text-sm leading-6 text-cream-muted">
            Změna se ihned propíše celé partě.
          </p>

          <div className="mt-6">
            <SessionRsvpActions
              actor={actor}
              currentStatus={currentRsvp?.status ?? null}
              session={session}
            />
          </div>
        </PixelPanel>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="font-pixel text-[9px] leading-5 text-cream-muted">
            RSVP PARTY
          </p>

          <div className="flex flex-wrap justify-end gap-2">
            <PixelBadge tone="moss">
              {session.rsvpSummary.going} JDE
            </PixelBadge>

            <PixelBadge tone="amber">
              {session.rsvpSummary.maybe} MOŽNÁ
            </PixelBadge>

            <PixelBadge tone="wine">
              {session.rsvpSummary.notGoing} NEJDE
            </PixelBadge>
          </div>
        </div>

        <PixelPanel padding="none" tone="deep">
          {members.map((member, index) => {
            const rsvp = rsvpByUserId.get(member.id);

            return (
              <div
                key={member.id}
                className={
                  index === members.length - 1
                    ? "flex items-center justify-between gap-4 p-4"
                    : "flex items-center justify-between gap-4 border-b-2 border-outline p-4"
                }
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MemberAvatar
                    color={member.avatarColor}
                    name={member.displayName}
                    size="sm"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-cream">
                      {member.displayName}
                    </p>

                    <p className="mt-1 text-xs text-cream-muted">
                      {member.role === "admin"
                        ? "Správce party"
                        : "Člen party"}
                    </p>
                  </div>
                </div>

                {rsvp ? (
                  <PixelBadge tone={rsvpTones[rsvp.status]}>
                    {rsvpLabels[rsvp.status]}
                  </PixelBadge>
                ) : (
                  <PixelBadge tone="muted">BEZ ODPOVĚDI</PixelBadge>
                )}
              </div>
            );
          })}
        </PixelPanel>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <SessionGamePlanner session={session} />

        <PixelPanel tone="deep">
          <div className="grid size-11 place-items-center border-2 border-outline bg-panel-muted text-wine-light shadow-pixel-sm">
            <Dices aria-hidden="true" size={20} />
          </div>

          <h2 className="mt-5 font-pixel text-[11px] leading-7 text-cream">
            Hody kostkou
          </h2>

          <p className="mt-3 text-sm leading-6 text-cream-muted">
            Dice Lab už umí ukládat hody přímo k session. Otevři kostky,
            vyber tuto session a každý critical hit i fail zůstane v kronice.
          </p>
        </PixelPanel>

        <SessionDebtSummary sessionId={session.id} />
      </div>

      <SessionExpensesPanel
        sessionId={session.id}
        sessionTitle={session.title}
      />

      {isAdmin ? (
        <SessionForm
          key={isEditOpen ? `edit-${session.id}` : "edit-closed"}
          onClose={() => setIsEditOpen(false)}
          open={isEditOpen}
          session={session}
        />
      ) : null}
    </div>
  );
}
