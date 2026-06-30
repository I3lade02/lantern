import { Timestamp } from "firebase/firestore";

export const POLL_TYPES = [
    "yes_no",
    "single_choice",
    "multiple_choice",
] as const;

export type PollType = (typeof POLL_TYPES)[number];

export const POLL_STATUSES = [
    "open",
    "close",
] as const;

export type PollStatus = (typeof POLL_STATUSES)[number];

export type PollOption = {
    id: string;
    label: string;
    voteCount: number;
};

export type Poll = {
    id: string;

    question: string;
    description: string;

    type: PollType;
    status: PollStatus;

    options: PollOption[];
    voteCount: number;

    sessionId: string | null;

    createdById: string;
    createdByName: string;

    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;

    closesAt: Timestamp | null;
    closedAt: Timestamp | null;
};

export type PollVote = {
    userId: string;
    selectedOptionIds: string[];

    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
};