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
import {
  ensureUserProfile,
  subscribeToUserProfile,
} from "@/features/members/member-service";
import type {
  AuthContextValue,
  AuthStatus,
  ProfileStatus,
} from "@/types/auth";
import type { UserProfile } from "@/types/user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [profileStatus, setProfileStatus] =
    useState<ProfileStatus>("idle");

  useEffect(() => {
    let isDisposed = false;
    let authVersion = 0;
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (nextUser) => {
      authVersion += 1;
      const currentVersion = authVersion;

      unsubscribeProfile?.();
      unsubscribeProfile = undefined;

      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setProfileStatus("idle");
        setStatus("unauthenticated");
        return;
      }

      setStatus("authenticated");
      setProfile(null);
      setProfileStatus("loading");

      void ensureUserProfile(nextUser)
        .then(() => {
          if (isDisposed || currentVersion !== authVersion) {
            return;
          }

          unsubscribeProfile = subscribeToUserProfile(
            nextUser.uid,
            (nextProfile) => {
              setProfile(nextProfile);
              setProfileStatus(nextProfile ? "ready" : "error");
            },
            (error) => {
              console.error("Nepodařilo se načíst profil člena:", error);
              setProfile(null);
              setProfileStatus("error");
            },
          );
        })
        .catch((error: unknown) => {
          if (isDisposed || currentVersion !== authVersion) {
            return;
          }

          console.error("Nepodařilo se vytvořit profil člena:", error);
          setProfile(null);
          setProfileStatus("error");
        });
    });

    return () => {
      isDisposed = true;
      authVersion += 1;
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      status,
      profileStatus,
    }),
    [profile, profileStatus, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth musí být použit uvnitř AuthProvideru.");
  }

  return context;
}