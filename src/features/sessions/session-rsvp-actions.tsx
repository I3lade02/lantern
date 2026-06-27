"use client";

import { useState } from "react";
import { Check, HelpCircle, X } from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { toast } from "@/components/ui/pixel-toast";
import {
  getSessionErrorMessage,
  setSessionRsvp,
} from "@/features/sessions/session-service";
import type {
  Session,
  SessionRsvpStatus,
  SessionStatus,
} from "@/types/session";

type SessionRsvpActionsProps = {
  session: Session;
  actor: {
    id: string;
    name: string;
  };
  currentStatus: SessionRsvpStatus | null;
};

const rsvpOptions = [
  {
    status: "going",
    label: "Jdu",
    icon: Check,
    variant: "moss",
  },
  {
    status: "maybe",
    label: "Možná",
    icon: HelpCircle,
    variant: "amber",
  },
  {
    status: "notGoing",
    label: "Nejedu",
    icon: X,
    variant: "wine",
  },
] as const;

function isRsvpClosed(status: SessionStatus): boolean {
  return status === "finished" || status === "cancelled";
}

export function SessionRsvpActions({
  session,
  actor,
  currentStatus,
}: SessionRsvpActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled = isSubmitting || isRsvpClosed(session.status);

  async function handleRsvp(status: SessionRsvpStatus) {
    if (status === currentStatus) {
      return;
    }

    setIsSubmitting(true);

    try {
      await setSessionRsvp(session, status, actor);

      const confirmation = {
        going: "Účast potvrzena. Taverní stůl s tebou počítá.",
        maybe: "Zapsáno jako možná. Kostky zatím drží místo.",
        notGoing: "Zapsáno. Příště se lucerna rozsvítí znovu.",
      } satisfies Record<SessionRsvpStatus, string>;

      toast.success(confirmation[status]);
    } catch (error) {
      toast.error(getSessionErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isRsvpClosed(session.status)) {
    return (
      <p className="text-sm leading-6 text-cream-muted">
        RSVP je pro tuto session uzavřené.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {rsvpOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = currentStatus === option.status;

        return (
          <PixelButton
            key={option.status}
            disabled={disabled}
            fullWidth
            onClick={() => handleRsvp(option.status)}
            variant={isSelected ? option.variant : "ghost"}
          >
            <Icon aria-hidden="true" size={16} />
            {isSubmitting && isSelected ? "Ukládám…" : option.label}
          </PixelButton>
        );
      })}
    </div>
  );
}