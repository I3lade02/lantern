"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { PollVote } from "@/types/poll";

type OwnPollVotes = Record<string, PollVote | null>;

type OwnPollVotesState = {
  scopeKey: string;
  votes: OwnPollVotes;
};

const EMPTY_OWN_POLL_VOTES: OwnPollVotes = {};

export function useOwnPollVotes(
  userId: string | null,
  pollIds: string[],
): OwnPollVotes {
  const [state, setState] = useState<OwnPollVotesState>({
    scopeKey: "",
    votes: {},
  });

  const pollIdsKey = useMemo(
    () => [...new Set(pollIds)].sort().join("|"),
    [pollIds],
  );

  const scopeKey = userId && pollIdsKey ? `${userId}:${pollIdsKey}` : "";

  useEffect(() => {
    if (!userId || !pollIdsKey) {
      return;
    }

    const uniquePollIds = pollIdsKey.split("|");
    let isActive = true;

    const unsubscribers = uniquePollIds.map((pollId) =>
      onSnapshot(
        doc(firestoreDb, "polls", pollId, "votes", userId),
        (snapshot) => {
          if (!isActive) {
            return;
          }

          const vote = snapshot.exists()
            ? ({
                userId: snapshot.id,
                ...snapshot.data(),
              } as PollVote)
            : null;

          setState((currentState) => {
            const currentVotes =
              currentState.scopeKey === scopeKey
                ? currentState.votes
                : {};

            return {
              scopeKey,
              votes: {
                ...currentVotes,
                [pollId]: vote,
              },
            };
          });
        },
        (snapshotError) => {
          console.error(
            `Nepodařilo se načíst vlastní hlas pro anketu ${pollId}:`,
            snapshotError,
          );
        },
      ),
    );

    return () => {
      isActive = false;

      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, [pollIdsKey, scopeKey, userId]);

  if (!scopeKey || state.scopeKey !== scopeKey) {
    return EMPTY_OWN_POLL_VOTES;
  }

  return state.votes;
}