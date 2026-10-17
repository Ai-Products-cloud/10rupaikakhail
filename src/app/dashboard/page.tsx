'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Users,
  Trophy,
  Sparkles,
  Share2,
  Copy,
  Check,
  CreditCard,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import SimulatedPaymentModal from '@/components/SimulatedPaymentModal';
import ConcertRegistrationCard from '@/components/ConcertRegistrationCard';

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentOrigin, setCurrentOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  const referralUrl = data?.user?.referralCode
    ? `${currentOrigin || (typeof window !== 'undefined' ? window.location.origin : '')}/register?ref=${data.user.referralCode}`
    : data?.referralLink || '';

  const handleCopy = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (referralUrl) {
      const text = encodeURIComponent(
        `Join me on 10kakhail! Enter the Grand Mega Draw for just PKR 10 and win a brand-new Bike or Smart Mobile! Register here: ${referralUrl}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const stats = data?.stats || {
    totalEligibleEntries: 0,
    standardEntriesCount: 0,
    bonusEntriesCount: 0,
    totalSuccessfulReferrals: 0,
    totalPendingReferrals: 0,
    currentRank: null,
  };

  return (
    <div className="space-y-8">
      {/* Top Greeting & Verification Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            User Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Assalam-o-Alaikum, {data?.user?.fullName || 'Participant'}!
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Track your draw tickets, invite contacts, and monitor your leaderboard progress.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-emerald-500/30">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-left text-xs">
            <span className="text-white font-bold block">Account Status</span>
            <span className="text-emerald-400 font-semibold text-[11px]">Verified Participant</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Total Eligible Entries */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Total Entries</span>
            <Ticket className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalEligibleEntries}</div>
          <span className="text-[10px] text-slate-500 block">
            {stats.standardEntriesCount} paid + {stats.bonusEntriesCount} referral bonus
          </span>
        </div>

        {/* Successful Referrals */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Verified Referrals</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.totalSuccessfulReferrals}</div>
          <span className="text-[10px] text-slate-500 block">
            {stats.totalPendingReferrals} pending verification
          </span>
        </div>

        {/* Current Leaderboard Position */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Leaderboard Position</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {stats.currentRank ? `#${stats.currentRank}` : 'Unranked'}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Based on verified referrals
          </span>
        </div>
      </div>

      {/* Official Concert Registration & Admission Pass Card */}
      <ConcertRegistrationCard
        concertRegistrations={data?.concertRegistrations || []}
        onRefresh={() => {
          fetch('/api/auth/me')
            .then((res) => (res.ok ? res.json() : null))
            .then((d) => {
              if (d) setData(d);
            });
        }}
      />

      {/* Referral Link & Social Sharing Box */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Your Unique Referral Link</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            +1 Entry Per Friend
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Share this link with your contacts. Every time someone joins and enters a draw, you earn exactly one additional draw entry!
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-emerald-400 font-mono select-all focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Active Draw Quick Entry CTA */}
      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Active Draw</span>
          <h3 className="text-lg font-extrabold text-white">Grand Pakistan Mega Draw 2027</h3>
          <p className="text-xs text-slate-400">Entry Fee: PKR 10 • Closing: 23 March 2027</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Enter for PKR 10</span>
        </button>
      </div>

      {/* Recent Entries */}
      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recent Draw Entries</h3>
          <Link href="/dashboard/entries" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.entries?.length > 0 ? (
          <div className="space-y-2">
            {data.entries.slice(0, 3).map((entry: any) => (
              <div
                key={entry.id}
                className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-amber-400 block">{entry.entryNumber}</span>
                  <span className="text-[11px] text-slate-400">{entry.draw?.title}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      entry.entryType === 'REFERRAL_BONUS'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {entry.entryType === 'REFERRAL_BONUS' ? 'Referral Bonus' : 'Standard Entry'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No entries recorded yet. Enter a draw for PKR 10 or invite friends to get started!
          </div>
        )}
      </div>

      {/* Simulated Payment Modal */}
      <SimulatedPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        draw={{
          id: 'mega-draw-2027',
          title: 'Grand Pakistan Mega Draw 2027',
          entryFeePKR: 10,
          endDate: '2027-03-23T23:59:59Z',
        }}
        onSuccess={() => {
          // Refresh user data
          fetch('/api/auth/me')
            .then((res) => (res.ok ? res.json() : null))
            .then((d) => {
              if (d) setData(d);
            });
        }}
      />
    </div>
  );
}
