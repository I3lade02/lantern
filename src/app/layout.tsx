import type {
  Metadata,
  Viewport,
} from "next";
import {
  Geist,
  Press_Start_2P,
} from "next/font/google";

import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { PwaLaunchScreen } from "@/components/pwa/pwa-launch-screen";
import { PwaServiceWorker } from "@/components/pwa/pwa-service-worker";
import { PixelToast } from "@/components/ui/pixel-toast";
import { AuthProvider } from "@/features/auth/auth-provider";
import {
  NotificationsProvider,
} from "@/features/notifications/notifications-provider";

import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "LANtern",
    template: "%s | LANtern",
  },

  description:
    "Soukromý pixelový hub pro deskovky, RPG, útraty, dluhy a game nights.",

  applicationName: "LANtern",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LANtern",
  },

  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b1020",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={`${geist.variable} ${pressStart.variable}`}
    >
      <body>
        <AuthProvider>
          <NotificationsProvider>
            <PwaServiceWorker />
            <PwaLaunchScreen />

            {children}

            <PwaInstallButton />
            <PixelToast />
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}