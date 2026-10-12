'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  ShieldCheck,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

interface SimulatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  draw: {
    id: string;
    title: string;
    entryFeePKR: number;
    endDate: string;
  };
  onSuccess?: (entry: any) => void;
}

export default function SimulatedPaymentModal({
  isOpen,
  onClose,
  draw,
  onSuccess,
}: SimulatedPaymentModalProps) {
  const [method, setMethod] = useState<'JAZZCASH' | 'EASYPAISA' | 'SIMULATED_WALLET'>('JAZZCASH');
  const [accountNumber, setAccountNumber] = useState('0301-2345678');
  const [testScenario, setTestScenario] = useState<'SUCCESS' | 'FAILURE'>('SUCCESS');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedEntry, setConfirmedEntry] = useState<any>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Create payment record
      const initRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawId: draw.id,
          method,
          payerAccount: accountNumber,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        throw new Error(initData.error || 'Failed to initialize payment.');
      }

      // 2. Simulate server-side gateway verification
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: initData.payment.id,
          simulatedSuccess: testScenario === 'SUCCESS',
          otpCode: '7860',
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment verification failed.');
      }

      if (testScenario === 'FAILURE') {
        setError('Simulated payment was declined by the provider (Insufficient balance or simulated test rejection).');
        setIsLoading(false);
        return;
      }

      setConfirmedEntry(verifyData.entry);
      if (onSuccess) onSuccess(verifyData.entry);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ffffff'],
        });
      } catch (e) {}
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment processing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-900/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative text-white max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/50 to-slate-900 flex-shrink-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              Official Entry Checkout
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">{draw.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto overscroll-contain">
          {confirmedEntry ? (
            /* Confirmation Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">Draw Entry Confirmed!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Your ticket has been recorded on the verified draw ledger.
                </p>
              </div>

              <div className="bg-slate-950/80 rounded-2xl p-4 border border-emerald-500/30 text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Entry Reference:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {confirmedEntry.entryNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-400">PKR {draw.entryFeePKR} (Simulated)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Entry Type:</span>
                  <span className="font-semibold text-white">Standard Entry</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Draw Deadline:</span>
                  <span className="text-slate-300">
                    {new Date(draw.endDate).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>
                  Invite friends with your unique link to earn <strong>1 extra entry</strong> for each verified referral!
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/dashboard/entries"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition"
                >
                  View in My Entries
                </Link>
                <Link
                  href="/dashboard/referrals"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>Get Referral Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Entry Form */
            <>
              {/* Fee summary card */}
              <div className="bg-slate-950/70 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Entry Fee:</span>
                  <div className="text-3xl font-black text-amber-400 flex items-baseline gap-1">
                    <span>PKR {draw.entryFeePKR}</span>
                    <span className="text-xs text-slate-400 font-normal">only</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    Sandbox Demo Mode
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">No real money required</p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  Select Simulated Pakistani Wallet:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('JAZZCASH')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      method === 'JAZZCASH'
                        ? 'bg-red-950/60 border-red-500 text-white shadow-lg shadow-red-950'
                        : 'bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-[10px]">
                      JC
                    </div>
                    <span className="text-xs font-bold">JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('EASYPAISA')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      method === 'EASYPAISA'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950'
                        : 'bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                      EP
                    </div>
                    <span className="text-xs font-bold">Easypaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('SIMULATED_WALLET')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      method === 'SIMULATED_WALLET'
                        ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950'
                        : 'bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                      10K
                    </div>
                    <span className="text-xs font-bold">1-Click Test</span>
                  </button>
                </div>
              </div>

              {/* Account Number Input */}
              {method !== 'SIMULATED_WALLET' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    {method === 'JAZZCASH' ? 'JazzCash Account Number' : 'Easypaisa Mobile Number'}:
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Demo Mode Testing Toggles */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10 text-xs space-y-1.5">
                <span className="text-slate-400 font-semibold block">Simulator Response Control:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTestScenario('SUCCESS')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      testScenario === 'SUCCESS'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Simulate Success (Verify Entry)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestScenario('FAILURE')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      testScenario === 'FAILURE'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Simulate Gateway Failure
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Legal Notice */}
              <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-tight">
                <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Demo Mode Active. No real money is collected. All entries, referrals, and rankings are verified using server-side business rules.
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePay}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying with {method}...</span>
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    <span>Confirm PKR 10 Payment &amp; Enter Draw</span>
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
