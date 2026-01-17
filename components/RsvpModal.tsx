import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { GuestProfile } from '../types';

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
  const [attendance, setAttendance] = useState<'accept' | 'decline'>('accept');
  const [loading, setLoading] = useState(false);

  // Handle Mount/Unmount for Exit Animations
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setFormStep('form'); // Reset form on open
      setLoading(false);
    }
  }, [isOpen]);

  // Entrance & Exit Animations
  useEffect(() => {
    if (isRendered && overlayRef.current && contentRef.current) {
      if (isOpen) {
        // Animate In
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(contentRef.current, 
          { y: 50, opacity: 0, scale: 0.95 }, 
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
        );
      } else {
        // Animate Out
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' });
        gsap.to(contentRef.current, { 
          y: 20, 
          opacity: 0, 
          scale: 0.95, 
          duration: 0.4, 
          ease: 'power2.in',
          onComplete: () => setIsRendered(false)
        });
      }
    }
  }, [isOpen, isRendered]);

  // Submission Logic
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Network Request
    setTimeout(() => {
        // Smooth transition: Form Fade Out -> Success Fade In
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
        }
    }, 1500);
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
         className="relative w-full max-w-md bg-paper-texture border border-gold rounded-sm shadow-2xl overflow-hidden opacity-0"
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
          
          <div className="p-8 md:p-10 relative min-h-[450px] flex flex-col justify-center">
             
             {/* FORM VIEW */}
             {formStep === 'form' && (
               <form onSubmit={handleSubmit} className="rsvp-form-container space-y-6">
                 <div className="text-center mb-8">
                   <h2 className="font-script text-5xl text-header mb-2 drop-shadow-sm">RSVP</h2>
                   <p className="font-display text-xs tracking-widest text-primary uppercase opacity-60">Kindly respond by Nov 1st</p>
                 </div>

                 {/* Name Input */}
                 <div>
                   <label className="block font-display text-[10px] uppercase tracking-widest text-primary opacity-70 mb-2">Guest Name</label>
                   <input 
                      type="text" 
                      defaultValue={guest.name}
                      className="w-full bg-transparent border-b border-gold/30 py-2 font-serif text-xl text-primary focus:outline-none focus:border-gold transition-colors placeholder-primary/20"
                      placeholder="Enter Full Name"
                      required
                   />
                 </div>

                 {/* Attendance Toggle */}
                 <div>
                   <label className="block font-display text-[10px] uppercase tracking-widest text-primary opacity-70 mb-3">Attendance</label>
                   <div className="flex gap-4">
                     <button
                       type="button"
                       onClick={() => setAttendance('accept')}
                       className={`flex-1 py-3 text-xs font-display uppercase tracking-wider border transition-all duration-300 ${
                         attendance === 'accept' 
                           ? 'bg-gold text-white border-gold shadow-md' 
                           : 'border-gold/30 text-primary hover:border-gold'
                       }`}
                       style={{ backgroundColor: attendance === 'accept' ? 'var(--gold-accent)' : 'transparent', borderColor: 'var(--gold-accent)' }}
                     >
                       Joyfully Accept
                     </button>
                     <button
                       type="button"
                       onClick={() => setAttendance('decline')}
                       className={`flex-1 py-3 text-xs font-display uppercase tracking-wider border transition-all duration-300 ${
                         attendance === 'decline' 
                           ? 'bg-primary text-white border-primary shadow-md' 
                           : 'border-gold/30 text-primary hover:border-primary'
                       }`}
                       style={{ backgroundColor: attendance === 'decline' ? 'var(--text-primary)' : 'transparent', borderColor: attendance === 'decline' ? 'var(--text-primary)' : 'var(--gold-accent)' }}
                     >
                       Regretfully Decline
                     </button>
                   </div>
                 </div>

                 {/* Guest Count (Conditional) */}
                 {attendance === 'accept' && (
                    <div className="animate-fade-in">
                       <label className="block font-display text-[10px] uppercase tracking-widest text-primary opacity-70 mb-2">Number of Guests</label>
                       <div className="relative">
                          <select className="w-full bg-transparent border-b border-gold/30 py-2 font-serif text-xl text-primary focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer">
                            {Array.from({ length: guest.maxGuests }, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                          <div className="absolute right-0 top-3 pointer-events-none text-gold text-xs">▼</div>
                       </div>
                    </div>
                 )}

                 {/* Submit Button */}
                 <button 
                    type="submit"
                    disabled={loading}
                    className="btn-gold-foil w-full text-white py-4 font-display uppercase tracking-[0.2em] text-xs shadow-xl mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm"
                 >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      'Confirm Attendance'
                    )}
                 </button>
               </form>
             )}

             {/* SUCCESS VIEW */}
             {formStep === 'success' && (
               <div className="rsvp-success-msg text-center absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6 text-gold" style={{ color: 'var(--gold-accent)' }}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                  </div>
                  <h3 className="font-script text-6xl text-gold mb-4 drop-shadow-sm" style={{ color: 'var(--gold-accent)' }}>Thank You!</h3>
                  <p className="font-serif text-xl text-primary mb-2">We can't wait to celebrate with you.</p>
                  <div className="h-[1px] w-20 bg-gold/30 mx-auto my-6"></div>
                  <p className="font-display text-[10px] uppercase tracking-widest text-primary/50">A confirmation has been sent to your email.</p>
               </div>
             )}

          </div>
       </div>
    </div>,
    document.body
  );
};