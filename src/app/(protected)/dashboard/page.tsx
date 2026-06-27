import { PageShell } from "@/components/shared/page-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <PageShell
      description="Přehled session, útrat, dluhů a všeho, co se v partě právě děje."
      eyebrow="THE LANTERN IS LIT"
      title="Dashboard"
    >
      <DashboardOverview />
    </PageShell>
  );
}