"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseAuth } from "@/firebase/auth";
import type { AuthContextValue, AuthStatus } from "@/types/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
    children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
            setUser(nextUser);
            setStatus(nextUser ? "authenticated" : "unauthenticated");
        });

        return unsubscribe;
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            status,
        }),
        [status, user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth musí být použit uvnitř AuthProvideru");
    }

    return context;
}