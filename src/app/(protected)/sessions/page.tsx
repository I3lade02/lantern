import { PageShell } from "@/components/shared/page-shell";
import { SessionOverview } from "@/features/sessions/session-overview";

export const metadata = {
  title: "Sessions",
};

export default function SessionsPage() {
  return (
    <PageShell
      description="Naplánuj game night, potvrď účast a sleduj, kdo bude sedět u stolu."
      eyebrow="GAME NIGHT PLANNER"
      title="Sessions"
    >
      <SessionOverview />
    </PageShell>
  );
}