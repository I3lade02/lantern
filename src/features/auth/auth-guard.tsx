"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "./auth-provider";

type AuthGuardProps = {
    children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const { status } = useAuth();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [router, status]);

    if (status !== "authenticated") {
        return <LoadingState label="Kontroluji vstup do herny..." />;
    }

    return <>{children}</>
}