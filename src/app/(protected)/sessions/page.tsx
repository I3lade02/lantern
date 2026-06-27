import { CalendarDays } from "lucide-react";

import { FeatureNotice } from "@/components/shared/feature-notice";
import { PageShell } from "@/components/shared/page-shell";

export const metadata = {
  title: "Sessions",
};

export default function SessionsPage() {
  return (
    <PageShell
      description="Přehled minulých, aktivních a připravovaných game nights."
      eyebrow="GAME NIGHT PLANNER"
      title="Sessions"
    >
      <FeatureNotice
        description="Tady budou nadcházející session, RSVP jednotlivých členů, hostitel, místo, plánované hry, útraty i historie hodů kostkou."
        eyebrow="SESSION CHAMBER"
        icon={CalendarDays}
        nextStep="Vytvoříme Firestore model session, bezpečnostní pravidla, realtime seznam a formulář pro vytvoření první session."
        title="Session místnost je připravená"
      />
    </PageShell>
  );
}