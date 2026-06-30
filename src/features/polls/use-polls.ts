"use client";

import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    type DocumentData,
    type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestoreDb } from "@/firebase/firestore";
import type { Poll } from "@/types/poll";

type PollsStatus = "loading" | "ready" | "error";

function snapshotToPoll(
    snapshot: QueryDocumentSnapshot<DocumentData>,
): Poll {
    return {
        id: snapshot.id,
        ...snapshot.data(),
    } as Poll;
}

export function usePolls() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [status, setStatus] = useState<PollsStatus>("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const pollsQuery = query(
            collection(firestoreDb, "polls"),
            orderBy("createdAt", "desc"),
        );

        const unsubscribe = onSnapshot(
            pollsQuery,
            (snapshot) => {
                setPolls(snapshot.docs.map(snapshotToPoll));
                setError(null);
                setStatus("ready");
            },
            (snapshotError) => {
                console.error(
                    "Nepodařilo se načíst ankety:",
                    snapshotError,
                );

                setPolls([]);
                setError("Ankety se nepodařilo načíst");
                setStatus("error");
            },
        );

        return unsubscribe;
    }, []);

    return {
        polls,
        isLoading: status === "loading",
        error,
    };
}