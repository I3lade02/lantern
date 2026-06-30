"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Save } from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import { useAuth } from "@/features/auth/auth-provider";
import { useMembers } from "@/features/members/use-members";
import {
  createSession,
  getSessionErrorMessage,
  updateSession,
} from "@/features/sessions/session-service";
import {
  sessionFormSchema,
  type SessionFormValues,
} from "@/features/sessions/session-schemas";
import type { Session } from "@/types/session";

const fieldClassName =
  "w-full border-2 border-outline rounded-none bg-panel-deep px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0_/_0.35)] transition-colors placeholder:text-cream-muted focus:border-amber focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const statusOptions = [
  { value: "upcoming", label: "Připravuje se" },
  { value: "active", label: "Právě probíhá" },
  { value: "finished", label: "Dohráno" },
  { value: "cancelled", label: "Zrušeno" },
] as const;

type SessionFormProps = {
  open: boolean;
  onClose: () => void;
  session?: Session;
};

function getActorName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  return displayName?.trim() || email?.split("@")[0] || "Člen party";
}

function getDateTimeInputValue(session?: Session): string {
  if (!session?.startAt) {
    return "";
  }

  return format(session.startAt.toDate(), "yyyy-MM-dd'T'HH:mm");
}

export function SessionForm({
  open,
  onClose,
  session,
}: SessionFormProps) {
  const { profile, profileStatus, user } = useAuth();
  const { members, isLoading: areMembersLoading } = useMembers(
    profileStatus === "ready",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const actorId = user?.uid ?? "";
  const isEditMode = Boolean(session);
  const isAdmin = profile?.role === "admin";

  const defaultValues = useMemo<SessionFormValues>(
    () => ({
      title: session?.title ?? "",
      description: session?.description ?? "",
      startAt: getDateTimeInputValue(session),
      location: session?.location ?? "",
      hostId: session?.hostId ?? actorId,
      status: session?.status ?? "upcoming",
    }),
    [actorId, session],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionFormValues>({
    defaultValues,
    resolver: zodResolver(sessionFormSchema),
  });

  async function onSubmit(values: SessionFormValues) {
    if (!user) {
      toast.error("Přihlášení uživatele není připravené.");
      return;
    }

    const selectedHostId =
      !isEditMode && !isAdmin
        ? actorId
        : values.hostId;

    const host = members.find(
      (member) => member.id === selectedHostId,
    );

    if (!host) {
      toast.error("Vybraného hostitele se nepodařilo najít.");
      return;
    }

    const startAt = new Date(values.startAt);

    if (Number.isNaN(startAt.getTime())) {
      toast.error("Datum a čas nejsou platné.");
      return;
    }

    setIsSubmitting(true);

    try {
      const input = {
        title: values.title.trim(),
        description: values.description.trim(),
        startAt,
        location: values.location.trim(),
        hostId: host.id,
        hostName: host.displayName,
        status: values.status,
      };

      const actor = {
        id: user.uid,
        name: getActorName(profile?.displayName, user.email),
      };

      if (session) {
        await updateSession(session.id, input, actor);
        toast.success("Session byla upravena.");
      } else {
        await createSession(input, actor);
        toast.success("Nová game night je na tabuli.");
      }

      onClose();
    } catch (error) {
      toast.error(getSessionErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PixelModal
      description={
        isEditMode
          ? "Uprav datum, hostitele, místo nebo stav session."
          : "Naplánuj další herní večer pro celou partu."
      }
      onClose={onClose}
      open={open}
      size="lg"
      title={isEditMode ? "Upravit session" : "Naplánovat session"}
    >
      <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
        <PixelInput
          error={errors.title?.message}
          id="session-title"
          label="Název session"
          maxLength={80}
          placeholder="Například: Pátek u Ondry"
          required
          {...register("title")}
        />

        <div className="grid gap-2">
          <label
            className="font-pixel text-[10px] leading-5 text-cream"
            htmlFor="session-description"
          >
            Poznámka
          </label>

          <textarea
            className={`${fieldClassName} min-h-28 resize-y`}
            id="session-description"
            maxLength={1000}
            placeholder="Co se chystá, co přinést, jaké hry jsou ve hře…"
            {...register("description")}
          />

          {errors.description?.message ? (
            <p className="text-sm text-danger">
              {errors.description.message}
            </p>
          ) : (
            <p className="text-sm text-cream-muted">
              Nepovinné. Zatím stačí krátká poznámka pro partu.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <PixelInput
            error={errors.startAt?.message}
            id="session-start-at"
            label="Datum a čas"
            required
            type="datetime-local"
            {...register("startAt")}
          />

          <PixelInput
            error={errors.location?.message}
            id="session-location"
            label="Místo"
            maxLength={120}
            placeholder="U Ondry, klubovna, online…"
            required
            {...register("location")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              className="font-pixel text-[10px] leading-5 text-cream"
              htmlFor="session-host"
            >
              Hostitel <span className="ml-1 text-amber">*</span>
            </label>

            <select
              className={fieldClassName}
              disabled={areMembersLoading}
              id="session-host"
              {...register("hostId")}
            >
              <option value="">
                {areMembersLoading
                  ? "Načítám členy…"
                  : "Vyber hostitele"}
              </option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.displayName}
                </option>
              ))}
            </select>

            {errors.hostId?.message ? (
              <p className="text-sm text-danger">{errors.hostId.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label
              className="font-pixel text-[10px] leading-5 text-cream"
              htmlFor="session-status"
            >
              Stav session
            </label>

            <select
              className={fieldClassName}
              id="session-status"
              {...register("status")}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {errors.status?.message ? (
              <p className="text-sm text-danger">{errors.status.message}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-3 border-t-2 border-outline-soft pt-5 sm:flex-row sm:justify-end">
          <PixelButton
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            Zrušit
          </PixelButton>

          <PixelButton
            disabled={isSubmitting || areMembersLoading}
            type="submit"
            variant={isEditMode ? "amber" : "moss"}
          >
            {isEditMode ? (
              <Save aria-hidden="true" size={16} />
            ) : (
              <CalendarPlus aria-hidden="true" size={16} />
            )}

            {isSubmitting
              ? "Ukládám…"
              : isEditMode
                ? "Uložit změny"
                : "Vytvořit session"}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}