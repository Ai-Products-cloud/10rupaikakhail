'use client';

import React, { useState } from 'react';
import { Trophy, ShieldCheck, Sparkles, CheckCircle, Image as ImageIcon } from 'lucide-react';

export interface PrizeCardProps {
  rank: 1 | 2 | 3;
  title: string;
  tagline: string;
  estimatedValue: string;
  description: string;
  eligibility: string;
  modelType?: 'cd70' | 'iphone17' | 'android' | string;
  imageUrl?: string;
  fallbackImageUrl?: string;
  status: string;
  drawId?: string;
  onEnterClick?: () => void;
}

export default function PrizeCard({
  rank,
  title,
  tagline,
  estimatedValue,
  description,
  eligibility,
  imageUrl,
  status,
  onEnterClick,
}: PrizeCardProps) {
  const [imgError, setImgError] = useState(false);

  // High-fidelity verified product imagery
  const resolvedImage =
    rank === 1
      ? 'https://ahsanautos.pk/images/products/cd70-black-2027.webp'
      : rank === 2
      ? imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'
      : imageUrl || 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80';

  const localFallback =
    rank === 1
      ? '/images/cd70-black-2027.webp'
      : rank === 2
      ? 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80';

  const rankBadgeColors =
    rank === 1
      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold border-amber-300'
      : rank === 2
      ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-bold border-slate-300'
      : 'bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold border-amber-600';

  return (
    <div className="glass-panel glass-card-hover rounded-3xl overflow-hidden flex flex-col border border-emerald-900/30 bg-slate-900/80 shadow-2xl relative transition-all duration-300 hover:border-emerald-500/40">
      {/* Top Banner with Rank Badge & Allocation Tag */}
      <div className="p-3.5 sm:p-4 pb-2 flex items-center justify-between z-10 gap-2 flex-wrap">
        <div
          className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md ${rankBadgeColors}`}
        >
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{rank === 1 ? '1st Prize' : rank === 2 ? '2nd Prize' : '3rd Prize'}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Guaranteed Winner Allocation</span>
        </div>
      </div>

      {/* Main Visual Display (Crisp 2D Product Photography) */}
      <div className="relative w-full h-[220px] sm:h-[250px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950/60 to-slate-900/40 p-4">
        {/* Subtle glow circle backdrop */}
        <div className="absolute inset-0 m-auto w-36 sm:w-44 h-36 sm:h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <img
          src={imgError ? localFallback : resolvedImage}
          alt={title}
          onError={() => setImgError(true)}
          className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] hover:scale-105 transition-transform duration-300"
        />

        {rank === 1 && (
          <span className="absolute bottom-2 left-3 text-[10px] bg-slate-950/85 text-amber-400 px-2.5 py-1 rounded-md border border-white/10 font-mono shadow">
            Honda CD 70 • 2027 Model
          </span>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-6 pt-2 sm:pt-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{title}</h3>
            <span className="text-xs sm:text-sm font-bold text-amber-400 whitespace-nowrap">
              {estimatedValue}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-emerald-400 font-medium mb-2.5 sm:mb-3">
            {tagline}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            {description}
          </p>

          <div className="bg-slate-950/50 rounded-2xl p-3 sm:p-3.5 border border-white/5 space-y-1.5 mb-5 text-[11px] sm:text-xs text-slate-400">
            <div className="flex items-start sm:items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span>{eligibility}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>
                Status: <strong className="text-slate-200">{status}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onEnterClick}
            className="w-full py-3.5 sm:py-4 px-4 min-h-[48px] rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Participate for PKR 10</span>
          </button>
          <p className="text-[10px] text-center text-slate-500 mt-2">
            Earn 1 extra bonus entry per verified friend invited
          </p>
        </div>
      </div>
    </div>
  );
}
