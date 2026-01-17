
export interface WeddingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  theme: string;
  mapLink?: string;
  imagePlaceholder: string;
  isoDate: string; // ISO 8601 string (e.g., "2026-11-11T19:00:00")
  attireImage: string; // URL for the sketch
}

export interface GuestProfile {
  name: string;
  allowedEvents: string[]; // Array of Event IDs
  maxGuests: number;
}

export type EventDictionary = Record<string, WeddingEvent>;
export type GuestDictionary = Record<string, GuestProfile>;
