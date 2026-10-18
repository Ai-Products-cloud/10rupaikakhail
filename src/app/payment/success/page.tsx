'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Ticket,
  Calendar,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Trophy,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ref =
    searchParams.get('ref') ||
    searchParams.get('order_id') ||
    searchParams.get('beacon') ||
    searchParams.get('tracker') ||
    '';

  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
      });
    } catch {}
  };

  const fetchStatus = useCallback(async () => {
    if (!ref) {
      setErrorMsg('No payment transaction reference provided in URL.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/payments/${encodeURIComponent(ref)}`);
      if (res.status === 401) {
        router.push(`/login?redirect=/payment/success?ref=${encodeURIComponent(ref)}`);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to verify transaction status.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPaymentData(data);
      setErrorMsg(null);

      if (data.status === 'SUCCEEDED') {
        triggerConfetti();
      }
    } catch (err: any) {
      console.error('Failed to poll payment status:', err);
    } finally {
      setLoading(false);
    }
  }, [ref, router]);

  // Polling mechanism if webhook / gateway confirmation has not yet arrived
  useEffect(() => {
    fetchStatus();

    // Auto-poll every 2.5 seconds for up to 10 attempts while status is PENDING
    const interval = setInterval(() => {
      setPollCount((prev) => {
        if (prev < 10 && paymentData && paymentData.status === 'PENDING') {
          fetchStatus();
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchStatus, paymentData?.status]);

  if (loading && !paymentData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm w-full bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-black text-white">Verifying Draw Entry...</h2>
          <p className="text-xs text-slate-300">
            Securely confirming your PKR 10 transaction with the payment gateway.
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg && !paymentData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">Transaction Status Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{errorMsg}</p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = paymentData?.status === 'SUCCEEDED' || paymentData?.isEnrolled;
  const isPending = paymentData?.status === 'PENDING' && !isConfirmed;
  const isFailed = paymentData?.status === 'FAILED' || paymentData?.status === 'CANCELLED';
  const ticketCode = paymentData?.ticketCode || paymentData?.registration?.enrollment?.ticketCode || 'TKT-10K-ACTIVE';

  const handleCopyTicket = () => {
    if (ticketCode) {
      navigator.clipboard.writeText(ticketCode);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${paymentData?.customer?.referralCode || ''}` : '';
    const text = encodeURIComponent(
      `🎉 Assalam-o-Alaikum! I just entered the Grand Pakistan Mega Draw for PKR 10 on 10kakhail to win a Bike, Smart Mobile or Mobile! Register with my link and enter: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-lg w-full space-y-6">

        {/* STATE 1: PENDING CONFIRMATION */}
        {isPending && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 block">
                Verification In Progress
              </span>
              <h1 className="text-2xl font-black text-white">Payment Processing</h1>
              <p className="text-xs text-slate-300">
                Confirming your PKR 10 entry for the Grand Pakistan Mega Draw.
              </p>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-left space-y-1">
              <p className="text-xs font-bold text-amber-200">
                Awaiting final server confirmation from payment gateway.
              </p>
              <p className="text-[11px] text-amber-300/80">
                Your draw entry ticket will automatically activate as soon as confirmation is recorded.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Checking gateway ledger... (Attempt {pollCount}/10)</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => fetchStatus()}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
              >
                Refresh Status Now
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs text-center transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* STATE 2: SUCCESSFUL DRAW ENTRY ENROLLED */}
        {isConfirmed && (
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header Celebration */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 block">
                🎉 مبارک ہو • Draw Entry Confirmed!
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                You Are In The Draw!
              </h1>
              <p className="text-xs text-slate-300">
                Your PKR 10 entry for the Grand Pakistan Mega Draw 2027 is verified and recorded in the official ledger.
              </p>
            </div>

            {/* Lucky Draw Ticket Card */}
            <div className="bg-gradient-to-br from-amber-500/15 via-slate-950 to-emerald-950/30 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                    Official Draw Ticket Pass
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tracking-wider">
                  VERIFIED • ACTIVE
                </span>
              </div>

              {/* Big Monospace Ticket Number */}
              <div className="bg-slate-950 rounded-xl p-4 border border-amber-500/30 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Your Lucky Ticket Number
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-widest select-all">
                  {ticketCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="mt-1 text-[11px] text-amber-300 hover:text-white transition inline-flex items-center gap-1 font-semibold"
                >
                  {copiedTicket ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Click to Copy Ticket Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Prize Eligibility */}
              <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-500/20 text-xs text-emerald-200 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-emerald-300">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Eligible for Grand Mega Prizes:</span>
                </div>
                <div className="text-[11px] text-slate-300 pl-5 space-y-0.5">
                  <div>🏍️ <strong>1st Prize:</strong> Bike (Motorcycle)</div>
                  <div>📱 <strong>2nd Prize:</strong> Smart Mobile</div>
                  <div>📞 <strong>3rd Prize:</strong> Mobile</div>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3 text-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] block">Participant:</span>
                  <span className="font-bold text-white truncate block">
                    {paymentData.customer?.fullName || 'Verified Participant'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Amount Paid:</span>
                  <span className="font-black text-emerald-400 block">
                    PKR 10.00
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Draw Date:</span>
                  <span className="font-semibold text-slate-300 block">
                    23 March 2027
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Ref:</span>
                  <span className="font-mono text-slate-400 text-[11px] truncate block">
                    {paymentData.internalReference}
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-2">
              <Link
                href="/dashboard"
                className="w-full py-3.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-950 transition flex items-center justify-center gap-2"
              >
                <span>Go to Participant Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share &amp; Earn +1 Free Ticket on WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: FAILED OR CANCELLED */}
        {isFailed && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white">Payment Incomplete</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your PKR 10 entry payment was not finalized. You can retry checkout anytime to claim your ticket in the Grand Pakistan Mega Draw.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/payment/cancelled?ref=${encodeURIComponent(ref)}`}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs text-center transition"
              >
                Retry Checkout (PKR 10)
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs text-center transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading payment confirmation...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
