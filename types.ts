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
}

export interface GuestProfile {
  name: string;
  allowedEvents: string[]; // Array of Event IDs
  maxGuests: number;
}

export type EventDictionary = Record<string, WeddingEvent>;
export type GuestDictionary = Record<string, GuestProfile>;