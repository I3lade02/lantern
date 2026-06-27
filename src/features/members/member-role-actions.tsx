"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import {
  getMemberErrorMessage,
  updateMemberRole,
} from "@/features/members/member-service";
import type {
  UserProfile,
  UserRole,
} from "@/types/user";

type MemberRoleActionsProps = {
  member: UserProfile;
  onClose: () => void;
};

export function MemberRoleActions({
  member,
  onClose,
}: MemberRoleActionsProps) {
  const nextRole: UserRole =
    member.role === "admin" ? "member" : "admin";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPromoting = nextRole === "admin";

  async function handleRoleChange() {
    setIsSubmitting(true);

    try {
      await updateMemberRole(member.id, nextRole);

      toast.success(
        isPromoting
          ? `${member.displayName} je nyní admin party.`
          : `${member.displayName} je nyní member party.`,
      );

      onClose();
    } catch (error) {
      toast.error(getMemberErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PixelModal
      description={
        isPromoting
          ? "Admin může vytvářet sessions, upravovat útraty, počítat settlementy a potvrzovat platby."
          : "Member dál může zapisovat útraty, reagovat na sessions, házet kostkami a používat QR platbu."
      }
      onClose={onClose}
      open
      size="sm"
      title={
        isPromoting
          ? "Povýšit na admina?"
          : "Odebrat admin roli?"
      }
    >
      <div className="flex gap-4 border-2 border-outline bg-panel-deep p-4 shadow-pixel-sm">
        <div
          className={
            isPromoting
              ? "grid size-11 shrink-0 place-items-center border-2 border-outline bg-amber text-void"
              : "grid size-11 shrink-0 place-items-center border-2 border-outline bg-wine text-cream"
          }
        >
          {isPromoting ? (
            <ShieldCheck aria-hidden="true" size={21} />
          ) : (
            <ShieldOff aria-hidden="true" size={21} />
          )}
        </div>

        <p className="text-sm leading-6 text-cream-muted">
          Člen{" "}
          <span className="font-semibold text-cream">
            {member.displayName}
          </span>{" "}
          bude mít roli{" "}
          <span className="font-semibold text-cream">
            {nextRole === "admin" ? "admin" : "member"}
          </span>
          .
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <PixelButton
          disabled={isSubmitting}
          onClick={onClose}
          variant="ghost"
        >
          Zrušit
        </PixelButton>

        <PixelButton
          disabled={isSubmitting}
          onClick={handleRoleChange}
          variant={isPromoting ? "moss" : "wine"}
        >
          {isPromoting ? (
            <ShieldCheck aria-hidden="true" size={16} />
          ) : (
            <ShieldOff aria-hidden="true" size={16} />
          )}

          {isSubmitting
            ? "Ukládám…"
            : isPromoting
              ? "Povýšit na admina"
              : "Odebrat admin roli"}
        </PixelButton>
      </div>
    </PixelModal>
  );
}