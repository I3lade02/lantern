import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { SessionCard } from "@/features/sessions/session-card";
import type { Session } from "@/types/session";

type SessionListProps = {
  sessions: Session[];
  emptyTitle: string;
  emptyDescription: string;
};

export function SessionList({
  sessions,
  emptyTitle,
  emptyDescription,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        description={emptyDescription}
        icon={CalendarDays}
        title={emptyTitle}
      />
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}