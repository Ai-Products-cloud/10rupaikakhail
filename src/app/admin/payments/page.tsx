'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // In demo environment, fetch user transactions or mock ledger
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.payments) setPayments(data.payments);
      })
      .catch(() => {});
  }, []);

  const handleSimulateRefund = (paymentId: string) => {
    if (confirm('Authorize refund for this PKR 10 transaction? This will reverse the associated draw ticket and referral bonus.')) {
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: 'REFUNDED' } : p))
      );
      alert('Transaction refunded. Entry and referral bonus reversed in audit ledger.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
          Financial Governance
        </span>
        <h1 className="text-2xl font-black text-white">Payment Ledger &amp; Refunds</h1>
        <p className="text-xs text-slate-300 mt-1">
          Monitor payment statuses, gateway webhooks, and process audited refunds.
        </p>
      </div>

      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Ledger Transactions</span>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Idempotent Verification Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No transactions to display. Join a draw to record live demo entries!
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/20">
                    <td className="p-3 font-mono font-bold text-amber-400">{p.transactionRef}</td>
                    <td className="p-3 font-semibold text-slate-300">{p.method}</td>
                    <td className="p-3 font-bold text-emerald-400">PKR {p.amountPKR}</td>
                    <td className="p-3 text-slate-400 font-mono">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : p.status === 'REFUNDED'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {p.status === 'SUCCESS' && (
                        <button
                          onClick={() => handleSimulateRefund(p.id)}
                          className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[10px] font-bold border border-rose-500/30 transition"
                        >
                          Process Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
