"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock3,
  LogOut,
  MailCheck,
  Send,
  ShieldCheck,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { toast } from "@/components/ui/pixel-toast";
import {
  resendVerificationEmail,
  signOutUser,
} from "@/features/auth/auth-service";
import { useAuth } from "@/features/auth/auth-provider";

export function PendingApprovalScreen() {
  const router = useRouter();

  const {
    accessStatus,
    joinRequest,
    status,
    user,
  } = useAuth();

  const [isSendingEmail, setIsSendingEmail] =
    useState(false);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (
      status === "authenticated" &&
      accessStatus === "approved"
    ) {
      router.replace("/dashboard");
    }
  }, [accessStatus, router, status]);

  async function handleResendVerification() {
    setIsSendingEmail(true);

    try {
      await resendVerificationEmail();

      toast.success(
        "Ověřovací e-mail byl odeslán znovu.",
      );
    } catch (error) {
      console.error(
        "Nepodařilo se odeslat ověřovací e-mail:",
        error,
      );

      toast.error(
        "Ověřovací e-mail se nepodařilo odeslat.",
      );
    } finally {
      setIsSendingEmail(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOutUser();
    } catch (error) {
      console.error("Nepodařilo se odhlásit:", error);

      toast.error("Odhlášení se nepodařilo.");
      setIsSigningOut(false);
    }
  }

  if (
    status === "loading" ||
    status === "unauthenticated" ||
    accessStatus === "loading"
  ) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-10">
        <p className="font-pixel text-[10px] text-cream-muted">
          KONTROLUJI ŽÁDOST…
        </p>
      </main>
    );
  }

  if (
    status === "authenticated" &&
    accessStatus === "approved"
  ) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-10">
        <p className="font-pixel text-[10px] text-moss-light">
          VSTUP SCHVÁLEN, OTEVÍRÁM LANTERN…
        </p>
      </main>
    );
  }

  if (
    status === "authenticated" &&
    accessStatus === "pending"
  ) {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-5 py-10">
        <PixelPanel
          className="pixel-grid w-full text-center"
          padding="lg"
          tone="deep"
        >
          <div className="mx-auto grid size-16 place-items-center border-4 border-outline bg-amber text-void shadow-pixel">
            <Clock3 aria-hidden="true" size={29} />
          </div>

          <p className="mt-7 font-pixel text-[10px] leading-6 text-amber-light">
            JOIN REQUEST PENDING
          </p>

          <h1 className="mt-4 font-pixel text-base leading-9 text-cream">
            Čekáš na schválení
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-cream-muted">
            Žádost pro{" "}
            <span className="font-semibold text-cream">
              {joinRequest?.displayName ?? "nového člena"}
            </span>{" "}
            byla odeslána správci LANternu.
          </p>

          <div className="mt-6 border-2 border-outline bg-panel p-4 text-left shadow-pixel-sm">
            <div className="flex gap-3">
              <MailCheck
                aria-hidden="true"
                className="shrink-0 text-moss-light"
                size={20}
              />

              <div>
                <p className="font-pixel text-[9px] leading-5 text-cream">
                  Ověř svůj e-mail
                </p>

                <p className="mt-2 text-sm leading-6 text-cream-muted">
                  Před schválením klikni na ověřovací odkaz poslaný na:
                </p>

                <p className="mt-2 text-sm font-semibold text-cream">
                  {user?.email ?? joinRequest?.email}
                </p>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-cream-muted">
            Až admin žádost přijme, LANtern tě automaticky pustí dál.
            Účet není potřeba zakládat znovu.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PixelButton
              disabled={isSendingEmail}
              onClick={() => {
                void handleResendVerification();
              }}
              variant="moss"
            >
              <Send aria-hidden="true" size={16} />
              {isSendingEmail
                ? "Odesílám…"
                : "Poslat e-mail znovu"}
            </PixelButton>

            <PixelButton
              disabled={isSigningOut}
              onClick={() => {
                void handleSignOut();
              }}
              variant="ghost"
            >
              <LogOut aria-hidden="true" size={16} />
              {isSigningOut
                ? "Odhlašuji…"
                : "Odhlásit se"}
            </PixelButton>
          </div>
        </PixelPanel>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-5 py-10">
      <PixelPanel
        className="w-full text-center"
        padding="lg"
        tone="deep"
      >
        <div className="mx-auto grid size-16 place-items-center border-4 border-outline bg-wine text-cream shadow-pixel">
          <ShieldCheck aria-hidden="true" size={29} />
        </div>

        <p className="mt-7 font-pixel text-[10px] leading-6 text-wine-light">
          REQUEST UNAVAILABLE
        </p>

        <h1 className="mt-4 font-pixel text-base leading-9 text-cream">
          Žádost není aktivní
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-cream-muted">
          Tento účet nemá aktivní žádost o připojení, případně byla žádost
          odmítnuta.
        </p>

        <PixelButton
          className="mt-8"
          disabled={isSigningOut}
          onClick={() => {
            void handleSignOut();
          }}
          variant="moss"
        >
          <LogOut aria-hidden="true" size={16} />
          Odhlásit se
        </PixelButton>
      </PixelPanel>
    </main>
  );
}