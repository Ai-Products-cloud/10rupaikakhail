'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Flame, HelpCircle, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import LeaderboardTable from '@/components/LeaderboardTable';

export default function LeaderboardPage() {
  const [data, setData] = useState<any>({ items: [], totalEligibleParticipants: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
          <Flame className="w-3.5 h-3.5" />
          <span>Real-Time Referral Standings</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">Referral Leaderboard</h1>
        <p className="text-sm text-slate-300">
          Rankings are determined by verified successful referrals. The top 3 participants qualify for our premier prizes at draw closing!
        </p>
      </div>

      {/* Top 3 Podium Highlights */}
      {data.items?.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-end pt-4">
          {/* Rank 2 (Silver) */}
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-400/30 text-center space-y-3 order-2 md:order-1 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-950 font-black text-lg mx-auto flex items-center justify-center shadow-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-white">{data.items[1].maskedName}</h3>
            <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-slate-300 text-xs font-bold">
              {data.items[1].successfulReferrals} Verified Referrals
            </span>
            <p className="text-xs text-slate-400">
              Projected Prize: <strong>Smart Mobile</strong>
            </p>
          </div>

          {/* Rank 1 (Gold - Center & Elevated) */}
          <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 rounded-3xl p-8 border-2 border-amber-400/50 text-center space-y-4 order-1 md:order-2 shadow-2xl relative md:-translate-y-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
              Current Leader
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-2xl mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
              1
            </div>
            <h3 className="text-xl font-extrabold text-white">{data.items[0].maskedName}</h3>
            <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-sm font-black border border-amber-500/30">
              {data.items[0].successfulReferrals} Verified Referrals
            </span>
            <p className="text-xs text-amber-300 font-semibold">
              Projected Prize: <strong>Bike</strong>
            </p>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-amber-800/30 text-center space-y-3 order-3 md:order-3 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-amber-700 text-white font-black text-lg mx-auto flex items-center justify-center shadow-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-white">{data.items[2].maskedName}</h3>
            <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-slate-300 text-xs font-bold">
              {data.items[2].successfulReferrals} Verified Referrals
            </span>
            <p className="text-xs text-slate-400">
              Projected Prize: <strong>Mobile</strong>
            </p>
          </div>
        </div>
      )}

      {/* Main Table */}
      <LeaderboardTable
        items={data.items || []}
        lastUpdated={data.lastUpdated}
        tieBreakerRule={data.tieBreakerRule}
      />

      {/* CTA */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">Want to join the top rankings?</h3>
          <p className="text-xs text-slate-400 mt-1">
            Get your personal referral code, share it on WhatsApp, and earn 1 bonus entry for each verified friend!
          </p>
        </div>
        <Link
          href="/dashboard/referrals"
          className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs whitespace-nowrap flex items-center gap-2 transition"
        >
          <span>Get My Referral Link</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
