import type { Timestamp } from "firebase/firestore";

export const GAME_CATEGORIES = [
    "boardgame",
    "cardgame",
    "rpg",
    "party",
    "miniatures",
    "other",
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number];

export const GAME_CATEGORY_LABELS: Record<GameCategory, string> = {
    boardgame: "Deskovka",
    cardgame: "Karetní hra",
    rpg: "RPG",
    party: "Párty hra",
    miniatures: "Miniatury",
    other: "Ostatní",
};

export const GAME_OWNERSHIP_TYPES = [
    "party",
    "member",
    "borrowed",
] as const;

export type GameOwnership = (typeof GAME_OWNERSHIP_TYPES)[number];

export const GAME_OWNERSHIP_LABELS: Record<GameOwnership, string> = {
    party: "Parta",
    member: "Člen party",
    borrowed: "Zapůjčená"
};

export type Game = {
    id: string;

    title: string;
    category: GameCategory;

    minPlayers: number;
    maxPlayers: number;
    playTimeMinutes: number;
    complexity: number;

    ownership: GameOwnership;
    ownerName: string;

    notes: string;
    isAvailable: boolean;

    addedById: string;
    addedByName: string;

    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
};