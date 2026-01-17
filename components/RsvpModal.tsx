import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { GuestProfile } from '../types';
import { EVENTS } from '../constants';

// --- CONFIGURATION ---
// REPLACE THIS URL with your deployed Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxWT9JlTSL43nnn3fYhZvPkfZW9yQPsOkUzLnSe9IUU4TevRp3UluwrqGcPS9j45MvNrA/exec";

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestProfile;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose, guest }) => {
  const [isRendered, setIsRendered] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Form State
  const [formStep, setFormStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);

  // Data Fields
  const [phone, setPhone] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [guestCount, setGuestCount] = useState(1);
  const [diet, setDiet] = useState<'Veg' | 'Non-Veg'>('Non-Veg');

  // Handle Mount/Unmount for Exit Animations
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setFormStep('form');
      setLoading(false);
      // Pre-select all events by default for convenience
      setSelectedEventIds(new Set(guest.allowedEvents));
    }
  }, [isOpen, guest.allowedEvents]);

  // Entrance & Exit Animations
  useEffect(() => {
    if (isRendered && overlayRef.current && contentRef.current) {
      if (isOpen) {
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(contentRef.current, 
          { y: 50, opacity: 0, scale: 0.95 }, 
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
        );
      } else {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' });
        gsap.to(contentRef.current, { 
          y: 20, opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.in',
          onComplete: () => setIsRendered(false)
        });
      }
    }
  }, [isOpen, isRendered]);

  const toggleEvent = (eventId: string) => {
    const newSet = new Set(selectedEventIds);
    if (newSet.has(eventId)) {
      newSet.delete(eventId);
    } else {
      newSet.add(eventId);
    }
    setSelectedEventIds(newSet);
  };

  // --- SUBMISSION LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Prepare Data
    // Get human-readable event titles from the IDs
    const eventNames = Array.from(selectedEventIds)
        .map((id: string) => EVENTS[id]?.title)
        .filter(Boolean)
        .join(', ');

    // If no events selected, treat as "Declined" or handle appropriately
    const finalEventString = eventNames || "Regretfully Declined";

    const payload = {
        name: guest.name,
        phone: phone,
        guestCount: selectedEventIds.size > 0 ? guestCount : 0,
        events: finalEventString,
        diet: diet
    };

    try {
        // 2. Send to Google Apps Script
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Standard for GAS to avoid CORS errors (response is opaque)
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // 3. Animation: Form Fade Out -> Success Fade In
        const formContainer = contentRef.current?.querySelector('.rsvp-form-container');
        if (formContainer) {
            gsap.to(formContainer, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                onComplete: () => {
                    setLoading(false);
                    setFormStep('success');
                }
            });
        } else {
             setLoading(false);
             setFormStep('success');
        }
    } catch (error) {
        console.error("Submission Error", error);
        setLoading(false);
        alert("There was an issue sending your RSVP. Please try again.");
    }
  };
  
  // Trigger Success Animation when state changes
  useEffect(() => {
      if (formStep === 'success' && contentRef.current) {
          const successMsg = contentRef.current.querySelector('.rsvp-success-msg');
          if (successMsg) {
            gsap.fromTo(successMsg, 
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
            );
          }
      }
  }, [formStep]);

  if (!isRendered) return null;

  // Filter events to only show what the guest is allowed to see
  const visibleEvents = guest.allowedEvents.map(id => EVENTS[id]).filter(Boolean);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
       {/* Glassmorphism Overlay */}
       <div 
         ref={overlayRef}
         onClick={onClose}
         className="absolute inset-0 bg-[#2C2C2C]/70 backdrop-blur-md opacity-0 transition-opacity"
         style={{ cursor: 'pointer' }}
       ></div>

       {/* Modal Content */}
       <div 
         ref={contentRef}
         className="relative w-full max-w-lg bg-paper-texture border border-gold rounded-sm shadow-2xl overflow-hidden opacity-0 max-h-[90vh] overflow-y-auto"
         style={{ background: 'var(--paper-color)', borderColor: 'var(--gold-accent)' }}
       >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gold hover:text-header transition-colors z-20 opacity-60 hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-8 md:p-10 relative flex flex-col justify-center min-h-[400px]">
             
             {/* FORM VIEW */}
             {formStep === 'form' && (
               <form onSubmit={handleSubmit} className="rsvp-form-container space-y-8">
                 <div className="text-center mb-6">
                   <h2 className="font-script text-5xl text-header mb-2 drop-shadow-sm">RSVP</h2>
                   <p className="font-display text-xs tracking-widest text-primary uppercase opacity-60">Kindly select the events you will attend</p>
                 </div>

                 {/* Contact Details */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-display text-[10px] uppercase tracking-widest text-primary opacity-70 mb-2">Guest Name</label>
                        <input 
                            type="text" 
                            defaultValue={guest.name}
                            readOnly
                            className="w-full bg-transparent border-b border-gold/30 py-2 font-serif text-lg text-primary focus:outline-none opacity-70 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block font-display text-[10px] uppercase tracking-widest text-primary opacity-70 mb-2">Phone Number</label>
                        <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-transparent border-b border-gold/30 py-2 font-serif text-lg text-primary focus:outline-none focus:border-gold transition-colors placeholder-primary/20"
                            placeholder="+91 99999 99999"
                            required
                        />
                    </div>
                 </div>

                 {/* Event Selection (Checkboxes) */}
                 <div>
                    <label className="block font-display text-[10px] uppercase tracking-widest text-primary opacity-70 mb-4">Select Events</label>
                    <div className="space-y-3">
                        {visibleEvents.map(event => {
                            const isSelected = selectedEventIds.has(event.id);
                            return (
                                <div 
                                    key={event.id}
                                    onClick={() => toggleEvent(event.id)}
                                    className={`flex items-center p-4 border rounded-sm cursor-pointer transition-all duration-300 group ${
                                        isSelected 
                                        ? 'border-gold bg-gold/5' 
                                        : 'border-gold/20 hover:border-gold/50 bg-white/40'
                                    }`}
                                    style={{ borderColor: isSelected ? 'var(--gold-accent)' : undefined }}
                                >
                                    {/* Custom Checkbox */}
                                    <div className={`w-5 h-5 border flex items-center justify-center mr-4 transition-colors ${
                                        isSelected ? 'bg-gold border-gold' : 'border-gold/40'
                                    }`} style={{ backgroundColor: isSelected ? 'var(--gold-accent)' : 'transparent', borderColor: isSelected ? 'var(--gold-accent)' : undefined }}>
                                        {isSelected && <span className="text-white text-xs">✓</span>}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h4 className={`font-display text-sm tracking-wider ${isSelected ? 'text-gold font-bold' : 'text-primary'}`} style={{ color: isSelected ? 'var(--gold-accent)' : 'var(--text-primary)' }}>
                                            {event.title}
                                        </h4>
                                        <p className="font-serif text-xs text-primary/60">{event.date} • {event.time}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 </div>

                 {/* Details Section (Only if events selected) */}
                 <div className={`space-y-6 transition-all duration-500 overflow-hidden ${selectedEventIds.size > 0 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                     
                     <div className="grid grid-cols-2 gap-6">
                        {/* Guest Count */}
                        <div>
                            <label className="block font-display text-[10px] uppercase tracking-widest text-primary opacity-70 mb-2">Total Guests</label>
                            <div className="relative">
                                <select 
                                    value={guestCount}
                                    onChange={(e) => setGuestCount(Number(e.target.value))}
                                    className="w-full bg-transparent border-b border-gold/30 py-2 font-serif text-lg text-primary focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                                >
                                    {Array.from({ length: guest.maxGuests }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                                <div className="absolute right-0 top-3 pointer-events-none text-gold text-xs">▼</div>
                            </div>
                        </div>

                        {/* Dietary Preference */}
                        <div>
                           <label className="block font-display text-[10px] uppercase tracking-widest text-primary opacity-70 mb-2">Dietary Preference</label>
                           <div className="flex border-b border-gold/30 pb-2 pt-1">
                               <button 
                                 type="button" 
                                 onClick={() => setDiet('Veg')}
                                 className={`flex-1 text-xs font-display uppercase tracking-wider transition-colors ${diet === 'Veg' ? 'text-gold font-bold' : 'text-primary/40'}`}
                                 style={{ color: diet === 'Veg' ? 'var(--gold-accent)' : undefined }}
                               >
                                 Veg
                               </button>
                               <div className="w-[1px] bg-gold/30 mx-2"></div>
                               <button 
                                 type="button" 
                                 onClick={() => setDiet('Non-Veg')}
                                 className={`flex-1 text-xs font-display uppercase tracking-wider transition-colors ${diet === 'Non-Veg' ? 'text-gold font-bold' : 'text-primary/40'}`}
                                 style={{ color: diet === 'Non-Veg' ? 'var(--gold-accent)' : undefined }}
                               >
                                 Non-Veg
                               </button>
                           </div>
                        </div>
                     </div>
                 </div>

                 {/* Submit Button */}
                 <button 
                    type="submit"
                    disabled={loading}
                    className="btn-gold-foil w-full text-white py-4 font-display uppercase tracking-[0.2em] text-xs shadow-xl mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm"
                 >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      selectedEventIds.size > 0 ? 'Confirm Attendance' : 'Decline Invitation'
                    )}
                 </button>
               </form>
             )}

             {/* SUCCESS VIEW */}
             {formStep === 'success' && (
               <div className="rsvp-success-msg text-center relative flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6 text-gold" style={{ color: 'var(--gold-accent)' }}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                  </div>
                  <h3 className="font-script text-6xl text-gold mb-4 drop-shadow-sm" style={{ color: 'var(--gold-accent)' }}>Thank You!</h3>
                  <p className="font-serif text-xl text-primary mb-2">We look forward to celebrating with you.</p>
                  <div className="h-[1px] w-20 bg-gold/30 mx-auto my-6"></div>
                  <p className="font-display text-[10px] uppercase tracking-widest text-primary/50 mb-8">Your response has been recorded.</p>
                  
                  <button 
                    onClick={onClose}
                    className="px-8 py-3 border border-gold/30 hover:bg-gold hover:text-white transition-colors uppercase text-xs font-display tracking-widest rounded-sm text-gold"
                    style={{ color: 'var(--gold-accent)', borderColor: 'var(--gold-accent)' }}
                  >
                    Close
                  </button>
               </div>
             )}

          </div>
       </div>
    </div>,
    document.body
  );
};