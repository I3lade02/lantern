import {
  Pencil,
  ShieldCheck,
  ShieldOff,
  UserRound,
} from "lucide-react";

import { MemberAvatar } from "@/components/layout/member-avatar";
import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import type { UserProfile } from "@/types/user";

type MemberCardProps = {
  member: UserProfile;
  currentUserId: string;
  isCurrentUserAdmin: boolean;
  onEditOwnProfile: () => void;
  onManageRole: () => void;
};

export function MemberCard({
  member,
  currentUserId,
  isCurrentUserAdmin,
  onEditOwnProfile,
  onManageRole,
}: MemberCardProps) {
  const isCurrentUser = member.id === currentUserId;

  return (
    <article className="flex h-full flex-col border-2 border-outline bg-panel p-5 shadow-pixel">
      <div className="flex items-start justify-between gap-4">
        <MemberAvatar
          color={member.avatarColor}
          name={member.displayName}
          size="lg"
        />

        <div className="flex flex-wrap justify-end gap-2">
          {isCurrentUser ? (
            <PixelBadge tone="amber">TY</PixelBadge>
          ) : null}

          <PixelBadge
            tone={member.role === "admin" ? "moss" : "muted"}
          >
            {member.role === "admin" ? "ADMIN" : "MEMBER"}
          </PixelBadge>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="truncate font-pixel text-[11px] leading-7 text-cream">
          {member.displayName}
        </h2>

        <p className="mt-2 truncate text-sm text-cream-muted">
          {member.email}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t-2 border-outline-soft pt-4 text-xs text-cream-muted">
        <UserRound aria-hidden="true" size={14} />

        <span>
          {member.role === "admin"
            ? "Správce party"
            : "Člen party"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {isCurrentUser ? (
          <PixelButton
            fullWidth
            onClick={onEditOwnProfile}
            size="sm"
            variant="amber"
          >
            <Pencil aria-hidden="true" size={15} />
            Upravit profil
          </PixelButton>
        ) : null}

        {isCurrentUserAdmin && !isCurrentUser ? (
          <PixelButton
            fullWidth
            onClick={onManageRole}
            size="sm"
            variant={
              member.role === "admin" ? "wine" : "moss"
            }
          >
            {member.role === "admin" ? (
              <ShieldOff aria-hidden="true" size={15} />
            ) : (
              <ShieldCheck aria-hidden="true" size={15} />
            )}

            {member.role === "admin"
              ? "Odebrat admina"
              : "Povýšit na admina"}
          </PixelButton>
        ) : null}
      </div>
    </article>
  );
}