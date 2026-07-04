"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Camera,
  CameraOff,
  LoaderCircle,
  RefreshCw,
  ScanLine,
} from "lucide-react";

import { PixelButton } from "@/components/ui/pixel-button";

type ScannerState =
  | "idle"
  | "starting"
  | "scanning"
  | "error";

type BarQrCameraScannerProps = {
  onDetected: (rawValue: string) => boolean;
};

function getCameraErrorMessage(error: unknown): string {
  if (!(error instanceof DOMException)) {
    return "Kameru se nepodařilo spustit.";
  }

  switch (error.name) {
    case "NotAllowedError":
      return "Přístup ke kameře byl zamítnut. Povol LANternu kameru v nastavení prohlížeče.";

    case "NotFoundError":
      return "V tomto zařízení nebyla nalezena žádná dostupná kamera.";

    case "NotReadableError":
      return "Kamera je právě používána jinou aplikací nebo prohlížečem.";

    case "OverconstrainedError":
      return "Nepodařilo se vybrat vhodnou kameru.";

    default:
      return "Kameru se nepodařilo spustit.";
  }
}

export function BarQrCameraScanner({
  onDetected,
}: BarQrCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(
    null,
  );

  const stopScannerRef = useRef<(() => void) | null>(
    null,
  );

  const isMountedRef = useRef(true);

  const hasResolvedQrRef = useRef(false);

  const invalidScanCooldownRef = useRef(0);

  const [state, setState] =
    useState<ScannerState>("idle");

  const [error, setError] = useState<string | null>(
    null,
  );

  const [scanNotice, setScanNotice] =
    useState<string | null>(null);

  function stopScanner() {
    stopScannerRef.current?.();
    stopScannerRef.current = null;

    const video = videoRef.current;

    if (video?.srcObject instanceof MediaStream) {
      video.srcObject
        .getTracks()
        .forEach((track) => track.stop());

      video.srcObject = null;
    }
  }

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, []);

  async function startScanner() {
    if (
      state === "starting" ||
      state === "scanning" ||
      !videoRef.current
    ) {
      return;
    }

    if (
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setState("error");

      setError(
        "Kamera vyžaduje HTTPS nebo localhost. Otevři LANtern přes zabezpečenou adresu.",
      );

      return;
    }

    hasResolvedQrRef.current = false;
    setError(null);
    setScanNotice(null);
    setState("starting");

    try {
      const { BrowserQRCodeReader } = await import(
        "@zxing/browser"
      );

      if (!isMountedRef.current || !videoRef.current) {
        return;
      }

      const codeReader = new BrowserQRCodeReader();

      const controls =
        await codeReader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
          },
          videoRef.current,
          (result) => {
            if (!result || hasResolvedQrRef.current) {
              return;
            }

            const rawValue = result.getText();

            const wasAccepted = onDetected(rawValue);

            if (wasAccepted) {
              hasResolvedQrRef.current = true;
              stopScanner();

              return;
            }

            const now = Date.now();

            if (
              now - invalidScanCooldownRef.current >
              2_000
            ) {
              invalidScanCooldownRef.current = now;

              setScanNotice(
                "Tohle není LANtern QR štítek nápoje. Zkus jiný kód.",
              );
            }
          },
        );

      if (!isMountedRef.current) {
        controls.stop();
        return;
      }

      stopScannerRef.current = () => {
        controls.stop();
      };

      setState("scanning");
    } catch (scannerError) {
      if (!isMountedRef.current) {
        return;
      }

      setState("error");
      setError(getCameraErrorMessage(scannerError));
    }
  }

  function resetScanner() {
    stopScanner();
    setState("idle");
    setError(null);
    setScanNotice(null);
    hasResolvedQrRef.current = false;
  }

  return (
    <div className="overflow-hidden border-2 border-outline bg-panel-deep shadow-pixel-sm">
      <div className="relative aspect-3/4 max-h-136 bg-void sm:aspect-video">
        <video
          autoPlay
          className="size-full object-cover"
          muted
          playsInline
          ref={videoRef}
        />

        {state === "idle" ? (
          <div className="absolute inset-0 grid place-items-center bg-void/90 p-6 text-center">
            <div>
              <div className="mx-auto grid size-16 place-items-center border-2 border-outline bg-panel text-amber-light shadow-pixel-sm">
                <Camera aria-hidden="true" size={28} />
              </div>

              <p className="mt-5 font-pixel text-[10px] text-cream">
                KAMERA JE PŘIPRAVENÁ
              </p>

              <p className="mt-3 max-w-sm text-sm leading-6 text-cream-muted">
                Otevři kameru a namiř ji na QR štítek
                vedle nápoje.
              </p>

              <PixelButton
                className="mt-6"
                onClick={() => {
                  void startScanner();
                }}
                variant="moss"
              >
                <ScanLine aria-hidden="true" size={17} />
                Spustit skenování
              </PixelButton>
            </div>
          </div>
        ) : null}

        {state === "starting" ? (
          <div className="absolute inset-0 grid place-items-center bg-void/80 p-6 text-center">
            <div>
              <LoaderCircle
                aria-hidden="true"
                className="mx-auto animate-spin text-amber-light"
                size={30}
              />

              <p className="mt-5 font-pixel text-[10px] text-cream">
                OTEVÍRÁM KAMERU
              </p>

              <p className="mt-3 text-sm text-cream-muted">
                Čekám na povolení přístupu.
              </p>
            </div>
          </div>
        ) : null}

        {state === "scanning" ? (
          <>
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[78%] -translate-x-1/2 -translate-y-1/2 border-2 border-amber shadow-[0_0_0_9999px_rgb(0_0_0/0.42)]">
              <span className="absolute -left-1 -top-1 size-4 border-l-4 border-t-4 border-cream" />
              <span className="absolute -right-1 -top-1 size-4 border-r-4 border-t-4 border-cream" />
              <span className="absolute -bottom-1 -left-1 size-4 border-b-4 border-l-4 border-cream" />
              <span className="absolute -bottom-1 -right-1 size-4 border-b-4 border-r-4 border-cream" />

              <span className="absolute left-0 right-0 top-1/2 h-0.5 animate-pulse bg-amber-light shadow-[0_0_12px_rgb(255_210_100)]" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-void/80 px-5 py-4 text-center backdrop-blur-sm">
              <p className="font-pixel text-[8px] text-cream">
                HLEDÁM QR ŠTÍTEK…
              </p>

              <p className="mt-2 text-xs leading-5 text-cream-muted">
                Drž kód uvnitř rámečku a chvíli vydrž.
              </p>
            </div>
          </>
        ) : null}

        {state === "error" ? (
          <div className="absolute inset-0 grid place-items-center bg-void/90 p-6 text-center">
            <div>
              <div className="mx-auto grid size-16 place-items-center border-2 border-wine bg-wine-dark text-wine-light shadow-pixel-sm">
                <CameraOff aria-hidden="true" size={28} />
              </div>

              <p className="mt-5 font-pixel text-[10px] text-wine-light">
                KAMERA NENÍ K DISPOZICI
              </p>

              <p className="mt-3 max-w-md text-sm leading-6 text-cream-muted">
                {error}
              </p>

              <PixelButton
                className="mt-6"
                onClick={resetScanner}
                variant="ghost"
              >
                <RefreshCw aria-hidden="true" size={16} />
                Zkusit znovu
              </PixelButton>
            </div>
          </div>
        ) : null}
      </div>

      {scanNotice ? (
        <p
          aria-live="polite"
          className="border-t-2 border-outline bg-wine-dark px-4 py-3 text-center text-sm leading-6 text-cream"
        >
          {scanNotice}
        </p>
      ) : null}

      {state === "scanning" ? (
        <div className="flex justify-center border-t-2 border-outline bg-panel px-4 py-3">
          <button
            className="font-pixel text-[8px] text-cream-muted transition hover:text-wine-light"
            onClick={resetScanner}
            type="button"
          >
            Zastavit kameru
          </button>
        </div>
      ) : null}
    </div>
  );
}