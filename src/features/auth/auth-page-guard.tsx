"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "./auth-provider";

type AuthPageGuardProps = {
    children: React.ReactNode;
};

export function AuthPageGuard({ children }: AuthPageGuardProps) {
    const router = useRouter();
    const { status } = useAuth();

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/dashboard");
        }
    }, [router, status]);

    if (status === "loading" || status === "authenticated") {
        return <LoadingState label="Rozsvěcím lucernu..." />;
    }

    return <>{children}</>;
}