import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GuestProfile, WeddingEvent } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface ScrollEnvelopeProps {
  guest: GuestProfile;
  events: WeddingEvent[];
}

export const ScrollEnvelope: React.FC<ScrollEnvelopeProps> = ({ guest, events }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedWrapperRef = useRef<HTMLDivElement>(null);
  
  // Layers references
  const cardRef = useRef<HTMLDivElement>(null);   // Z-20
  const pocketRef = useRef<HTMLDivElement>(null); // Z-30
  const flapRef = useRef<HTMLDivElement>(null);   // Z-40
  const waxRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);

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
    // 1. SCROLL TRACK
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
                <div key={event.id} className="w-full">
                  <h3 className="font-display text-3xl md:text-4xl text-gold mb-3 uppercase tracking-wide">{event.title}</h3>
                  <p className="font-serif-body text-2xl text-primary italic mb-3">{event.date}</p>
                  <p className="font-display text-sm text-header uppercase tracking-widest opacity-80">{event.venue}, {event.location}</p>
                  <p className="text-gold text-xs font-bold mt-4 uppercase tracking-widest border border-gold inline-block px-4 py-2 rounded-sm">
                    {event.theme}
                  </p>
                  {i < events.length - 1 && (
                    <div className="text-gold opacity-40 text-xl mt-12">♦</div>
                  )}
                </div>
              ))}

              {/* FOOTER */}
              <div className="border-t border-gold opacity-30 pt-12 pb-20">
                <p className="font-serif-body italic text-primary mb-8">Reserved for {guest.name}</p>
                <button className="btn-gold-foil w-full text-white py-5 font-display uppercase tracking-[0.2em] text-sm shadow-xl rounded-sm">
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
  );
};