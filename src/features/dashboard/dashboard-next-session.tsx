import Link from "next/link";
import {
  CalendarClock,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { formatSessionDate } from "@/lib/formatters";
import type { Session, SessionStatus } from "@/types/session";

type DashboardNextSessionProps = {
  session: Session | null;
};

const statusLabels: Record<SessionStatus, string> = {
  upcoming: "PŘIPRAVUJE SE",
  active: "PRÁVĚ BĚŽÍ",
  finished: "DOHRÁNO",
  cancelled: "ZRUŠENO",
};

const statusTones: Record<
  SessionStatus,
  "amber" | "moss" | "wine" | "muted"
> = {
  upcoming: "amber",
  active: "moss",
  finished: "muted",
  cancelled: "wine",
};

export function DashboardNextSession({
  session,
}: DashboardNextSessionProps) {
  if (!session) {
    return (
      <section>
        <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
          NEJBLIŽŠÍ SESSION
        </p>

        <EmptyState
          action={
            <Link
              className="border-2 border-outline bg-moss px-4 py-3 font-pixel text-[9px] text-void shadow-pixel-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              href="/sessions"
            >
              Otevřít sessions
            </Link>
          }
          description="Zatím není naplánovaná žádná další game night. V další kapitole vytvoříme první session."
          icon={CalendarClock}
          title="Session tabule je prázdná"
        />
      </section>
    );
  }

  const confirmedCount = session.rsvpSummary.going;

  const sessionStatus = session.status as SessionStatus;

  return (
    <section>
      <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
        NEJBLIŽŠÍ SESSION
      </p>

      <PixelPanel className="pixel-grid" padding="none" tone="deep">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <PixelBadge tone={statusTones[sessionStatus]}>
                {statusLabels[sessionStatus]}
              </PixelBadge>

              <p className="font-pixel text-[9px] leading-5 text-amber-light">
                GAME NIGHT
              </p>
            </div>

            <h2 className="mt-4 font-pixel text-sm leading-8 text-cream">
              {session.title}
            </h2>

            {session.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
                {session.description}
              </p>
            ) : null}
          </div>

          <Link
            className="inline-flex shrink-0 items-center justify-center border-2 border-outline bg-amber px-4 py-3 font-pixel text-[9px] text-void shadow-pixel-sm transition-transform hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            href="/sessions"
          >
            Otevřít session
          </Link>
        </div>

        <div className="grid border-t-2 border-outline sm:grid-cols-3">
          <div className="flex gap-3 border-b-2 border-outline p-4 sm:border-b-0 sm:border-r-2">
            <CalendarClock
              aria-hidden="true"
              className="shrink-0 text-amber-light"
              size={18}
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

          <div className="flex gap-3 border-b-2 border-outline p-4 sm:border-b-0 sm:border-r-2">
            <MapPin
              aria-hidden="true"
              className="shrink-0 text-moss-light"
              size={18}
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

          <div className="flex gap-3 p-4">
            <UsersRound
              aria-hidden="true"
              className="shrink-0 text-wine-light"
              size={18}
            />

            <div>
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                POTVRZENO
              </p>

              <p className="mt-1 text-sm leading-6 text-cream">
                {confirmedCount} členů jde
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t-2 border-outline bg-panel p-4">
          <UserRound aria-hidden="true" className="text-cream-muted" size={17} />

          <p className="text-sm text-cream-muted">
            Hostitel: <span className="font-semibold text-cream">{session.hostName}</span>
          </p>
        </div>
      </PixelPanel>
    </section>
  );
}