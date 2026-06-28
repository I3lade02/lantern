"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Sparkles,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";
import { toast } from "@/components/ui/pixel-toast";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function PwaInstallButton() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();

      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstallEvent(null);

      toast.success("LANtern byl nainstalován jako aplikace.");
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    try {
      await installEvent.prompt();

      const choice = await installEvent.userChoice;

      if (choice.outcome === "accepted") {
        toast.success("Instalace LANternu byla potvrzena.");
      }

      setInstallEvent(null);
    } catch (error) {
      console.warn("Instalace LANternu se nepodařila otevřít:", error);
    }
  }

  if (!installEvent) {
    return null;
  }

  return (
    <PixelButton
      className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6"
      onClick={handleInstall}
      size="sm"
      variant="moss"
    >
      <Download aria-hidden="true" size={15} />
      <span>Nainstalovat</span>
      <Sparkles aria-hidden="true" size={14} />
    </PixelButton>
  );
}