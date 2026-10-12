'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';

export default function MyPaymentsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  const payments = data?.payments || [];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
          Financial Records
        </span>
        <h1 className="text-2xl font-black text-white">Payment &amp; Transaction History</h1>
        <p className="text-xs text-slate-300 mt-1">
          Complete ledger of entry fee payments and simulated transactions.
        </p>
      </div>

      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">
            Total Transactions: <strong className="text-white">{payments.length}</strong>
          </span>
          <span className="text-emerald-400 font-semibold">
            All records verified via server-side idempotency
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3">Transaction Reference</th>
                <th className="p-3">Draw</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No transactions recorded yet. Join a draw to test simulated payment processing!
                  </td>
                </tr>
              ) : (
                payments.map((pmt: any) => {
                  const isSuccess = pmt.status === 'SUCCESS';
                  const isPending = pmt.status === 'PENDING';
                  const isRefunded = pmt.status === 'REFUNDED';

                  return (
                    <tr key={pmt.id} className="hover:bg-slate-800/20">
                      <td className="p-3 font-mono font-bold text-amber-400">
                        {pmt.transactionRef}
                      </td>
                      <td className="p-3 font-medium text-white">{pmt.draw?.title || 'Mega Draw'}</td>
                      <td className="p-3 font-semibold text-slate-300">
                        {pmt.method === 'JAZZCASH'
                          ? 'JazzCash'
                          : pmt.method === 'EASYPAISA'
                          ? 'Easypaisa'
                          : 'Simulated Wallet'}
                      </td>
                      <td className="p-3 font-bold text-emerald-400">PKR {pmt.amountPKR}</td>
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(pmt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        ) : isRefunded ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <RefreshCw className="w-3 h-3" /> Refunded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
