import React, { useState, useEffect } from 'react';
import { ScrollEnvelope } from './components/ScrollEnvelope';
import { GUEST_DATABASE, EVENTS } from './constants';
import { GuestProfile, WeddingEvent } from './types';

// Helper to get params
const getCodeFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

const App: React.FC = () => {
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [guestEvents, setGuestEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = getCodeFromUrl();
    const profile = GUEST_DATABASE[code || ''] || GUEST_DATABASE['DEFAULT'];
    
    setGuest(profile);
    const allowed = profile.allowedEvents.map(eventId => EVENTS[eventId]).filter(Boolean);
    setGuestEvents(allowed);
    
    setLoading(false);
  }, []);

  // Enable native scroll for the body, but hide horizontal overflow
  useEffect(() => {
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
  }, []);

  if (loading || !guest) return <div className="h-screen w-full" style={{ background: 'var(--bg-color)' }}></div>;

  return (
    <main className="w-full">
      <ScrollEnvelope guest={guest} events={guestEvents} />
    </main>
  );
};

export default App;