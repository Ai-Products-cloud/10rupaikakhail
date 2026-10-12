'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string | Date;
  label?: string;
  className?: string;
}

export default function CountdownTimer({
  targetDate,
  label = 'Draw Closes In:',
  className = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-rose-400 text-xs font-bold border border-rose-500/20 ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>Draw Closed (Awaiting Official Verification)</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-2.5 ${className}`}>
      {label && (
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{label}</span>
        </span>
      )}
      <div className="flex items-center gap-1.5 text-center font-mono">
        <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10 min-w-[36px]">
          <span className="text-sm font-bold text-white block">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-500 uppercase">Days</span>
        </div>
        <span className="text-slate-600 font-bold">:</span>
        <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10 min-w-[36px]">
          <span className="text-sm font-bold text-white block">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-500 uppercase">Hrs</span>
        </div>
        <span className="text-slate-600 font-bold">:</span>
        <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10 min-w-[36px]">
          <span className="text-sm font-bold text-white block">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-500 uppercase">Min</span>
        </div>
        <span className="text-slate-600 font-bold">:</span>
        <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10 min-w-[36px]">
          <span className="text-sm font-bold text-emerald-400 block">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-500 uppercase">Sec</span>
        </div>
      </div>
    </div>
  );
}
