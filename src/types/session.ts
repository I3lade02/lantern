import type { Timestamp } from "firebase/firestore";

export const SESSION_STATUSES = [
  "upcoming",
  "active",
  "finished",
  "cancelled",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_RSVP_STATUSES = [
  "going",
  "maybe",
  "notGoing",
] as const;

export type SessionRsvpStatus = (typeof SESSION_RSVP_STATUSES)[number];

export type SessionRsvpSummary = {
  going: number;
  maybe: number;
  notGoing: number;
};

export type Session = {
  id: string;
  title: string;
  description: string;
  startAt: Timestamp | null;
  location: string;
  hostId: string;
  hostName: string;
  status: SessionStatus;
  rsvpSummary: SessionRsvpSummary;
  plannedGameIds: string[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type SessionRsvp = {
  userId: string;
  userName: string;
  status: SessionRsvpStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};