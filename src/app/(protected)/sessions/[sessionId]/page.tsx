import { PageShell } from "@/components/shared/page-shell";
import { SessionDetailView } from "@/features/sessions/session-detail-view";

type SessionDetailPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export const metadata = {
  title: "Detail session",
};

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { sessionId } = await params;

  return (
    <PageShell
      description="Detaily session, RSVP party a budoucí herní kronika."
      eyebrow="SESSION DETAIL"
      title="Session"
    >
      <SessionDetailView sessionId={sessionId} />
    </PageShell>
  );
}