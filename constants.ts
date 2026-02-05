import { EventDictionary, GuestDictionary, WeddingEvent } from './types';

// --- Configuration ---
export const COLORS = {
  lavender: '#E3D4E6',
  blush: '#E3D4E6', // Replaced blush with theme lavender for consistency
  gold: '#C5A059',
  ink: '#4A404F',
  paper: '#FFFCF7',
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
    // Elegant Dress Fabric/Detail
    attireImage: 'https://images.unsplash.com/photo-1596839632868-e69c36293f04?q=80&w=1000&auto=format&fit=crop',
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
    // Vibrant Indian Fabric/Henna
    attireImage: 'https://images.unsplash.com/photo-1583391724648-2d881a70014b?q=80&w=1000&auto=format&fit=crop',
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
    // Modest/Archtectural detail abstract
    attireImage: 'https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?q=80&w=1000&auto=format&fit=crop',
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
    // Rich fabric or flowers
    attireImage: 'https://images.unsplash.com/photo-1610173827002-62c0f1f07d3b?q=80&w=1000&auto=format&fit=crop',
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