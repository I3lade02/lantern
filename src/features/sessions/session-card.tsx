import Link from "next/link";
import {
  CalendarClock,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";

import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { formatSessionDate } from "@/lib/formatters";
import type { Session, SessionStatus } from "@/types/session";

type SessionCardProps = {
  session: Session;
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

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link
      className="group block focus-visible:outline-none"
      href={`/sessions/${session.id}`}
    >
      <PixelPanel className="h-full transition-[transform,filter] group-hover:-translate-y-0.5 group-hover:brightness-110">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PixelBadge tone={statusTones[session.status]}>
            {statusLabels[session.status]}
          </PixelBadge>

          <p className="font-pixel text-[9px] leading-5 text-amber-light">
            {session.rsvpSummary.going} JDE
          </p>
        </div>

        <h2 className="mt-5 font-pixel text-xs leading-7 text-cream">
          {session.title}
        </h2>

        {session.description ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-cream-muted">
            {session.description}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-cream-muted">
            Bez poznámky. Tajemná výprava do herního večera.
          </p>
        )}

        <div className="mt-6 grid gap-3 border-t-2 border-outline-soft pt-5 text-sm text-cream-muted">
          <div className="flex items-start gap-3">
            <CalendarClock
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-amber-light"
              size={17}
            />

            <span>{formatSessionDate(session.startAt)}</span>
          </div>

          <div className="flex items-start gap-3">
            <MapPin
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-moss-light"
              size={17}
            />

            <span>{session.location}</span>
          </div>

          <div className="flex items-start gap-3">
            <UserRound
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-cream-muted"
              size={17}
            />

            <span>Hostitel: {session.hostName}</span>
          </div>

          <div className="flex items-start gap-3">
            <UsersRound
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-wine-light"
              size={17}
            />

            <span>
              {session.rsvpSummary.going} jde · {session.rsvpSummary.maybe}{" "}
              možná · {session.rsvpSummary.notGoing} nejde
            </span>
          </div>
        </div>
      </PixelPanel>
    </Link>
  );
}