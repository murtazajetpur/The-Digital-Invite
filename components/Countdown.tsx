import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDateStr: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDateStr }) => {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number} | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDateStr).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference < 0) {
        setIsExpired(true);
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft({ days, hours, minutes });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateStr]);

  return (
    <div className="w-full text-center py-8">
      <p className="font-display text-xs uppercase tracking-[0.3em] text-primary/60 mb-6">The Countdown Begins</p>
      
      {isExpired ? (
        <h3 className="font-script text-5xl text-gold">Just Married!</h3>
      ) : !timeLeft ? (
        <div className="animate-pulse font-serif text-xl text-primary">Loading...</div>
      ) : (
        <div className="flex items-center justify-center gap-4 md:gap-8 text-gold">
          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl md:text-5xl font-bold">{timeLeft.days}</span>
            <span className="text-[10px] uppercase tracking-widest mt-2 text-primary">Days</span>
          </div>
          <span className="text-2xl opacity-50 mb-4">:</span>
          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl md:text-5xl font-bold">{timeLeft.hours}</span>
            <span className="text-[10px] uppercase tracking-widest mt-2 text-primary">Hours</span>
          </div>
          <span className="text-2xl opacity-50 mb-4">:</span>
          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl md:text-5xl font-bold">{timeLeft.minutes}</span>
            <span className="text-[10px] uppercase tracking-widest mt-2 text-primary">Mins</span>
          </div>
        </div>
      )}
    </div>
  );
};