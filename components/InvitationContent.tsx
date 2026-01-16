import React, { useLayoutEffect, useRef } from 'react';
import { WeddingEvent, GuestProfile } from '../types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, Observer);

interface InvitationContentProps {
  guest: GuestProfile;
  events: WeddingEvent[];
  onLock: () => void;
}

export const InvitationContent: React.FC<InvitationContentProps> = ({ guest, events, onLock }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance Animations
      const tl = gsap.timeline({ delay: 0.2 });
      
      tl.from(".hero-text", {
        y: 20,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out"
      });

      tl.from(".scroll-indicator", {
        opacity: 0,
        y: -10,
        duration: 0.5
      }, "-=0.5");

      // 2. Scroll Animations for cards
      const eventCards = gsap.utils.toArray('.event-card');
      eventCards.forEach((card: any, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 50,
          duration: 1,
          delay: i * 0.1,
          ease: 'power2.out',
        });
      });

      // 3. Detect Scroll UP at top to Re-Lock
      Observer.create({
        target: window,
        type: "wheel,touch",
        tolerance: 10,
        onUp: () => {
          // If we are at the very top (or bounced past it on mobile)
          if (window.scrollY <= 0) {
            onLock();
          }
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [onLock]);

  return (
    <div ref={containerRef} className="min-h-screen pb-20 bg-[#F3E5F5]">
      
      {/* Hero Section */}
      <header 
        ref={heroRef} 
        className="h-screen w-full flex flex-col justify-center items-center text-center px-4 md:px-6 relative bg-[#FFFAF0] border-[16px] md:border-[32px] border-[#F3E5F5]"
      >
        <div className="w-full max-w-3xl h-full max-h-[80vh] flex flex-col justify-center items-center relative border-2 border-[#C5A059]/30 p-4">
          
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#C5A059]"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#C5A059]"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#C5A059]"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#C5A059]"></div>

          <h2 className="hero-text font-script text-6xl md:text-8xl lg:text-9xl text-[#C5A059] mb-6">Lubna & Murtaza</h2>
          <p className="hero-text font-display uppercase tracking-[0.3em] text-xs md:text-sm text-gray-700 mb-8">
            Request the pleasure of your company
          </p>
          <div className="hero-text inline-block border-y border-[#C5A059]/40 py-3 px-8 my-4">
            <p className="font-serif italic text-lg md:text-2xl text-gray-600">Celebrating Love, Tradition & Togetherness</p>
          </div>
          
          <div className="scroll-indicator absolute bottom-8 animate-bounce text-[#C5A059]/60">
             <span className="block text-[10px] uppercase tracking-widest mb-2">Scroll for Details</span>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
             </svg>
          </div>
        </div>
      </header>

      {/* Events Timeline */}
      <main className="max-w-4xl mx-auto px-4 space-y-24 mt-20">
        <div className="text-center mb-16">
          <p className="text-gray-500 font-display text-xs tracking-widest uppercase">Your Exclusive Itinerary for</p>
          <h3 className="text-3xl font-serif text-gray-800 mt-3">{guest.name}</h3>
        </div>

        {events.map((event, index) => (
          <article 
            key={event.id} 
            className="event-card relative bg-white border border-[#C5A059]/20 p-8 md:p-12 rounded-sm shadow-xl"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-12 h-12 bg-[#C5A059] text-white flex items-center justify-center rounded-full font-serif font-bold shadow-md text-xl border-4 border-[#F3E5F5]">
              {index + 1}
            </div>
            
            <div className="flex flex-col md:flex-row gap-10 items-center mt-4 md:mt-0">
              <div className="flex-shrink-0 text-center md:text-right md:w-48 border-b md:border-b-0 md:border-r border-gray-200 pb-8 md:pb-0 md:pr-10">
                <span className="block font-display text-2xl text-gray-800 tracking-wide">{event.date.split(',')[0]}</span>
                <span className="block font-bold text-6xl text-[#C5A059] my-3">{event.date.split(' ')[2]}</span>
                <span className="block font-display text-sm text-gray-500 uppercase tracking-widest">{event.date.split(' ')[1]} {event.date.split(' ')[3]}</span>
              </div>

              <div className="flex-grow text-center md:text-left">
                <h4 className="font-display text-2xl md:text-3xl text-gray-900 mb-6">{event.title}</h4>
                <div className="space-y-4 text-gray-600 font-serif text-lg leading-relaxed">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                    <span className="font-bold text-[#C5A059] uppercase text-xs tracking-widest w-24">Time</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                    <span className="font-bold text-[#C5A059] uppercase text-xs tracking-widest w-24">Venue</span>
                    <span>{event.venue}, {event.location}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                    <span className="font-bold text-[#C5A059] uppercase text-xs tracking-widest w-24">Dress</span>
                    <span>{event.theme}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        {/* RSVP Section */}
        <section className="event-card mt-32 pt-16 border-t border-[#C5A059]/20 text-center">
          <h3 className="font-display text-4xl mb-6 text-[#1a1a1a]">RSVP</h3>
          <p className="mb-10 text-gray-600 max-w-lg mx-auto text-lg leading-relaxed font-serif">
            Kindly confirm your presence by November 1st, 2026. 
            <br/>We have reserved <strong className="text-[#C5A059]">{guest.maxGuests} seats</strong> for your family.
          </p>
          
          <form className="max-w-md mx-auto space-y-8 text-left bg-white p-10 shadow-2xl border border-[#C5A059]/10" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-display uppercase tracking-widest text-gray-500 mb-3">Attending?</label>
              <div className="relative">
                <select className="w-full border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-[#C5A059] transition-colors appearance-none font-serif text-lg">
                  <option>Joyfully Accepts</option>
                  <option>Regretfully Declines</option>
                </select>
                <div className="absolute right-0 top-4 pointer-events-none text-gray-400 text-xs">▼</div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-display uppercase tracking-widest text-gray-500 mb-3">Dietary Preference</label>
              <div className="flex gap-8 mt-2">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center group-hover:border-[#C5A059] transition-colors">
                      <input type="radio" name="diet" className="appearance-none w-3 h-3 bg-[#C5A059] rounded-full opacity-0 checked:opacity-100 transition-opacity" />
                   </div>
                   <span className="text-base font-serif group-hover:text-[#C5A059] transition-colors">Veg</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center group-hover:border-[#C5A059] transition-colors">
                      <input type="radio" name="diet" className="appearance-none w-3 h-3 bg-[#C5A059] rounded-full opacity-0 checked:opacity-100 transition-opacity" />
                   </div>
                   <span className="text-base font-serif group-hover:text-[#C5A059] transition-colors">Non-Veg</span>
                 </label>
              </div>
            </div>

            <button className="w-full mt-8 bg-[#1a1a1a] text-[#C5A059] font-display uppercase tracking-[0.2em] py-4 hover:bg-[#C5A059] hover:text-white transition-all duration-500">
              Confirm RSVP
            </button>
          </form>
        </section>

      </main>

      <footer className="mt-32 text-center text-gray-400 text-sm pb-10">
        <p className="font-script text-4xl mb-4 text-[#C5A059]/40">#LubnaAndMurtaza</p>
        <p className="uppercase tracking-widest text-[10px]">With Love & Gratitude</p>
      </footer>
    </div>
  );
};