import { BarScanPageContent } from "@/features/bar/bar-scan-page-content";

type BarScanPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const metadata = {
  title: "Taverní bar",
};

export default async function BarScanPage({
  params,
}: BarScanPageProps) {
  const { token } = await params;

  return <BarScanPageContent qrToken={token} />;
}