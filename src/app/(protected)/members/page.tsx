import { PageShell } from "@/components/shared/page-shell";
import { MemberOverview } from "@/features/members/member-overview";

export const metadata = {
  title: "Členové",
};

export default function MembersPage() {
  return (
    <PageShell
      description="Soukromý roster party, vlastní profil, avatar barvy a role členů."
      eyebrow="PARTY ROSTER"
      title="Členové"
    >
      <MemberOverview />
    </PageShell>
  );
}