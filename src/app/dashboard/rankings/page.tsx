'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Flame, HelpCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function MyRankingsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  const stats = data?.stats || {};
  const currentRank = stats.currentRank;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
          Leaderboard Standings
        </span>
        <h1 className="text-2xl font-black text-white">My Ranking &amp; Prize Status</h1>
        <p className="text-xs text-slate-300 mt-1">
          Your standing in the official ranking-based prize competition.
        </p>
      </div>

      {/* Main Ranking Display */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 rounded-3xl p-8 border border-white/10 shadow-2xl text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-3xl mx-auto shadow-2xl shadow-amber-500/20">
          {currentRank ? `#${currentRank}` : '—'}
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-white">
            {currentRank === 1
              ? 'Currently #1 on the Leaderboard!'
              : currentRank === 2
              ? 'Currently #2 on the Leaderboard!'
              : currentRank === 3
              ? 'Currently #3 on the Leaderboard!'
              : currentRank
              ? `Currently Ranked #${currentRank}`
              : 'Not Yet Ranked'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verified Referrals: <strong className="text-emerald-400">{stats.totalSuccessfulReferrals || 0}</strong>{' '}
            • Out of <strong className="text-white">{stats.totalParticipants || 0}</strong> participants
          </p>
        </div>

        {/* Projected Prize Tag */}
        <div className="inline-block p-3 bg-slate-950/80 rounded-2xl border border-white/10 text-xs">
          <span className="text-slate-400 block mb-0.5">Current Projected Prize:</span>
          {currentRank === 1 ? (
            <span className="font-extrabold text-amber-400 text-sm">
              1st Prize: Bike
            </span>
          ) : currentRank === 2 ? (
            <span className="font-extrabold text-slate-200 text-sm">
              2nd Prize: Smart Mobile
            </span>
          ) : currentRank === 3 ? (
            <span className="font-extrabold text-amber-500 text-sm">
              3rd Prize: Mobile
            </span>
          ) : (
            <span className="text-slate-400">
              Top 3 participants win premier prizes. Invite more friends to advance!
            </span>
          )}
        </div>

        <div className="pt-2">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition"
          >
            <span>View Full Live Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Published Rules & Tie-breaking clause */}
      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-4 text-xs text-slate-300">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Official Ranking &amp; Tie-Breaking Rules</span>
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-slate-400">
          <li>
            <strong>Ranking Criteria:</strong> Rankings are strictly governed by the count of verified, successful referrals. A referral is verified only after the invited user completes their first eligible draw entry.
          </li>
          <li>
            <strong>Tie-Breaking Rule:</strong> If two or more participants have the exact same number of verified referrals, the tie is broken by the earliest timestamp at which that total was achieved.
          </li>
          <li>
            <strong>Fraud Exclusion:</strong> Unverified, pending, fraudulent, or refunded referrals are completely excluded from leaderboard rankings.
          </li>
        </ul>
      </div>
    </div>
  );
}
