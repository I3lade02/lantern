import { UsersRound } from "lucide-react";

import { FeatureNotice } from "@/components/shared/feature-notice";
import { PageShell } from "@/components/shared/page-shell";

export const metadata = {
  title: "Členové",
};

export default function MembersPage() {
  return (
    <PageShell
      description="Soukromý seznam členů party, jejich role a budoucí správa přístupů."
      eyebrow="PARTY ROSTER"
      title="Členové"
    >
      <FeatureNotice
        description="Zde přidáme realtime seznam profilů z users kolekce, barevné avatary, editaci vlastního jména a administrátorskou správu rolí."
        eyebrow="MEMBER ROSTER"
        icon={UsersRound}
        nextStep="Členy zapojíme po hlavním dashboardu. Přístupový allowlist a role admin/member už jsou připravené ve Firestore."
        title="Parta je zabezpečená"
      />
    </PageShell>
  );
}