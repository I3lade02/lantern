"use client";

import { useMemo, useState } from "react";
import { ReceiptText, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelModal } from "@/components/ui/pixel-modal";
import { toast } from "@/components/ui/pixel-toast";
import { useAuth } from "@/features/auth/auth-provider";
import { useSessionRsvps } from "@/features/expenses/use-session-rsvps";
import {
  createExpense,
  getExpenseErrorMessage,
  updateExpense,
} from "@/features/expenses/expense-service";
import {
  expenseFormSchema,
  type ExpenseFormValues,
} from "@/features/expenses/expense-schemas";
import { useMembers } from "@/features/members/use-members";
import { useSessions } from "@/features/sessions/use-sessions";
import {
  formatCentsForInput,
  parseCzkInputToCents,
  splitEvenly,
} from "@/lib/money";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_SPLIT_TYPES,
  EXPENSE_SPLIT_TYPE_LABELS,
  type Expense,
  type ExpensePreset,
  type ExpenseShare,
} from "@/types/expense";
import type { UserProfile } from "@/types/user";

const fieldClassName =
  "w-full border-2 border-outline rounded-none bg-panel-deep px-3 py-3 text-sm text-cream shadow-[inset_2px_2px_0_rgb(0_0_0_/_0.35)] transition-colors placeholder:text-cream-muted focus:border-amber focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

type ExpenseFormProps = {
  open: boolean;
  onClose: () => void;
  expense?: Expense;
  preset?: ExpensePreset;
  fixedSessionId?: string;
};

type ShareBuildResult =
  | {
      shares: ExpenseShare[];
      participantIds: string[];
    }
  | {
      error: string;
    };

function getActorName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  return displayName?.trim() || email?.split("@")[0] || "Člen party";
}

function getMemberById(
  members: UserProfile[],
  memberId: string,
): UserProfile | undefined {
  return members.find((member) => member.id === memberId);
}

function buildShares({
  amountCents,
  splitType,
  singleParticipantId,
  selectedParticipantIds,
  customAmounts,
  members,
  goingRsvps,
}: {
  amountCents: number;
  splitType: ExpenseFormValues["splitType"];
  singleParticipantId: string;
  selectedParticipantIds: string[];
  customAmounts: Record<string, string>;
  members: UserProfile[];
  goingRsvps: Array<{
    userId: string;
    userName: string;
  }>;
}): ShareBuildResult {
  if (splitType === "single") {
    const participant = getMemberById(members, singleParticipantId);

    if (!participant) {
      return {
        error: "Vyber člověka, pro kterého položka byla.",
      };
    }

    return {
      participantIds: [participant.id],
      shares: [
        {
          userId: participant.id,
          userName: participant.displayName,
          amountCents,
        },
      ],
    };
  }

  if (splitType === "selected") {
    const participants = selectedParticipantIds
      .map((memberId) => getMemberById(members, memberId))
      .filter((member): member is UserProfile => Boolean(member));

    if (participants.length === 0) {
      return {
        error: "Vyber alespoň jednoho člověka pro rozdělení položky.",
      };
    }

    return {
      participantIds: participants.map((participant) => participant.id),
      shares: splitEvenly(
        amountCents,
        participants.map((participant) => ({
          userId: participant.id,
          userName: getActorName(participant.displayName, participant.email),
        })),
      ),
    };
  }

  if (splitType === "sessionParticipants") {
    if (goingRsvps.length === 0) {
      return {
        error:
          "Na vybrané session zatím není nikdo potvrzený. Použij jiný typ rozdělení.",
      };
    }

    return {
      participantIds: goingRsvps.map((participant) => participant.userId),
      shares: splitEvenly(amountCents, goingRsvps),
    };
  }

  const shares: ExpenseShare[] = [];

  for (const member of members) {
    const rawValue = customAmounts[member.id]?.trim();

    if (!rawValue) {
      continue;
    }

    const amountForMember = parseCzkInputToCents(rawValue);

    if (amountForMember === null) {
      return {
        error: `Částka pro ${member.displayName} není platná.`,
      };
    }

    if (amountForMember > 0) {
      shares.push({
        userId: member.id,
        userName: member.displayName,
        amountCents: amountForMember,
      });
    }
  }

  if (shares.length === 0) {
    return {
      error: "Pro ruční rozdělení zadej alespoň jednu částku.",
    };
  }

  const totalSplitCents = shares.reduce(
    (total, share) => total + share.amountCents,
    0,
  );

  if (totalSplitCents !== amountCents) {
    return {
      error: "Součet ručního rozdělení musí přesně odpovídat ceně položky.",
    };
  }

  return {
    participantIds: shares.map((share) => share.userId),
    shares,
  };
}

