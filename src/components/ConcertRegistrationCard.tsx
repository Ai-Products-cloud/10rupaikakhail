'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Ticket,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ConcertRegistrationCardProps {
  concertRegistrations?: any[];
  onRefresh?: () => void;
}

export default function ConcertRegistrationCard({
  concertRegistrations = [],
  onRefresh,
}: ConcertRegistrationCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryReg = concertRegistrations[0] || null;
  const isEnrolled = primaryReg?.status === 'ENROLLED' && !!primaryReg?.enrollment;
  const isPending = primaryReg?.status === 'PENDING';
  const latestPayment = primaryReg?.payments?.[0];

  const handleRegisterAndPay = async (provider = 'SAFEPAY') => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setError(err.message || 'Payment initiation error');
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!latestPayment) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/payments/${latestPayment.id}/retry`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retry checkout.');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setError(err.message || 'Retry initiation error');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Official Lucky Draw • 10 Rupai Ka Khail
            </span>
            <h3 className="text-lg font-black text-white">
              {primaryReg?.concert?.title || 'Grand Pakistan Mega Draw 2027'}
            </h3>
          </div>
        </div>

        {isEnrolled && (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-4 h-4" />
            <span>Entry Confirmed — Enrolled</span>
          </span>
        )}

        {isPending && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Clock className="w-4 h-4" />
            <span>Entry Pending Payment</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950/60 rounded-2xl p-3 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Prize Pool
          </span>
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>1st Bike • 2nd Smart Mobile • 3rd Mobile</span>
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-2xl p-3 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Entry Fee
          </span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span>PKR 10 (One-Time Entry)</span>
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-2xl p-3 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Payment Method
          </span>
          <span className="text-slate-200 font-semibold">
            Instant Online Checkout
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* State A: Enrolled */}
      {isEnrolled && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Official Draw Ticket Pass Issued
            </span>
            <div className="text-xl font-mono font-black text-amber-400 tracking-wider">
              {primaryReg.enrollment.ticketCode}
            </div>
            <p className="text-xs text-slate-400">
              Verified on {new Date(primaryReg.enrollment.enrolledAt).toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <Link
            href={`/payment/success?ref=${primaryReg.payments[0]?.internalReference || ''}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <span>View Ticket Receipt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* State B: Pending Payment */}
      {isPending && !isEnrolled && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Payment Incomplete</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Ref: <span className="font-mono text-amber-400">{latestPayment?.internalReference}</span>
              {' '}• Awaiting payment gateway confirmation.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Complete Payment (PKR 10)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* State C: Not yet registered */}
      {!primaryReg && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <p className="text-xs text-slate-300">
            Pay the one-time PKR 10 entry fee securely online to get your official lucky draw ticket and qualify for prizes.
          </p>
          <button
            onClick={() => handleRegisterAndPay('SAFEPAY')}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg shadow-amber-950 flex items-center gap-2 transition whitespace-nowrap"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                <span>Enter Lucky Draw (PKR 10)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
