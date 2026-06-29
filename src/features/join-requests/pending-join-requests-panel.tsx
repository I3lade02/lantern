"use client";

import { useState } from "react";
import {
  Check,
  Clock3,
  LoaderCircle,
  Mail,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";

import { PixelBadge } from "@/components/ui/pixel-badge";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelModal } from "@/components/ui/pixel-modal";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { toast } from "@/components/ui/pixel-toast";
import {
  getJoinRequestAdminErrorMessage,
  resolveJoinRequest,
  type JoinRequestAdminAction,
} from "@/features/join-requests/join-request-admin-service";
import { usePendingJoinRequests } from "@/features/join-requests/use-pending-join-request";
import { formatRelativeTime } from "@/lib/formatters";
import type { JoinRequest } from "@/types/join-request";

type DecisionTarget = {
  request: JoinRequest;
  action: JoinRequestAdminAction;
};

function getDecisionCopy(
  target: DecisionTarget,
): {
  title: string;
  description: string;
  actionLabel: string;
} {
  if (target.action === "approve") {
    return {
      title: "Přijmout člena do party?",
      description:
        "Vznikne mu profil člena, jeho e-mail se přidá do allowlistu a LANtern ho pustí dovnitř.",
      actionLabel: "Přijmout člena",
    };
  }

  return {
    title: "Odmítnout žádost?",
    description:
      "Firebase účet žadatele, jeho čekající žádost a případná data se odstraní. Tuto akci nelze vrátit zpět.",
    actionLabel: "Odmítnout žádost",
  };
}

export function PendingJoinRequestsPanel() {
  const {
    requests,
    isLoading,
    error,
  } = usePendingJoinRequests(true);

  const [decisionTarget, setDecisionTarget] =
    useState<DecisionTarget | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleDecision() {
    if (!decisionTarget) {
      return;
    }

    setIsSubmitting(true);

    try {
      await resolveJoinRequest({
        requestId: decisionTarget.request.id,
        action: decisionTarget.action,
      });

      if (decisionTarget.action === "approve") {
        toast.success(
          `${decisionTarget.request.displayName} byl přijat do party.`,
        );
      } else {
        toast.success(
          `Žádost uživatele ${decisionTarget.request.displayName} byla odmítnuta.`,
        );
      }

      setDecisionTarget(null);
    } catch (actionError) {
      toast.error(
        getJoinRequestAdminErrorMessage(actionError),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const decisionCopy = decisionTarget
    ? getDecisionCopy(decisionTarget)
    : null;

  return (
    <>
      <PixelPanel tone="deep">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="grid size-12 shrink-0 place-items-center border-2 border-outline bg-amber text-void shadow-pixel-sm">
              <UserPlus aria-hidden="true" size={21} />
            </div>

            <div>
              <p className="font-pixel text-[9px] leading-5 text-amber-light">
                JOIN REQUESTS
              </p>

              <h2 className="mt-2 font-pixel text-[11px] leading-7 text-cream">
                Žádosti o připojení
              </h2>

              <p className="mt-1 text-sm leading-6 text-cream-muted">
                Noví lidé čekající před branou LANternu.
              </p>
            </div>
          </div>

          <PixelBadge tone={requests.length > 0 ? "amber" : "muted"}>
            {requests.length === 1
              ? "1 ČEKÁ"
              : `${requests.length} ČEKÁ`}
          </PixelBadge>
        </div>

        {isLoading ? (
          <div className="mt-6 grid min-h-32 place-items-center border-2 border-outline bg-panel-deep">
            <div className="text-center">
              <LoaderCircle
                aria-hidden="true"
                className="mx-auto animate-spin text-amber-light"
                size={22}
              />

              <p className="mt-3 text-sm text-cream-muted">
                Kontroluji čekárnu…
              </p>
            </div>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-6 border-2 border-danger bg-wine-dark p-4 text-sm leading-6 text-cream">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && requests.length === 0 ? (
          <div className="mt-6 flex gap-3 border-2 border-outline bg-panel-deep p-4">
            <ShieldCheck
              aria-hidden="true"
              className="shrink-0 text-moss-light"
              size={20}
            />

            <p className="text-sm leading-6 text-cream-muted">
              Čekárna je prázdná. Všichni momentální návštěvníci už mají
              vyřešený vstup.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && requests.length > 0 ? (
          <div className="mt-6 grid gap-3">
            {requests.map((request: JoinRequest) => (
              <article
                key={request.id}
                className="grid gap-5 border-2 border-outline bg-panel p-4 shadow-pixel-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
              >
                <div className="flex min-w-0 gap-3">
                  <div className="grid size-11 shrink-0 place-items-center border-2 border-outline bg-panel-muted text-amber-light">
                    <UserPlus aria-hidden="true" size={19} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-cream">
                        {request.displayName}
                      </p>

                      <PixelBadge tone="amber">
                        ČEKÁ
                      </PixelBadge>
                    </div>

                    <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-cream-muted">
                      <Mail
                        aria-hidden="true"
                        className="shrink-0"
                        size={14}
                      />

                      <span className="truncate">
                        {request.email}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-cream-muted">
                      <Clock3
                        aria-hidden="true"
                        className="shrink-0"
                        size={13}
                      />

                      <span>
                        Zažádal {formatRelativeTime(request.requestedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-72">
                  <PixelButton
                    disabled={isSubmitting}
                    onClick={() =>
                      setDecisionTarget({
                        request,
                        action: "approve",
                      })
                    }
                    size="sm"
                    variant="moss"
                  >
                    <Check aria-hidden="true" size={15} />
                    Přijmout
                  </PixelButton>

                  <PixelButton
                    disabled={isSubmitting}
                    onClick={() =>
                      setDecisionTarget({
                        request,
                        action: "reject",
                      })
                    }
                    size="sm"
                    variant="wine"
                  >
                    <X aria-hidden="true" size={15} />
                    Odmítnout
                  </PixelButton>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </PixelPanel>

      {decisionTarget && decisionCopy ? (
        <PixelModal
          description={decisionCopy.description}
          onClose={() => {
            if (!isSubmitting) {
              setDecisionTarget(null);
            }
          }}
          open
          size="sm"
          title={decisionCopy.title}
        >
          <div className="border-2 border-outline bg-panel-deep p-4 shadow-pixel-sm">
            <p className="text-sm leading-6 text-cream-muted">
              Člen:
            </p>

            <p className="mt-1 font-semibold text-cream">
              {decisionTarget.request.displayName}
            </p>

            <p className="mt-1 text-sm text-cream-muted">
              {decisionTarget.request.email}
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <PixelButton
              disabled={isSubmitting}
              onClick={() => setDecisionTarget(null)}
              variant="ghost"
            >
              Zrušit
            </PixelButton>

            <PixelButton
              disabled={isSubmitting}
              onClick={() => {
                void handleDecision();
              }}
              variant={
                decisionTarget.action === "approve"
                  ? "moss"
                  : "wine"
              }
            >
              {isSubmitting ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={15}
                />
              ) : decisionTarget.action === "approve" ? (
                <Check aria-hidden="true" size={15} />
              ) : (
                <X aria-hidden="true" size={15} />
              )}

              {isSubmitting
                ? "Zpracovávám…"
                : decisionCopy.actionLabel}
            </PixelButton>
          </div>
        </PixelModal>
      ) : null}
    </>
  );
}