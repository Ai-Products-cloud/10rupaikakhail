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
  MapPin,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

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
    } catch (err: any) {
      console.error('Failed to poll payment status:', err);
    } finally {
      setLoading(false);
    }
  }, [ref, router]);

  // Polling mechanism if webhook has not yet arrived
  useEffect(() => {
    fetchStatus();

    // Auto-poll every 3 seconds for up to 10 attempts while status is PENDING
    const interval = setInterval(() => {
      setPollCount((prev) => {
        if (prev < 10 && paymentData && paymentData.status === 'PENDING') {
          fetchStatus();
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchStatus, paymentData?.status]);

  if (loading && !paymentData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold">Contacting Payment Gateway...</h2>
          <p className="text-sm text-slate-400">Verifying secure server transaction state.</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !paymentData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Unable to Locate Payment</h2>
          <p className="text-sm text-slate-400">{errorMsg}</p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = paymentData?.status === 'SUCCEEDED' && paymentData?.isEnrolled;
  const isPending = paymentData?.status === 'PENDING';
  const isFailed = paymentData?.status === 'FAILED' || paymentData?.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* State 1: Payment Processing / Pending Webhook Confirmation */}
        {isPending && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400 block mb-1">
                Authorization In Progress
              </span>
              <h1 className="text-2xl font-black text-white">Payment Processing</h1>
            </div>

            {/* MANDATORY STRICT RULE: Customer reached return URL, but server webhook is not confirmed yet */}
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-left">
              <p className="text-sm text-amber-200 font-medium">
                Payment processing — please wait while we confirm your transaction.
              </p>
              <p className="text-xs text-amber-300/80 mt-1">
                We are currently awaiting the official server-to-server confirmation. Your registration will automatically activate once confirmed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Checking live gateway status... (Attempt {pollCount}/10)</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => fetchStatus()}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition"
              >
                Refresh Status Now
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-2.5 px-4 border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-sm text-center transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* State 2: Payment Verified & Customer Enrolled */}
        {isConfirmed && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 block">
                Official Confirmation
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Payment Successful — Entry Enrolled
              </h1>
              <p className="text-xs text-slate-400">
                Payment verified successfully. Your official draw entry ticket is active.
              </p>
            </div>

            {/* Lucky Draw Ticket Pass Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-800/80 to-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-400" />
                  <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                    Official Draw Ticket Pass
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ENROLLED
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {paymentData.registration?.concert?.title || 'Grand Pakistan Mega Draw 2027'}
                </h3>
                <div className="flex flex-col gap-1.5 mt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{paymentData.registration?.concert?.venue || '10 Rupai Ka Khail • Pakistan'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {paymentData.registration?.concert?.eventDate
                        ? new Date(paymentData.registration.concert.eventDate).toLocaleDateString('en-PK', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'November 2026'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Unique Admission Ticket Pass Code
                </span>
                <span className="text-xl font-mono font-black text-amber-400 tracking-widest select-all">
                  {paymentData.registration?.enrollment?.ticketCode || 'TKT-CONC-PASS'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div>
                  <span className="block text-slate-500">Attendee:</span>
                  <span className="font-semibold text-slate-200">
                    {paymentData.customer?.fullName}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Amount Paid:</span>
                  <span className="font-semibold text-emerald-400">
                    PKR {paymentData.amountPKR?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Reference:</span>
                  <span className="font-mono text-slate-300 truncate block">
                    {paymentData.internalReference}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Gateway:</span>
                  <span className="font-semibold text-slate-300">
                    Instant Online Checkout
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm text-center transition flex items-center justify-center gap-2"
              >
                <span>View in Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => window.print()}
                className="py-3 px-4 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl text-sm transition"
              >
                Print Pass
              </button>
            </div>
          </div>
        )}

        {/* State 3: Payment Failed or Cancelled */}
        {isFailed && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Incomplete</h1>
            <p className="text-sm text-slate-400">
              The transaction was not completed. Your registration is preserved in pending state so you can retry checkout without filling forms again.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/payment/cancelled?ref=${encodeURIComponent(ref)}`}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm text-center transition"
              >
                Retry Checkout
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-2.5 px-4 border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-sm text-center transition"
              >
                Back to Dashboard
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading payment status...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
