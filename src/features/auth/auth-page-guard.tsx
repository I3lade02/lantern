"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/features/auth/auth-provider";

type AuthPageGuardProps = {
  children: React.ReactNode;
};

export function AuthPageGuard({
  children,
}: AuthPageGuardProps) {
  const router = useRouter();

  const {
    accessStatus,
    status,
  } = useAuth();

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    if (accessStatus === "approved") {
      router.replace("/dashboard");
      return;
    }

    if (
      accessStatus === "pending" ||
      accessStatus === "denied"
    ) {
      router.replace("/cekani-na-schvaleni");
    }
  }, [accessStatus, router, status]);

  if (
    status === "loading" ||
    status === "authenticated"
  ) {
    return <LoadingState label="Rozsvěcím lucernu…" />;
  }

  return <>{children}</>;
}