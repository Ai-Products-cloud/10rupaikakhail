'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface SimulatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  draw?: {
    id: string;
    title: string;
    entryFeePKR: number;
    endDate?: string;
  };
  onSuccess?: (entry: any) => void;
}

export default function SimulatedPaymentModal({
  isOpen,
  onClose,
  draw,
  onSuccess,
}: SimulatedPaymentModalProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState<{
    ticketCode?: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingUser(true);
    setError(null);
    setAlreadyEnrolled(null);

    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          setCurrentUser(data.user);
          // Check if already enrolled in active concert / lucky draw
          const primaryReg = data.concertRegistrations?.[0];
          if (primaryReg?.status === 'ENROLLED' && primaryReg?.enrollment) {
            setAlreadyEnrolled({
              ticketCode: primaryReg.enrollment.ticketCode,
            });
          }
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {
        if (isMounted) setCurrentUser(null);
      })
      .finally(() => {
        if (isMounted) setLoadingUser(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const drawTitle = draw?.title || 'Grand Pakistan Mega Draw 2027';
  const entryFee = draw?.entryFeePKR || 10;

  const handleProceedToSafepay = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'SAFEPAY',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.status === 'ENROLLED') {
          setAlreadyEnrolled({ ticketCode: data.ticketCode });
          setIsSubmitting(false);
          return;
        }
        throw new Error(data.error || 'Failed to initiate Safepay checkout session.');
      }

      if (data.checkoutUrl) {
        // Redirect customer directly to official Safepay hosted checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from payment gateway.');
      }
    } catch (err: any) {
      setError(err.message || 'Payment initiation error.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative text-white max-h-[92dvh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/60 to-slate-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                Official Entry Checkout
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">{drawTitle}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto overscroll-contain">
          {loadingUser ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
              <p className="text-xs text-slate-400">Verifying participant account...</p>
            </div>
          ) : !currentUser ? (
            /* Unauthenticated State: Prompt Register / Login */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">
                  Account Required to Enter Draw
                </h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  To ensure your draw ticket is officially recorded and eligible to win the Bike or Mobile prizes, you must sign in or register first.
                </p>
              </div>

              {/* Fee notice */}
              <div className="bg-slate-950/70 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Official Entry Fee:</span>
                <span className="text-xl font-black text-amber-400">PKR {entryFee}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/register"
                  onClick={onClose}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs text-center transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Register with Referral Code</span>
                </Link>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 border border-white/10"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Log In to Existing Account</span>
                </Link>
              </div>
            </div>
          ) : alreadyEnrolled ? (
            /* Already Enrolled State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">You Are Already Enrolled!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Your official draw ticket has already been verified and recorded.
                </p>
              </div>

              <div className="bg-slate-950/80 rounded-2xl p-4 border border-emerald-500/30 text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Your Ticket Code:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {alreadyEnrolled.ticketCode || 'TKT-CONFIRMED'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-400">Active Entry • Eligible for Draw</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Authenticated Checkout Form */
            <>
              {/* Fee summary card */}
              <div className="bg-slate-950/70 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Official Entry Fee:</span>
                  <div className="text-3xl font-black text-amber-400 flex items-baseline gap-1">
                    <span>PKR {entryFee}</span>
                    <span className="text-xs text-slate-400 font-normal">only</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/40 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Entry</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Single Entry Qualification</p>
                </div>
              </div>

              {/* Participant info */}
              <div className="p-3.5 bg-slate-950/50 rounded-2xl border border-white/10 text-xs space-y-1">
                <span className="text-slate-400 text-[11px] block">Registered Participant:</span>
                <div className="flex items-center justify-between text-white font-semibold">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>{currentUser.fullName}</span>
                  </span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {currentUser.phone || currentUser.email}
                  </span>
                </div>
              </div>

              {/* Gateway Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Payment Method:
                </label>
                <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Instant Online Checkout
                        </span>
                        <span className="text-[10px] text-emerald-400 block">
                          Direct Bank, Card &amp; Raast Processing
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  {/* Supported Methods badges */}
                  <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-[10px] text-slate-300">
                    <span className="px-2 py-1 bg-slate-900 rounded-lg border border-white/5">
                      💳 Debit / Credit Cards (Visa, MC, PayPak)
                    </span>
                    <span className="px-2 py-1 bg-slate-900 rounded-lg border border-white/5">
                      ⚡ Raast Instant Pay
                    </span>
                    <span className="px-2 py-1 bg-slate-900 rounded-lg border border-white/5">
                      📱 Supported Wallets &amp; NetBanking
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Security guarantee */}
              <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-tight">
                <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  You will be securely redirected to the official checkout page to complete your PKR 10 entry fee. Upon confirmation, your verified ticket pass is generated automatically.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleProceedToSafepay}
                disabled={isSubmitting}
                className="w-full py-4 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting to Secure Checkout...</span>
                  </span>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 text-amber-300" />
                    <span>Pay PKR 10 &amp; Enter Draw</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
