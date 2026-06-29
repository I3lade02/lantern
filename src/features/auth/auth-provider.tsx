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
import { subscribeToOwnJoinRequest } from "@/features/auth/join-request-service";
import {
  ensureUserProfile,
  subscribeToUserProfile,
} from "@/features/members/member-service";
import type {
  AccessStatus,
  AuthContextValue,
  AuthStatus,
  ProfileStatus,
} from "@/types/auth";
import type { JoinRequest } from "@/types/join-request";
import type { UserProfile } from "@/types/user";

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(
    null,
  );

  const [joinRequest, setJoinRequest] =
    useState<JoinRequest | null>(null);

  const [status, setStatus] =
    useState<AuthStatus>("loading");

  const [profileStatus, setProfileStatus] =
    useState<ProfileStatus>("idle");

  const [accessStatus, setAccessStatus] =
    useState<AccessStatus>("loading");

  useEffect(() => {
    let isDisposed = false;
    let authVersion = 0;

    let unsubscribeJoinRequest: (() => void) | undefined;
    let unsubscribeProfile: (() => void) | undefined;

    let profileVersion = 0;
    let profileUserId: string | null = null;

    function isCurrentVersion(version: number): boolean {
      return !isDisposed && version === authVersion;
    }

    function stopProfileSubscription() {
      profileVersion += 1;

      unsubscribeProfile?.();
      unsubscribeProfile = undefined;

      profileUserId = null;
    }

    function startApprovedProfileFlow(
      nextUser: User,
      currentAuthVersion: number,
    ) {
      if (profileUserId === nextUser.uid) {
        return;
      }

      stopProfileSubscription();

      const currentProfileVersion = profileVersion;

      profileUserId = nextUser.uid;

      setProfile(null);
      setProfileStatus("loading");
      setAccessStatus("loading");

      void ensureUserProfile(nextUser)
        .then(() => {
          if (
            !isCurrentVersion(currentAuthVersion) ||
            currentProfileVersion !== profileVersion
          ) {
            return;
          }

          unsubscribeProfile = subscribeToUserProfile(
            nextUser.uid,
            (nextProfile) => {
              if (
                !isCurrentVersion(currentAuthVersion) ||
                currentProfileVersion !== profileVersion
              ) {
                return;
              }

              if (!nextProfile) {
                setProfile(null);
                setProfileStatus("error");
                setAccessStatus("denied");
                return;
              }

              setProfile(nextProfile);
              setProfileStatus("ready");
              setAccessStatus("approved");
            },
            (error) => {
              if (
                !isCurrentVersion(currentAuthVersion) ||
                currentProfileVersion !== profileVersion
              ) {
                return;
              }

              console.error(
                "Nepodařilo se načíst profil člena:",
                error,
              );

              setProfile(null);
              setProfileStatus("error");
              setAccessStatus("denied");
            },
          );
        })
        .catch((error: unknown) => {
          if (
            !isCurrentVersion(currentAuthVersion) ||
            currentProfileVersion !== profileVersion
          ) {
            return;
          }

          console.error(
            "Nepodařilo se vytvořit profil člena:",
            error,
          );

          setProfile(null);
          setProfileStatus("error");
          setAccessStatus("denied");
        });
    }

    const unsubscribeAuth = onAuthStateChanged(
      firebaseAuth,
      (nextUser) => {
        authVersion += 1;

        const currentAuthVersion = authVersion;

        unsubscribeJoinRequest?.();
        unsubscribeJoinRequest = undefined;

        stopProfileSubscription();

        setUser(nextUser);
        setProfile(null);
        setJoinRequest(null);

        if (!nextUser) {
          setProfileStatus("idle");
          setAccessStatus("loading");
          setStatus("unauthenticated");
          return;
        }

        setStatus("authenticated");
        setProfileStatus("loading");
        setAccessStatus("loading");

        unsubscribeJoinRequest = subscribeToOwnJoinRequest(
          nextUser.uid,
          (nextJoinRequest) => {
            if (!isCurrentVersion(currentAuthVersion)) {
              return;
            }

            setJoinRequest(nextJoinRequest);

            if (nextJoinRequest?.status === "pending") {
              stopProfileSubscription();

              setProfile(null);
              setProfileStatus("idle");
              setAccessStatus("pending");

              return;
            }

            if (nextJoinRequest?.status === "rejected") {
              stopProfileSubscription();

              setProfile(null);
              setProfileStatus("idle");
              setAccessStatus("denied");

              return;
            }

            startApprovedProfileFlow(
              nextUser,
              currentAuthVersion,
            );
          },
          (error) => {
            if (!isCurrentVersion(currentAuthVersion)) {
              return;
            }

            console.error(
              "Nepodařilo se načíst žádost o připojení:",
              error,
            );

            stopProfileSubscription();

            setJoinRequest(null);
            setProfile(null);
            setProfileStatus("error");
            setAccessStatus("denied");
          },
        );
      },
    );

    return () => {
      isDisposed = true;
      authVersion += 1;

      unsubscribeJoinRequest?.();
      stopProfileSubscription();
      unsubscribeAuth();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      joinRequest,
      status,
      profileStatus,
      accessStatus,
    }),
    [
      accessStatus,
      joinRequest,
      profile,
      profileStatus,
      status,
      user,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth musí být použit uvnitř AuthProvideru.",
    );
  }

  return context;
}