import { EventDictionary, GuestDictionary, WeddingEvent } from './types';

// --- Configuration ---
export const COLORS = {
  lavender: '#E6E6FA',
  blush: '#F3E5F5',
  gold: '#D4AF37',
  ink: '#4A3B4E',
  paper: '#FFFDF5',
};

// --- Events Data ---
export const EVENTS: EventDictionary = {
  reception_bride: {
    id: 'reception_bride',
    title: 'Bride Main Reception',
    date: 'Wednesday, Nov 11, 2026',
    time: '7:00 PM',
    venue: 'Country Club Hall',
    location: 'Undri, Pune',
    theme: 'Western Elegance',
    imagePlaceholder: 'https://picsum.photos/seed/wedding1/800/600',
  },
  mehendi: {
    id: 'mehendi',
    title: 'Mehendi & Sangeet',
    date: 'Friday, Nov 13, 2026',
    time: '4:00 PM (Mehendi) / 7:00 PM (Sangeet)',
    venue: 'Sanskruti Banquet',
    location: 'Malabar Hill, Mumbai',
    theme: 'Traditional Vibrance',
    imagePlaceholder: 'https://picsum.photos/seed/wedding2/800/600',
  },
  darees: {
    id: 'darees',
    title: 'Darees (Religious Gathering)',
    date: 'Saturday, Nov 14, 2026',
    time: 'Morning',
    venue: 'Al Saadah Hall',
    location: 'Bhendi Bazaar, Mumbai',
    theme: 'Strictly Bohra Attire',
    imagePlaceholder: 'https://picsum.photos/seed/wedding3/800/600',
  },
  walima: {
    id: 'walima',
    title: 'Groom Reception (Walima)',
    date: 'Sunday, Nov 15, 2026',
    time: '7:00 PM',
    venue: 'Najam Baug',
    location: 'Dongri, Mumbai',
    theme: 'Traditional',
    imagePlaceholder: 'https://picsum.photos/seed/wedding4/800/600',
  },
};

// --- Mock Guest Database ---
// In a real app, this would be fetched from Google Sheets based on the ?code= param
export const GUEST_DATABASE: GuestDictionary = {
  'FAMILY_ZARIWALA': {
    name: 'Zariwala Family',
    allowedEvents: ['reception_bride', 'mehendi', 'darees', 'walima'], // All Access
    maxGuests: 4,
  },
  'FRIEND_JOHN': {
    name: 'John Doe & Partner',
    allowedEvents: ['reception_bride'], // Only Pune event
    maxGuests: 2,
  },
  'DEFAULT': {
    name: 'Honored Guest',
    allowedEvents: ['reception_bride', 'mehendi', 'darees', 'walima'],
    maxGuests: 2,
  }
};