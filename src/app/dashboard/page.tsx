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
  CheckCircle2,
  ExternalLink,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import SimulatedPaymentModal from '@/components/SimulatedPaymentModal';

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState('');
  const [payingDirectly, setPayingDirectly] = useState(false);

  const refreshData = () => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
    refreshData();
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
        `Assalam-o-Alaikum! Join me on 10kakhail. Enter the Grand Mega Draw for just PKR 10 to win a Bike or Smart Mobile! Register here: ${referralUrl}`
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

  // Check enrollment status from concertRegistrations
  const primaryReg = data?.concertRegistrations?.[0] || null;
  const isEnrolled = primaryReg?.status === 'ENROLLED' && !!primaryReg?.enrollment;
  const isPendingPayment = primaryReg?.status === 'PENDING' && !isEnrolled;
  const ticketCode = primaryReg?.enrollment?.ticketCode || (data?.entries?.[0]?.entryNumber);

  const handleDirectEnter = async () => {
    setPayingDirectly(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'SAFEPAY' }),
      });
      const resData = await res.json();
      if (res.ok && resData.checkoutUrl) {
        window.location.href = resData.checkoutUrl;
      } else {
        // Fallback to modal if error or already enrolled
        setIsModalOpen(true);
      }
    } catch {
      setIsModalOpen(true);
    } finally {
      setPayingDirectly(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* 1. GREETING & GRAND DRAW TIMER BANNER */}
      <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/50 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
              Participant Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Assalam-o-Alaikum, {data?.user?.fullName || 'Participant'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Grand Pakistan Mega Draw 2027 • 1st Prize Bike, 2nd Prize Smart Mobile, 3rd Prize Mobile
          </p>
        </div>

        {/* Live Timer */}
        <div className="w-full md:w-auto bg-slate-950/80 rounded-2xl p-4 border border-emerald-500/30 flex flex-col items-center md:items-end justify-center shadow-lg">
          <CountdownTimer
            targetDate="2027-03-23T23:59:59Z"
            label="Grand Draw Deadline:"
            className="text-xs"
          />
        </div>
      </div>

      {/* 2. OPTION TO ENTER THE DRAW */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl p-6 sm:p-7 border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Active Draw
              </span>
              <span className="text-xs font-bold text-slate-400">Entry Fee: PKR 10</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Grand Pakistan Mega Draw 2027
            </h2>
            <p className="text-xs text-slate-300">
              {isEnrolled
                ? 'Your entry is verified and officially recorded in the draw ledger.'
                : 'Enter now with a one-time PKR 10 payment to qualify for all mega prizes.'}
            </p>
          </div>

          {/* Action / Status */}
          {isEnrolled ? (
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl px-5 py-3 text-right space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Entry Enrolled</span>
              </span>
              <div className="text-base font-mono font-black text-amber-400">
                {ticketCode || 'TKT-VERIFIED'}
              </div>
            </div>
          ) : isPendingPayment ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Complete Payment (PKR 10)</span>
            </button>
          ) : (
            <button
              onClick={handleDirectEnter}
              disabled={payingDirectly}
              className="px-7 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {payingDirectly ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Enter Draw for PKR 10</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 3. PARTICIPANT STATS DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Draw Entries */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Total Draw Entries</span>
            <Ticket className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats.totalEligibleEntries}
          </div>
          <span className="text-[10px] text-slate-500 block">
            {stats.standardEntriesCount} paid + {stats.bonusEntriesCount} referral bonus
          </span>
        </div>

        {/* Verified Referrals */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Verified Referrals</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {stats.totalSuccessfulReferrals}
          </div>
          <span className="text-[10px] text-slate-500 block">
            {stats.totalPendingReferrals} pending payment
          </span>
        </div>

        {/* Current Leaderboard Position */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Leaderboard Position</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {stats.currentRank ? `#${stats.currentRank}` : 'Unranked'}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Top referrers win extra prizes
          </span>
        </div>
      </div>

      {/* 4. SEEING THEIR REFERRALS & REFERRAL LINK */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Referral Header & Sharing */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Your Unique Referral Link</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold w-fit">
              +1 Free Entry Per Friend
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Share your link with friends and family. Every time a friend registers and enters the draw, you automatically earn <strong>+1 bonus entry</strong>!
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

        {/* Seeing Their Referrals List */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Your Direct Referrals ({data?.referrals?.length || 0})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              {stats.totalSuccessfulReferrals} Verified Active
            </span>
          </div>

          {data?.referrals?.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.referrals.map((refItem: any) => {
                const referee = refItem.referee;
                const isVerified = refItem.status === 'VERIFIED';
                return (
                  <div
                    key={refItem.id}
                    className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">
                        {referee?.fullName || 'Participant'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {referee?.phone ? `${referee.phone.slice(0, 4)}***${referee.phone.slice(-3)}` : 'Joined via link'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isVerified ? 'Verified (+1 Entry)' : 'Pending Entry'}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(refItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-white/5">
              No friends have joined using your link yet. Copy your referral link above and share it on WhatsApp to earn bonus draw entries!
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <SimulatedPaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refreshData();
        }}
        draw={{
          id: 'mega-draw-2027',
          title: 'Grand Pakistan Mega Draw 2027',
          entryFeePKR: 10,
          endDate: '2027-03-23T23:59:59Z',
        }}
        onSuccess={() => {
          refreshData();
        }}
      />
    </div>
  );
}
