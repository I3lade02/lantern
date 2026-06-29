"use client";

import { useState } from "react";
import {
  Crown,
  RefreshCw,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { useAuth } from "@/features/auth/auth-provider";
import { MemberCard } from "@/features/members/member-card";
import { MemberProfileModal } from "@/features/members/member-profile-modal";
import { MemberRoleActions } from "@/features/members/member-role-actions";
import { useMembers } from "@/features/members/use-members";
import { PendingJoinRequestsPanel } from "../join-requests/pending-join-requests-panel";
import type { UserProfile } from "@/types/user";

export function MemberOverview() {
  const { profile, profileStatus, user } = useAuth();

  const {
    members,
    isLoading,
    error,
  } = useMembers(profileStatus === "ready");

  const [isProfileModalOpen, setIsProfileModalOpen] =
    useState(false);

  const [roleTarget, setRoleTarget] =
    useState<UserProfile | null>(null);

  if (isLoading) {
    return <LoadingState label="Načítám roster party…" />;
  }

  if (error) {
    return (
      <PixelPanel className="max-w-2xl" padding="lg">
        <p className="font-pixel text-[10px] leading-5 text-wine-light">
          MEMBERS ERROR
        </p>

        <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
          Členy party se nepodařilo načíst
        </h2>

        <p className="mt-3 text-sm leading-6 text-cream-muted">
          {error}
        </p>

        <PixelButton
          className="mt-6"
          onClick={() => window.location.reload()}
          variant="moss"
        >
          <RefreshCw aria-hidden="true" size={16} />
          Obnovit stránku
        </PixelButton>
      </PixelPanel>
    );
  }

  if (!profile || !user) {
    return null;
  }

  const isAdmin = profile.role === "admin";

  const adminCount = members.filter(
    (member) => member.role === "admin",
  ).length;

  const memberCount = members.filter(
    (member) => member.role === "member",
  ).length;

  return (
    <div className="grid gap-8">
      <PixelPanel className="pixel-grid" tone="deep">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-pixel text-[9px] leading-5 text-amber-light">
              PARTY ROSTER
            </p>

            <h2 className="mt-3 font-pixel text-sm leading-8 text-cream">
              Členové LANternu
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
              Přehled celé party, rolí, avatarů a lidí, kteří budou
              pravděpodobně znovu tvrdit, že tentokrát přinesou snacky.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-2 border-outline bg-panel p-4 shadow-pixel-sm">
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                ČLENOVÉ
              </p>

              <p className="mt-2 font-pixel text-lg leading-8 text-cream">
                {memberCount}
              </p>
            </div>

            <div className="border-2 border-outline bg-panel p-4 shadow-pixel-sm">
              <p className="font-pixel text-[8px] leading-4 text-cream-muted">
                ADMINI
              </p>

              <p className="mt-2 font-pixel text-lg leading-8 text-amber-light">
                {adminCount}
              </p>
            </div>
          </div>
        </div>
      </PixelPanel>

      <PixelPanel tone="deep">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="grid size-12 shrink-0 place-items-center border-2 border-outline bg-amber text-void shadow-pixel-sm">
              <Crown aria-hidden="true" size={21} />
            </div>

            <div>
              <p className="font-pixel text-[9px] leading-5 text-amber-light">
                TVŮJ PROFIL
              </p>

              <h2 className="mt-2 font-pixel text-[11px] leading-7 text-cream">
                {profile.displayName}
              </h2>

              <p className="mt-1 text-sm text-cream-muted">
                {profile.role === "admin"
                  ? "Správce party"
                  : "Člen party"}
              </p>
            </div>
          </div>

          <PixelButton
            onClick={() => setIsProfileModalOpen(true)}
            variant="amber"
          >
            Upravit můj profil
          </PixelButton>
        </div>
      </PixelPanel>

      {isAdmin ? <PendingJoinRequestsPanel /> : null}

      {isAdmin ? (
        <PixelPanel tone="muted">
          <div className="flex gap-4">
            <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-moss text-void shadow-pixel-sm">
              <ShieldCheck aria-hidden="true" size={19} />
            </div>

            <p className="text-sm leading-6 text-cream-muted">
              Jako admin můžeš povyšovat nebo snižovat role ostatních členů.
              Sám sobě roli odebrat nemůžeš, aby LANtern nezůstal bez
              správce.
            </p>
          </div>
        </PixelPanel>
      ) : (
        <PixelPanel tone="muted">
          <div className="flex gap-4">
            <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-panel text-amber shadow-pixel-sm">
              <UsersRound aria-hidden="true" size={19} />
            </div>

            <p className="text-sm leading-6 text-cream-muted">
              Role admina může spravovat sessions, settlementy, útraty a
              potvrzování QR plateb. Běžní členové mohou normálně reagovat
              na sessions, zapisovat útraty a házet kostkami.
            </p>
          </div>
        </PixelPanel>
      )}

      <section>
        <p className="mb-3 font-pixel text-[9px] leading-5 text-cream-muted">
          ROSTER PARTY
        </p>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              currentUserId={user.uid}
              isCurrentUserAdmin={isAdmin}
              member={member}
              onEditOwnProfile={() =>
                setIsProfileModalOpen(true)
              }
              onManageRole={() => setRoleTarget(member)}
            />
          ))}
        </div>
      </section>

      {isProfileModalOpen ? (
        <MemberProfileModal
          key={`profile-${profile.id}-${profile.updatedAt?.toMillis() ?? 0}`}
          onClose={() => setIsProfileModalOpen(false)}
          profile={profile}
        />
      ) : null}

      {roleTarget ? (
        <MemberRoleActions
          key={`role-${roleTarget.id}-${roleTarget.role}`}
          member={roleTarget}
          onClose={() => setRoleTarget(null)}
        />
      ) : null}
    </div>
  );
}