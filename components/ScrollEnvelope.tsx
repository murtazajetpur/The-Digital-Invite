
import React, { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GuestProfile, WeddingEvent } from '../types';
import { RsvpModal } from './RsvpModal';
import { Countdown } from './Countdown';

gsap.registerPlugin(ScrollTrigger);

interface ScrollEnvelopeProps {
  guest: GuestProfile;
  events: WeddingEvent[];
}

export const ScrollEnvelope: React.FC<ScrollEnvelopeProps> = ({ guest, events }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedWrapperRef = useRef<HTMLDivElement>(null);
  
  // State for Modal
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  // State for which calendar menu is open (by event ID)
  const [activeCalendarMenu, setActiveCalendarMenu] = useState<string | null>(null);
  
  // Layers references
  const cardRef = useRef<HTMLDivElement>(null);   // Z-20
  const pocketRef = useRef<HTMLDivElement>(null); // Z-30
  const flapRef = useRef<HTMLDivElement>(null);   // Z-40
  const waxRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);

  // --- CALENDAR LOGIC ---
  const handleGoogleCalendar = (e: React.MouseEvent, event: WeddingEvent) => {
    e.stopPropagation();
    const startDate = new Date(event.isoDate);
    const endDate = new Date(startDate.getTime() + (4 * 60 * 60 * 1000)); // Assume 4 hours duration

    const format = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${format(startDate)}/${format(endDate)}&details=${encodeURIComponent("Wedding Celebration of Lubna & Murtaza")}&location=${encodeURIComponent(event.venue + ", " + event.location)}`;
    
    window.open(url, '_blank');
    setActiveCalendarMenu(null);
  };

  const handleIcsDownload = (e: React.MouseEvent, event: WeddingEvent) => {
    e.stopPropagation();
    const startDate = new Date(event.isoDate);
    const endDate = new Date(startDate.getTime() + (4 * 60 * 60 * 1000));
    
    const format = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const now = format(new Date());

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LubnaMurtaza//Wedding//EN
BEGIN:VEVENT
UID:${event.id}@lubnamurtaza.com
DTSTAMP:${now}
DTSTART:${format(startDate)}
DTEND:${format(endDate)}
SUMMARY:${event.title}
DESCRIPTION:Wedding Celebration of Lubna & Murtaza
LOCATION:${event.venue}, ${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveCalendarMenu(null);
  };

  // --- MAP LOGIC ---
  const openNativeMap = (venue: string, location: string) => {
    const query = encodeURIComponent(`${venue}, ${location}`);
    // Universal link works for iOS (Apple Maps) and Android (Google Maps) usually
    // On Desktop it goes to Google Maps web
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };


  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom", 
          scrub: 1.5, 
          pin: pinnedWrapperRef.current,
        }
      });

      // --- INITIAL STATE SETUP ---
      gsap.set(flapRef.current, { rotateX: 0 }); 

      // --- STEP 1: UNLOCKING (0% -> 20%) ---
      // 0. Hide Instructions immediately
      tl.to(scrollTextRef.current, { opacity: 0, duration: 0.2 }, 0);

      // 1. Wax Seal Pop & Fade
      tl.to(waxRef.current, { 
        scale: 1.5, 
        opacity: 0, 
        duration: 0.2,
        ease: "power2.in"
      }, 0);
      
      // 2. Flap Opens
      tl.to(flapRef.current, { 
        rotateX: 180, 
        duration: 1.5, 
        ease: "power2.inOut" 
      }, 0.1);
      
      // Lighting
      tl.to(flapRef.current, { filter: "brightness(0.9)" }, 0.1);


      // --- STEP 2: THE REVEAL (20% -> 40%) ---
      const revealStart = 1.6;

      // Move Envelope Layers DOWN
      tl.to([pocketRef.current, flapRef.current], {
        y: "120%", 
        opacity: 0,
        duration: 2.5,
        ease: "power2.in"
      }, revealStart);

      // Move Card UP
      tl.to(cardRef.current, {
        y: "-15vh", 
        duration: 2.5,
        ease: "power2.in"
      }, revealStart);


      // --- STEP 3: READING (40% -> 100%) ---
      const getScrollDistance = () => {
         if (!cardRef.current) return -window.innerHeight * 2.5; // Fallback
         const cardHeight = cardRef.current.offsetHeight;
         const windowHeight = window.innerHeight;
         // Scroll enough to see the bottom of the card with padding
         return windowHeight - cardHeight - 100; 
      };

      tl.to(cardRef.current, {
        y: getScrollDistance, 
        duration: 8, 
        ease: "none"
      }, ">"); 

    }, containerRef);

    return () => ctx.revert();
  }, [events]);

  return (
    <>
    {/* 1. SCROLL TRACK */}
    <div ref={containerRef} className="relative w-full h-[500vh]" style={{ background: 'var(--bg-color)' }}>
      
      {/* 2. PINNED VIEWPORT */}
      <div 
        ref={pinnedWrapperRef} 
        className="h-screen w-full flex flex-col items-center justify-center overflow-hidden perspective-1000"
        style={{ background: 'radial-gradient(circle at center, #F3E5F5 0%, #E1BEE7 100%)' }}
      >
        
        {/* Helper Text */}
        <div 
          ref={scrollTextRef}
          className="absolute top-[10%] left-0 right-0 text-center text-primary font-display text-xs tracking-[0.3em] animate-pulse z-50 pointer-events-none"
        >
          Scroll to Open
        </div>

        {/* 
            FULL SCREEN ENVELOPE ASSEMBLY
        */}
        <div className="relative w-full h-full transform-style-3d">
          
          {/* 
              LAYER 1: BACKGROUND FILL (Behind card) 
          */}
          <div className="absolute inset-0 z-0 bg-paper"></div>

          {/* 
              LAYER 2: THE CARD (Content) - Z-20 
          */}
          <div 
            ref={cardRef}
            className="absolute left-0 right-0 mx-auto w-full md:w-[700px] z-20 flex flex-col items-center text-center bg-paper shadow-2xl"
            style={{ 
              top: '0', 
              minHeight: '100vh', 
              paddingTop: '35vh', 
              paddingBottom: '20vh',
            }}
          >
             {/* Gold Dust Texture Overlay */}
             <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-0" 
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%23D4AF37'/%3E%3C/svg%3E")` }}>
             </div>

            {/* Double Gold Border */}
            <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-double border-gold pointer-events-none z-10"></div>

            {/* CARD CONTENT */}
            <div className="relative z-20 w-full max-w-lg mx-auto space-y-16 px-6 text-primary">
               {/* HEADER */}
               <div>
                  <h1 className="font-script text-6xl md:text-8xl text-header mb-4 drop-shadow-sm">Lubna Zariwala</h1>
                  <span className="font-display text-2xl text-gold">&</span>
                  <h1 className="font-script text-6xl md:text-8xl text-header mt-4 drop-shadow-sm">Murtaza Jetpurwala</h1>
                  
                  <div className="flex items-center justify-center gap-4 my-8 opacity-60">
                    <div className="h-[1px] w-16 bg-gold"></div>
                    <div className="text-gold text-sm">♦</div>
                    <div className="h-[1px] w-16 bg-gold"></div>
                  </div>
                  <p className="font-display text-sm tracking-[0.4em] text-primary uppercase">Request the honor of your presence</p>
               </div>

               {/* EVENTS */}
               {events.map((event, i) => (
                <div key={event.id} className="w-full relative pb-12 border-b border-gold/20 last:border-0 last:pb-0">
                  
                  {/* Title & Date */}
                  <h3 className="font-display text-3xl md:text-4xl text-gold mb-2 uppercase tracking-wide">{event.title}</h3>
                  <p className="font-serif-body text-xl text-primary italic mb-6">{event.date} • {event.time}</p>

                  {/* Main Grid Layout for Location & Attire */}
                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between text-left mt-6">
                      
                      {/* LEFT: Location Card */}
                      <div className="w-full md:w-1/2">
                          <p className="font-display text-[10px] uppercase tracking-widest text-primary/50 mb-2">Venue</p>
                          <div 
                             onClick={() => openNativeMap(event.venue, event.location)}
                             className="group cursor-pointer border border-gold/30 bg-white/50 p-4 rounded-sm flex items-center gap-4 hover:border-gold hover:bg-white transition-all duration-300 hover:shadow-lg"
                          >
                             <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                             </div>
                             <div>
                                <h5 className="font-serif font-bold text-primary text-sm">{event.venue}</h5>
                                <p className="font-sans text-xs text-primary/70">{event.location}</p>
                                <span className="text-[10px] text-gold uppercase tracking-widest mt-1 block opacity-0 group-hover:opacity-100 transition-opacity">Open Map &rarr;</span>
                             </div>
                          </div>
                      </div>

                      {/* RIGHT: Dress Code Lookbook */}
                      <div className="w-full md:w-1/2 flex gap-4">
                          <div className="flex-1">
                              <p className="font-display text-[10px] uppercase tracking-widest text-primary/50 mb-2">Dress Code</p>
                              <p className="font-serif text-lg text-gold italic border-b border-gold/20 inline-block pb-1">{event.theme}</p>
                          </div>
                          <div className="w-20 h-24 border border-gold/10 bg-white/30 p-1 flex items-center justify-center overflow-hidden shrink-0">
                               <img 
                                  src={event.attireImage} 
                                  alt="Attire Sketch" 
                                  className="w-full h-full object-contain mix-blend-multiply opacity-80"
                                  style={{ filter: 'sepia(1) hue-rotate(320deg) contrast(1.2)' }}
                               />
                          </div>
                      </div>
                  </div>

                  {/* Add to Calendar Button (Floating or inline) */}
                  <div className="mt-8 relative inline-block text-left">
                     <button 
                        onClick={() => setActiveCalendarMenu(activeCalendarMenu === event.id ? null : event.id)}
                        className="text-[10px] font-display uppercase tracking-[0.2em] text-primary hover:text-gold transition-colors flex items-center gap-2 mx-auto"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Save The Date
                     </button>
                     
                     {/* Calendar Dropdown */}
                     {activeCalendarMenu === event.id && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-gold shadow-xl z-50 flex flex-col py-1 animate-fade-in">
                           <button 
                              onClick={(e) => handleGoogleCalendar(e, event)}
                              className="px-4 py-3 text-left hover:bg-gold/10 text-xs font-display uppercase tracking-wider text-primary flex items-center gap-2"
                           >
                              Google Calendar
                           </button>
                           <button 
                              onClick={(e) => handleIcsDownload(e, event)}
                              className="px-4 py-3 text-left hover:bg-gold/10 text-xs font-display uppercase tracking-wider text-primary flex items-center gap-2 border-t border-gold/10"
                           >
                              Apple / Outlook
                           </button>
                        </div>
                     )}
                  </div>

                </div>
              ))}

              {/* FOOTER AREA */}
              <div className="border-t border-gold opacity-30 pt-12 pb-20">
                {/* Countdown */}
                <Countdown targetDateStr={events[0]?.isoDate || '2026-11-11T00:00:00'} />

                <p className="font-serif-body italic text-primary mb-8">Reserved for {guest.name}</p>
                <button 
                  onClick={() => setIsRsvpOpen(true)}
                  className="btn-gold-foil w-full text-white py-5 font-display uppercase tracking-[0.2em] text-sm shadow-xl rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  RSVP
                </button>
              </div>
            </div>
          </div>

          {/* 
              LAYER 3: POCKET (Front Bottom) - Z-30 
          */}
          <div 
            ref={pocketRef} 
            className="absolute inset-0 z-30 pointer-events-none drop-shadow-2xl"
          >
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 L0 100 L100 100 L100 0 L50 50 Z" fill="var(--paper-color)" />
                {/* Gold Liner Effect (Stroke on the V) */}
                <path d="M0 0 L50 50 L100 0" stroke="var(--gold-accent)" strokeWidth="0.5" fill="none" />
                <path d="M0 100 L50 50" stroke="#E6E2D8" strokeWidth="0.5" fill="none" />
                <path d="M100 100 L50 50" stroke="#E6E2D8" strokeWidth="0.5" fill="none" />
             </svg>
             {/* Texture Overlay */}
             <div className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none" 
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
             </div>
          </div>

          {/* 
              LAYER 4: FLAP (Front Top) - Z-40 
          */}
          <div 
             ref={flapRef}
             className="absolute inset-x-0 top-0 h-[50%] z-40 origin-top transform-style-3d backface-hidden drop-shadow-xl"
          >
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0 0 L100 0 L50 100 Z" fill="var(--paper-color)" stroke="#E6E2D8" strokeWidth="0.5" />
                 {/* Inner Gold Border hint */}
                 <path d="M5 0 L95 0 L50 90 Z" fill="none" stroke="var(--gold-accent)" strokeWidth="0.2" opacity="0.5"/>
              </svg>
              
               {/* Texture Overlay */}
               <div className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none" 
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
               </div>

              {/* WAX SEAL */}
              <div 
                ref={waxRef}
                className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center z-50"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #FFD700, #B8860B)', // Shiny Gold
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  border: '2px solid #DAA520'
                }}
              >
                 <div className="absolute inset-2 border border-[#FFF8DC]/40 rounded-full opacity-60"></div>
                 <span className="font-script text-[#FFF8DC] text-3xl pt-2 drop-shadow-md">LM</span>
              </div>
          </div>

        </div>
      </div>
    </div>
    
    {/* RSVP MODAL (Portal) */}
    <RsvpModal 
        isOpen={isRsvpOpen} 
        onClose={() => setIsRsvpOpen(false)} 
        guest={guest} 
    />
    </>
  );
};
