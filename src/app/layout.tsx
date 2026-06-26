import type { Metadata } from "next";
import { Geist, Press_Start_2P } from "next/font/google";
import { PixelToast } from "@/components/ui/pixel-toast";
import { AuthProvider } from "@/features/auth/auth-provider";
import "./globals.css";

const geist = Geist ({
  variable: "--font-geist",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: {
    default: "LANtern",
    template: "%s | LANtern",
  },
  description: "Soukromý hub pro deskovky, RPG a společné game nights",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${geist.variable} ${pressStart.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <PixelToast />
        </AuthProvider>
      </body>
    </html>
  );
}