import React, { useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

interface EnvelopeGateProps {
  isLocked: boolean;
  onUnlock: () => void;
  guestName: string;
}

export const EnvelopeGate: React.FC<EnvelopeGateProps> = ({ isLocked, onUnlock, guestName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const envelopeGroupRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const pocketRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  
  // We keep a reference to the timeline to control it bi-directionally
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Setup Timeline - The Physics of Opening
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
      });

      tlRef.current = tl;

      // --- PHASE 1: Open Flap ---
      tl.to(instructionsRef.current, { opacity: 0, duration: 0.2 }, 0);
      
      tl.to(flapRef.current, {
        rotateX: 180,
        backgroundColor: '#F3E5F5',
        duration: 1.5,
        ease: 'power2.inOut',
      }, 0);

      // --- PHASE 2: Slide Card Up ---
      tl.to(cardRef.current, {
        yPercent: -60, 
        z: 10,
        duration: 1.2,
      }, 0.5);

      // --- PHASE 3: Zoom to Full Screen ---
      const zoomStart = 1.2;

      // 1. Scale the Card to fill the viewport
      tl.to(cardRef.current, {
        scale: 1.5, // Scale up significantly
        yPercent: -50, // Center it roughly
        duration: 1.5,
        ease: 'power3.inOut'
      }, zoomStart);

      // 2. Drop the Envelope Pocket & Back away
      tl.to([pocketRef.current, backRef.current, flapRef.current], {
        y: 300,
        opacity: 0,
        duration: 1,
        ease: 'power2.in'
      }, zoomStart);

      // 3. Scale the Wrapper to ensure it covers bounds
      tl.to(envelopeGroupRef.current, {
        scale: 1.2,
        duration: 1.5,
        ease: 'power3.inOut'
      }, zoomStart);

      // 2. Observer - The "Scroll Jack"
      Observer.create({
        target: window,
        type: "wheel,touch,pointer",
        tolerance: 10,
        preventDefault: true, // Hijack scroll
        onChange: (self) => {
          // If NOT locked, we ignore forward scrolling (let native scroll handle content),
          // BUT we might still catch the momentum if we just transitioned.
          // Ideally, App.tsx handles the pointer-events so this observer won't see events when unlocked.
          if (!containerRef.current || getComputedStyle(containerRef.current).opacity === '0') return;

          const sensitivity = 0.002; 
          const delta = self.deltaY * sensitivity;
          
          if (!tlRef.current) return;
          
          let newProgress = tlRef.current.progress() + delta;

          // Clamp
          if (newProgress < 0) newProgress = 0;
          if (newProgress > 1) newProgress = 1;

          gsap.to(tlRef.current, { progress: newProgress, duration: 0.5, ease: 'power3.out', overwrite: true });

          // Logic triggers
          // 1. OPENING: If we reach near end, trigger unlock
          if (newProgress > 0.98 && isLocked) {
             onUnlock();
          }
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [isLocked, onUnlock]);

  // If we re-enter locked state (user scrolled back up), ensure timeline is at end so we can scroll backwards
  useEffect(() => {
    if (isLocked && tlRef.current) {
        // If the timeline is at 0 (initial load), leave it.
        // If the timeline is > 0 (we were previously open), ensure it's at 1 so reverse works.
        // However, initial load progress is 0.
        // We can differentiate by checking if we have "opened" at least once? 
        // Simplest: If progress is > 0.9, keep it there.
        if (tlRef.current.progress() > 0.9) {
            tlRef.current.progress(1);
        }
    }
  }, [isLocked]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black perspective-1000 overflow-hidden"
    >
      <div ref={instructionsRef} className="absolute bottom-10 text-white/50 text-center animate-pulse z-50 pointer-events-none">
        <p className="text-xs md:text-sm uppercase tracking-widest mb-2 font-display">The Digital Ceremony</p>
        <div className="flex flex-col items-center gap-1">
          <span className="block w-[1px] h-6 md:h-8 bg-white/30"></span>
          <span className="text-[10px] md:text-xs tracking-wider">Scroll to Open</span>
        </div>
      </div>

      {/* 
         MOBILE SIZING FIX:
         w-[95vw] -> Takes 95% of width.
         aspect-[1.2] -> Makes it taller than standard landscape to fill more vertical space on phones, 
                         while still looking like an envelope.
         md:aspect-[1.6] -> Return to standard landscape on desktop.
      */}
      <div 
        ref={envelopeGroupRef}
        className="relative w-[95vw] md:w-[70vw] max-w-[1000px] aspect-[1.2] md:aspect-[1.6] transform-style-3d shadow-2xl"
      >
        
        {/* 1. The Card */}
        <div 
          ref={cardRef}
          className="absolute inset-[5%] bg-[#FFFAF0] rounded-sm shadow-md flex flex-col items-center justify-center text-center p-4 border-2 border-[#C5A059]/30"
          style={{ transform: 'translateZ(0px)', zIndex: 5 }}
        >
          {/* Decorative Corners */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#C5A059]"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#C5A059]"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#C5A059]"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#C5A059]"></div>

          <div className="flex flex-col justify-center items-center transform scale-90 md:scale-100">
            <h1 className="font-script text-5xl md:text-6xl text-[#C5A059] mb-2">Lubna & Murtaza</h1>
            <p className="font-display text-[10px] md:text-xs tracking-widest text-gray-500 uppercase mt-2">Request the honor of your presence</p>
            <div className="mt-4 w-8 h-[1px] bg-[#C5A059]"></div>
          </div>
        </div>

        {/* 2. Envelope Back */}
        <div 
          ref={backRef}
          className="absolute inset-0 bg-[#E0Cfe0] rounded-b-lg shadow-xl"
          style={{ transform: 'translateZ(-2px)', zIndex: 1 }}
        ></div>

        {/* 3. Envelope Pocket */}
        <div 
          ref={pocketRef}
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ transform: 'translateZ(10px)' }}
        >
          <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 0 L50 45 L0 100 Z" fill="#E6E6FA" />
             <path d="M100 0 L50 45 L100 100 Z" fill="#E6E6FA" />
             <path d="M0 100 L50 45 L100 100 Z" fill="#DCD0FF" /> 
          </svg>
        </div>

        {/* 4. Flap */}
        <div 
          ref={flapRef}
          className="absolute top-0 inset-x-0 h-1/2 z-30 origin-top transform-style-3d"
          style={{ 
            background: 'linear-gradient(to bottom right, #E6E6FA, #DCD0FF)',
            clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
            backfaceVisibility: 'hidden', 
          }}
        >
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 bg-[#C5A059] rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
             <span className="font-script text-white text-xl md:text-2xl pt-1">LM</span>
          </div>
        </div>
        
        {/* Flap Interior */}
        <div 
          className="absolute top-0 inset-x-0 h-1/2 z-30 origin-top transform-style-3d"
           style={{ 
            backgroundColor: '#F3E5F5',
            clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
            transform: 'rotateY(180deg)', 
            backfaceVisibility: 'hidden',
          }}
        ></div>

      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white/20 text-[10px]">
        Preparing invitation for {guestName}
      </div>
    </div>
  );
};