export function ExpenseForm({
  open,
  onClose,
  expense,
  preset,
  fixedSessionId,
}: ExpenseFormProps) {
  const { profile, profileStatus, user } = useAuth();

  const { members, isLoading: areMembersLoading } = useMembers(
    profileStatus === "ready",
  );

  const { sessions, isLoading: areSessionsLoading } = useSessions(
    profileStatus === "ready",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const actorId = user?.uid ?? "";
  const isEditMode = Boolean(expense);

  const defaultValues = useMemo<ExpenseFormValues>(
    () => ({
      title: expense?.title ?? preset?.title ?? "",
      category: expense?.category ?? preset?.category ?? "other",
      amount: expense ? formatCentsForInput(expense.amountCents) : "",
      sessionId: expense?.sessionId ?? fixedSessionId ?? "",
      payerId: expense?.payerId ?? actorId,
      splitType: expense?.splitType ?? "selected",
      note: expense?.note ?? "",
    }),
    [actorId, expense, fixedSessionId, preset],
  );

  const initialSelectedParticipants = useMemo(
    () => expense?.participantIds ?? [],
    [expense],
  );

  const initialCustomAmounts = useMemo(
    () =>
      Object.fromEntries(
        (expense?.shares ?? []).map((share) => [
          share.userId,
          formatCentsForInput(share.amountCents),
        ]),
      ),
    [expense],
  );

  const [selectedParticipantIds, setSelectedParticipantIds] = useState<
    string[]
  >(initialSelectedParticipants);

  const [singleParticipantId, setSingleParticipantId] = useState(
    expense?.participantIds[0] ?? actorId,
  );

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    initialCustomAmounts,
  );

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    defaultValues,
    resolver: zodResolver(expenseFormSchema),
  });

  const selectedSessionId = useWatch({
    control,
    name: "sessionId",
  });

  const selectedSplitType = useWatch({
    control,
    name: "splitType",
  });

  const {
    rsvps,
    isLoading: areRsvpsLoading,
  } = useSessionRsvps(
    selectedSessionId,
    profileStatus === "ready" && Boolean(selectedSessionId),
  );

  const goingRsvps = useMemo(
    () =>
      rsvps
        .filter((rsvp) => rsvp.status === "going")
        .map((rsvp) => ({
          userId: rsvp.userId,
          userName: rsvp.userName,
        })),
    [rsvps],
  );

  const sessionField = register("sessionId");

  function toggleSelectedParticipant(memberId: string) {
    setSelectedParticipantIds((currentIds) =>
      currentIds.includes(memberId)
        ? currentIds.filter((id) => id !== memberId)
        : [...currentIds, memberId],
    );
  }

  async function onSubmit(values: ExpenseFormValues) {
    if (!user) {
      toast.error("Přihlášení uživatele není připravené.");
      return;
    }

    const amountCents = parseCzkInputToCents(values.amount);

    if (!amountCents || amountCents <= 0) {
      setError("amount", {
        type: "manual",
        message: "Zadej cenu větší než 0 Kč.",
      });

      return;
    }

    if (amountCents > 10_000_000) {
      setError("amount", {
        type: "manual",
        message: "Maximální cena jedné položky je 100 000 Kč.",
      });

      return;
    }

    const payer = getMemberById(members, values.payerId);

    if (!payer) {
      setError("payerId", {
        type: "manual",
        message: "Vybraného plátce se nepodařilo najít.",
      });

      return;
    }

    const shareResult = buildShares({
      amountCents,
      splitType: values.splitType,
      singleParticipantId,
      selectedParticipantIds,
      customAmounts,
      members,
      goingRsvps,
    });

    if ("error" in shareResult) {
      setError("splitType", {
        type: "manual",
        message: shareResult.error,
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const input = {
        title: values.title.trim(),
        category: values.category,
        amountCents,
        sessionId: values.sessionId,
        payerId: payer.id,
        payerName: payer.displayName,
        participantIds: shareResult.participantIds,
        splitType: values.splitType,
        shares: shareResult.shares,
        note: values.note.trim(),
      };

      const actor = {
        id: user.uid,
        name: getActorName(profile?.displayName, user.email),
      };

      if (expense) {
        await updateExpense(expense.id, input, actor);
        toast.success("Útrata byla upravena.");
      } else {
        await createExpense(input, actor);
        toast.success("Útrata byla přidána do knihy.");
      }

      onClose();
    } catch (error) {
      toast.error(getExpenseErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PixelModal
      description={
        isEditMode
          ? "Uprav cenu, plátce, rozdělení nebo poznámku."
          : "Přidej položku, vyber plátce a rozhodni, kdo se na ní podílí."
      }
      onClose={onClose}
      open={open}
      size="lg"
      title={isEditMode ? "Upravit útratu" : "Přidat útratu"}
    >
      <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 sm:grid-cols-[1fr_11rem]">
          <PixelInput
            error={errors.title?.message}
            id="expense-title"
            label="Název položky"
            maxLength={80}
            placeholder="Například: 2× limonáda"
            required
            {...register("title")}
          />

          <PixelInput
            error={errors.amount?.message}
            id="expense-amount"
            inputMode="decimal"
            label="Cena v Kč"
            placeholder="49,50"
            required
            {...register("amount")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              className="font-pixel text-[10px] leading-5 text-cream"
              htmlFor="expense-category"
            >
              Kategorie
            </label>

            <select
              className={fieldClassName}
              id="expense-category"
              {...register("category")}
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {EXPENSE_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label
              className="font-pixel text-[10px] leading-5 text-cream"
              htmlFor="expense-session"
            >
              Session <span className="ml-1 text-amber">*</span>
            </label>

            <select
              className={fieldClassName}
              disabled={Boolean(fixedSessionId) || areSessionsLoading}
              id="expense-session"
              {...sessionField}
              onChange={(event) => {
                sessionField.onChange(event);
                setSelectedParticipantIds([]);
              }}
            >
              <option value="">
                {areSessionsLoading ? "Načítám sessions…" : "Vyber session"}
              </option>

              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>

            {errors.sessionId?.message ? (
              <p className="text-sm text-danger">{errors.sessionId.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <label
            className="font-pixel text-[10px] leading-5 text-cream"
            htmlFor="expense-payer"
          >
            Kdo platil <span className="ml-1 text-amber">*</span>
          </label>

          <select
            className={fieldClassName}
            disabled={areMembersLoading}
            id="expense-payer"
            {...register("payerId")}
          >
            <option value="">
              {areMembersLoading ? "Načítám členy…" : "Vyber plátce"}
            </option>

            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </select>

          {errors.payerId?.message ? (
            <p className="text-sm text-danger">{errors.payerId.message}</p>
          ) : null}
        </div>

        <div className="border-2 border-outline bg-panel-deep p-4 shadow-pixel-sm">
          <label
            className="font-pixel text-[10px] leading-5 text-cream"
            htmlFor="expense-split-type"
          >
            Rozdělení položky
          </label>

          <select
            className={`${fieldClassName} mt-3`}
            id="expense-split-type"
            {...register("splitType")}
          >
            {EXPENSE_SPLIT_TYPES.map((splitType) => (
              <option key={splitType} value={splitType}>
                {EXPENSE_SPLIT_TYPE_LABELS[splitType]}
              </option>
            ))}
          </select>

          {selectedSplitType === "single" ? (
            <div className="mt-4 grid gap-2">
              <label
                className="font-pixel text-[9px] leading-5 text-cream-muted"
                htmlFor="single-participant"
              >
                PRO KOHO BYLA POLOŽKA
              </label>

              <select
                className={fieldClassName}
                id="single-participant"
                onChange={(event) => setSingleParticipantId(event.target.value)}
                value={singleParticipantId}
              >
                <option value="">Vyber člověka</option>

                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {selectedSplitType === "selected" ? (
            <div className="mt-4">
              <p className="font-pixel text-[9px] leading-5 text-cream-muted">
                VYBER LIDI PRO ROZDĚLENÍ
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {members.map((member) => {
                  const isSelected = selectedParticipantIds.includes(member.id);

                  return (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-3 border-2 border-outline bg-panel px-3 py-3 text-sm text-cream transition-colors hover:bg-panel-muted"
                    >
                      <input
                        checked={isSelected}
                        className="size-4 accent-amber"
                        onChange={() => toggleSelectedParticipant(member.id)}
                        type="checkbox"
                      />

                      <span>{member.displayName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {selectedSplitType === "sessionParticipants" ? (
            <div className="mt-4 border-2 border-outline bg-panel p-4">
              <p className="font-pixel text-[9px] leading-5 text-moss-light">
                POTVRZENÍ ÚČASTNÍCI SESSION
              </p>

              <p className="mt-2 text-sm leading-6 text-cream-muted">
                {areRsvpsLoading
                  ? "Načítám RSVP stavy…"
                  : goingRsvps.length > 0
                    ? `Položka se rozdělí mezi ${goingRsvps.length} potvrzených členů.`
                    : "Na této session zatím nikdo nepotvrdil účast."}
              </p>

              {goingRsvps.length > 0 ? (
                <p className="mt-3 text-sm text-cream">
                  {goingRsvps.map((rsvp) => rsvp.userName).join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}

          {selectedSplitType === "custom" ? (
            <div className="mt-4">
              <p className="font-pixel text-[9px] leading-5 text-cream-muted">
                RUČNÍ ROZDĚLENÍ V KČ
              </p>

              <p className="mt-2 text-sm leading-6 text-cream-muted">
                Nech prázdné, pokud daný člověk na položku nepřispívá. Součet
                musí přesně odpovídat ceně položky.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {members.map((member) => (
                  <label key={member.id} className="grid gap-2">
                    <span className="text-sm font-semibold text-cream">
                      {member.displayName}
                    </span>

                    <input
                      className={fieldClassName}
                      inputMode="decimal"
                      onChange={(event) =>
                        setCustomAmounts((currentAmounts) => ({
                          ...currentAmounts,
                          [member.id]: event.target.value,
                        }))
                      }
                      placeholder="0"
                      value={customAmounts[member.id] ?? ""}
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {errors.splitType?.message ? (
            <p className="mt-4 text-sm text-danger">
              {errors.splitType.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label
            className="font-pixel text-[10px] leading-5 text-cream"
            htmlFor="expense-note"
          >
            Poznámka
          </label>

          <textarea
            className={`${fieldClassName} min-h-24 resize-y`}
            id="expense-note"
            maxLength={500}
            placeholder="Například: objednáno při třetí partii Rootu"
            {...register("note")}
          />

          {errors.note?.message ? (
            <p className="text-sm text-danger">{errors.note.message}</p>
          ) : null}
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
            disabled={
              isSubmitting ||
              areMembersLoading ||
              areSessionsLoading ||
              (selectedSplitType === "sessionParticipants" &&
                areRsvpsLoading)
            }
            type="submit"
            variant={isEditMode ? "amber" : "moss"}
          >
            {isEditMode ? (
              <Save aria-hidden="true" size={16} />
            ) : (
              <ReceiptText aria-hidden="true" size={16} />
            )}

            {isSubmitting
              ? "Ukládám…"
              : isEditMode
                ? "Uložit změny"
                : "Přidat útratu"}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}