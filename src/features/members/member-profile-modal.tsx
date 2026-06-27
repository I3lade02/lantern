"use client";

import { useState } from "react";
import {
  Palette,
  Save,
} from "lucide-react";

import { MemberAvatar } from "@/components/layout/member-avatar";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import {
  getMemberErrorMessage,
  updateOwnMemberProfile,
  validateDisplayName,
} from "@/features/members/member-service";
import {
  AVATAR_COLORS,
  AVATAR_COLOR_LABELS,
  type AvatarColor,
  type UserProfile,
} from "@/types/user";

type MemberProfileModalProps = {
  profile: UserProfile;
  onClose: () => void;
};

export function MemberProfileModal({
  profile,
  onClose,
}: MemberProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(
    profile.avatarColor,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const displayNameError = validateDisplayName(displayName);

    if (displayNameError) {
      setFormError(displayNameError);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await updateOwnMemberProfile(profile.id, {
        displayName,
        avatarColor,
      });

      toast.success("Profil byl upraven.");
      onClose();
    } catch (error) {
      toast.error(getMemberErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PixelModal
      description="Uprav své jméno v party a vyber barvu, podle které tě ostatní poznají i během velkého herního chaosu."
      onClose={onClose}
      open
      size="md"
      title="Upravit můj profil"
    >
      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="flex gap-4 border-2 border-outline bg-panel-deep p-4 shadow-pixel-sm">
          <MemberAvatar
            color={avatarColor}
            name={displayName || profile.displayName}
            size="lg"
          />

          <div>
            <p className="font-pixel text-[9px] leading-5 text-amber-light">
              TVŮJ PROFIL
            </p>

            <p className="mt-2 text-sm leading-6 text-cream-muted">
              E-mail zůstává zamčený, protože je navázaný na Firebase účet.
            </p>

            <p className="mt-1 text-sm font-semibold text-cream">
              {profile.email}
            </p>
          </div>
        </div>

        <PixelInput
          id="member-display-name"
          label="Display name"
          maxLength={24}
          placeholder="Například Ondra"
          required
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />

        <section>
          <div className="flex items-center gap-2">
            <Palette aria-hidden="true" className="text-amber-light" size={17} />

            <p className="font-pixel text-[10px] leading-5 text-cream">
              Barva avatara
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {AVATAR_COLORS.map((color) => {
              const isSelected = avatarColor === color;

              return (
                <button
                  key={color}
                  aria-pressed={isSelected}
                  className={
                    isSelected
                      ? "flex items-center gap-3 border-2 border-outline bg-amber p-3 text-left text-void shadow-pixel-sm"
                      : "flex items-center gap-3 border-2 border-outline bg-panel p-3 text-left text-cream transition-colors hover:bg-panel-muted"
                  }
                  onClick={() => setAvatarColor(color)}
                  type="button"
                >
                  <MemberAvatar
                    color={color}
                    name={displayName || profile.displayName}
                    size="sm"
                  />

                  <span className="font-pixel text-[9px] leading-5">
                    {AVATAR_COLOR_LABELS[color]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {formError ? (
          <div className="border-2 border-danger bg-wine-dark p-3 text-sm text-cream">
            {formError}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t-2 border-outline-soft pt-5 sm:flex-row sm:justify-end">
          <PixelButton
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            Zrušit
          </PixelButton>

          <PixelButton
            disabled={isSubmitting}
            type="submit"
            variant="moss"
          >
            <Save aria-hidden="true" size={16} />
            {isSubmitting ? "Ukládám…" : "Uložit profil"}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}