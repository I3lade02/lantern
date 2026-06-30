import type { Poll, PollType } from "@/types/poll";

export function isPollExpired(poll: Poll): boolean {
    const closesAtMillis = poll.closesAt?.toMillis();

    return (
        typeof closesAtMillis === "number" &&
        closesAtMillis <= Date.now()
    );
}

export function isPollLocked(poll: Poll): boolean {
    return poll.status === "close" || isPollExpired(poll);
}

export function getPollTypeLabel(type: PollType): string {
    switch (type) {
        case "yes_no":
            return "ANO / NE";
        
        case "single_choice":
            return "Jedna volba";
        
        case "multiple_choice":
            return "Více voleb";

    }
}

export function getPollStatusLabel(poll: Poll): string {
    if (poll.status === "close") {
        return "UZAVŘENO";
    }

    if (isPollExpired(poll)) {
        return "ČAS VYPRŠEL";
    }

    return "AKTIVNÍ";
}

export function getPollPercentage(
    optionVoteCount: number,
    voterCount: number,
): number {
    if (voterCount <= 0) {
        return 0;
    }

    return Math.round((optionVoteCount / voterCount) * 100);
}

export function formatPollDate(
    timestamp: Poll["createdAt"] | Poll["closedAt"] | Poll["closesAt"],
): string {
    if (!timestamp) {
        return "-";
    }

    return new Intl.DateTimeFormat("cs-CZ", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(timestamp.toDate());
}

export function getPollVoterLabel(voteCount: number): string {
    if (voteCount === 1) {
        return "1 Člověk hlasoval";
    }

    if (voteCount >= 2 && voteCount <= 4) {
        return `${voteCount} lidé hlasovali`;
    }

    return `${voteCount} lidí hlasovalo`;
}