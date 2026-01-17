
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
    isoDate: '2026-11-11T19:00:00',
    attireImage: 'https://img.freepik.com/premium-vector/fashion-illustration-wedding-dress-vector-line-drawing_551806-38.jpg',
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
    isoDate: '2026-11-13T16:00:00',
    attireImage: 'https://img.freepik.com/premium-vector/india-women-traditional-clothing-doodle-style_146816-166.jpg',
    imagePlaceholder: 'https://picsum.photos/seed/wedding2/800/600',
  },
  darees: {
    id: 'darees',
    title: 'Darees (Religious Gathering)',
    date: 'Saturday, Nov 14, 2026',
    time: '10:00 AM',
    venue: 'Al Saadah Hall',
    location: 'Bhendi Bazaar, Mumbai',
    theme: 'Strictly Bohra Attire',
    isoDate: '2026-11-14T10:00:00',
    attireImage: 'https://i.pinimg.com/736x/21/2a/54/212a543666d3a95c02bf14731a54508e.jpg',
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
    isoDate: '2026-11-15T19:00:00',
    attireImage: 'https://img.freepik.com/premium-vector/india-women-traditional-clothing-doodle-style_146816-166.jpg',
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
