'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ref =
    searchParams.get('ref') ||
    searchParams.get('order_id') ||
    searchParams.get('tracker') ||
    '';

  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    fetch(`/api/payments/${encodeURIComponent(ref)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPaymentData(data);
      })
      .catch((err) => console.error('Failed to load cancelled payment:', err))
      .finally(() => setLoading(false));
  }, [ref]);

  const handleRetryPayment = async () => {
    if (!ref) {
      router.push('/dashboard');
      return;
    }

    try {
      setRetrying(true);
      setError(null);

      const targetId = paymentData?.paymentId || ref;
      const res = await fetch(`/api/payments/${encodeURIComponent(targetId)}/retry`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize retry session.');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Retry checkout could not be initiated.');
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-amber-400 block mb-1">
            Transaction Cancelled
          </span>
          <h1 className="text-2xl font-black text-white">Payment Not Completed</h1>
          <p className="text-sm text-slate-400 mt-2">
            You exited the checkout session or cancelled the transaction. Your registration record remains safely saved in pending state.
          </p>
        </div>

        {paymentData && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Lucky Draw:</span>
              <span className="font-semibold text-slate-200">
                Grand Pakistan Mega Draw 2027
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payable Fee:</span>
              <span className="font-semibold text-amber-400">
                PKR {paymentData.amountPKR?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Internal Reference:</span>
              <span className="font-mono text-slate-300">
                {paymentData.internalReference}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-xs flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            {retrying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Redirecting to Checkout...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment</span>
              </>
            )}
          </button>

          <Link
            href="/dashboard"
            className="w-full py-3 px-4 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Customer Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <PaymentCancelledContent />
    </Suspense>
  );
}
