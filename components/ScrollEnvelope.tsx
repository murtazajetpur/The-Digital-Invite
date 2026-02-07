import React, { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GuestProfile, WeddingEvent } from '../types';
import { RsvpModal } from './RsvpModal';
import { Countdown } from './Countdown';

// --- ASSET CONFIGURATION ---
// Updated to a plain, high-quality paper texture for a classic envelope look
const envelopeBodyImg = "https://images.unsplash.com/photo-1605218427368-35b8098c60a2?q=80&w=2070&auto=format&fit=crop"; 
const envelopeFlapImg = "https://images.unsplash.com/photo-1605218427368-35b8098c60a2?q=80&w=2070&auto=format&fit=crop"; 
// Reliable Gold Seal from Wikimedia Commons
const waxSealImg = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Gold_seal.svg/1024px-Gold_seal.svg.png"; 

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
      
      tl.to(flapRef.current, { filter: "brightness(0.9)" }, 0.1);

      // --- STEP 2: THE REVEAL (20% -> 40%) ---
      const revealStart = 1.6;

      // Move Envelope Layers DOWN
      tl.to([pocketRef.current, flapRef.current], {
        y: "120%", 
        duration: 2.5,
        ease: "power2.in"
      }, revealStart);

      // Fade out quickly so flap doesn't slide over text
      tl.to([pocketRef.current, flapRef.current], {
        opacity: 0,
        duration: 0.8,
        ease: "power1.out"
      }, revealStart);

      // Move Card UP
      tl.to(cardRef.current, {
        y: "-15vh", 
        duration: 2.5,
        ease: "power2.in"
      }, revealStart);

      // --- STEP 3: READING (40% -> 100%) ---
      const getScrollDistance = () => {
         if (!cardRef.current) return -window.innerHeight * 2.5;
         const cardHeight = cardRef.current.offsetHeight;
         const windowHeight = window.innerHeight;
         // Ensure we scroll enough to show the bottom, plus some padding
         return windowHeight - cardHeight - 150; 
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
          
          {/* LAYER 1: BACKGROUND FILL */}
          <div className="absolute inset-0 z-0 bg-paper"></div>

          {/* LAYER 2: THE CARD */}
          <div 
            ref={cardRef}
            className="absolute left-0 right-0 mx-auto w-full md:w-[700px] z-20 flex flex-col items-center text-center bg-paper shadow-2xl"
            style={{ 
              top: '0', 
              minHeight: '100vh', 
              paddingTop: '35vh', 
              paddingBottom: '5vh', // Reduced from 20vh to minimize blank space
            }}
          >
             {/* Gold Dust Texture Overlay */}
             <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply z-0" 
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%23C5A059'/%3E%3C/svg%3E")` }}>
             </div>

            {/* Double Gold Border */}
            <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-double border-gold pointer-events-none z-10"></div>

            {/* CARD CONTENT */}
            <div className="relative z-20 w-full max-w-lg mx-auto px-6 text-primary">
               {/* HEADER */}
               <div className="mb-10">
                  <p className="font-display text-[10px] md:text-xs tracking-[0.3em] text-primary uppercase mb-6 opacity-80">You are cordially invited to celebrate the union of</p>
                  
                  <h1 className="font-display text-5xl md:text-7xl text-header mb-4 drop-shadow-sm font-bold">Lubna Zariwala</h1>
                  <span className="font-script text-3xl text-gold">&</span>
                  <h1 className="font-display text-5xl md:text-7xl text-header mt-4 drop-shadow-sm font-bold">Murtaza Jetpurwala</h1>
                  
                  <div className="flex items-center justify-center gap-4 my-8 opacity-60">
                    <div className="h-[1px] w-16 bg-gold"></div>
                    <div className="text-gold text-sm font-display">♦</div>
                    <div className="h-[1px] w-16 bg-gold"></div>
                  </div>
               </div>

               {/* SEPARATOR */}
               <div className="w-full h-px bg-gold/30"></div>

               {/* COUNTDOWN */}
               <Countdown targetDateStr={events[0]?.isoDate || '2026-11-11T00:00:00'} />

               {/* SEPARATOR */}
               <div className="w-full h-px bg-gold/30 mb-12"></div>

               {/* EVENTS */}
               <div className="space-y-8">
               {events.map((event, i) => (
                <div 
                  key={event.id} 
                  className="w-full relative p-6 md:p-8 border border-gold/20 bg-white/60 shadow-sm rounded-sm"
                >
                  <h3 className="font-display text-2xl md:text-3xl text-gold mb-6 uppercase tracking-wide text-center font-bold">{event.title}</h3>
                  <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 mb-8 border-y border-gold/10 py-4 bg-gold/5">
                    <div className="flex flex-col items-center">
                        <span className="font-display text-[10px] uppercase tracking-widest text-primary/50 mb-1">Date</span>
                        <span className="font-serif-body text-xl text-primary font-bold">{event.date}</span>
                    </div>
                    <div className="hidden md:block w-px h-10 bg-gold/30"></div>
                     <div className="flex flex-col items-center">
                        <span className="font-display text-[10px] uppercase tracking-widest text-primary/50 mb-1">Time</span>
                        <span className="font-serif-body text-xl text-primary font-bold">{event.time} Onwards</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-6">
                      <div className="w-full">
                          <p className="font-display text-[10px] uppercase tracking-widest text-primary/50 mb-2">Venue</p>
                          <div 
                             onClick={() => openNativeMap(event.venue, event.location)}
                             className="group cursor-pointer border border-gold/30 bg-white/50 p-4 rounded-sm flex items-center gap-4 hover:border-gold hover:bg-white transition-all duration-300 hover:shadow-lg h-full"
                          >
                             <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform shrink-0">
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

                      <div className="w-full flex flex-col gap-6">
                          <div className="flex gap-4">
                              <div className="flex-1">
                                  <p className="font-display text-[10px] uppercase tracking-widest text-primary/50 mb-2">Dress Code</p>
                                  {/* Removed underline classes: border-b border-gold/20 inline-block pb-1 */}
                                  <p className="font-serif text-lg text-gold italic">{event.theme}</p>
                              </div>
                              {/* Attire Sketch Image Removed */}
                          </div>
                          <div className="border-t border-gold/10 pt-4">
                              <p className="font-display text-[10px] uppercase tracking-widest text-primary/50 mb-1">Invitees</p>
                              <p className="font-serif text-lg text-primary">All</p>
                          </div>
                      </div>
                  </div>

                  <div className="mt-8 relative inline-block text-left w-full">
                     <button 
                        onClick={() => setActiveCalendarMenu(activeCalendarMenu === event.id ? null : event.id)}
                        className="text-[10px] font-display uppercase tracking-[0.2em] text-primary hover:text-gold transition-colors flex items-center justify-center gap-2 mx-auto"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Save The Date
                     </button>
                     
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
              </div>

              {/* SEPARATOR */}
              <div className="w-full h-px bg-gold/30 my-12"></div>

              {/* FOOTER AREA */}
              <div className="pb-10"> {/* Reduced from pb-20 to reduce bottom space */}
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
             <div className="w-full h-full" style={{
                backgroundColor: '#D8C0DD', 
                backgroundImage: `url('${envelopeBodyImg}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                // Standard Envelope Pocket Shape (Rectangle with V-cut at top)
                clipPath: "polygon(0 0, 0 100%, 100% 100%, 100% 0, 50% 50%)" 
             }}></div>
          </div>

          {/* 
              LAYER 4: FLAP (Front Top) - Z-40 
              Added pointer-events-none to ensure it doesn't block clicks on the card
          */}
          <div 
             ref={flapRef}
             className="absolute inset-x-0 top-0 h-[50%] z-40 origin-top transform-style-3d drop-shadow-xl pointer-events-none"
          >
              {/* Flap Texture (Front) */}
              <div className="absolute inset-0 w-full h-full" style={{
                  backgroundColor: '#D8C0DD', 
                  backgroundImage: `url('${envelopeFlapImg}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "bottom center",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  backfaceVisibility: 'hidden'
              }}></div>
              
              {/* Flap Texture (Backface - visible when open) */}
              <div className="absolute inset-0 w-full h-full" style={{
                  backgroundColor: 'var(--paper-color)', // Match card paper
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden'
              }}></div>

              {/* WAX SEAL */}
              <div 
                ref={waxRef}
                className="absolute bottom-[-45px] left-1/2 -translate-x-1/2 w-28 h-28 z-50 flex items-center justify-center"
              >
                 <img 
                    src={waxSealImg}
                    alt="Gold Wax Seal" 
                    className="w-full h-full object-contain drop-shadow-lg" 
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                 />
                 {/* Fallback CSS seal in case image is missing (hidden by image usually) */}
                 <div className="absolute inset-0 bg-[#C5A059] rounded-full -z-10 border-2 border-white/20"></div>
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