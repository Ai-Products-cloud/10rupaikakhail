'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Sparkles, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function MyEntriesPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  const entries = data?.entries || [];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
          Draw Tickets
        </span>
        <h1 className="text-2xl font-black text-white">My Entries Ledger</h1>
        <p className="text-xs text-slate-300 mt-1">
          All standard entries and referral bonus entries registered under your account.
        </p>
      </div>

      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            Total Active Tickets: <strong className="text-white">{entries.length}</strong>
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Server-Side Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3">Entry Reference</th>
                <th className="p-3">Draw Name</th>
                <th className="p-3">Entry Type</th>
                <th className="p-3">Registration Date</th>
                <th className="p-3">Draw Closes</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No tickets registered yet. Enter an active draw for PKR 10 or refer friends to earn bonus entries!
                  </td>
                </tr>
              ) : (
                entries.map((entry: any) => {
                  const isBonus = entry.entryType === 'REFERRAL_BONUS';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/20">
                      <td className="p-3 font-mono font-bold text-amber-400">
                        {entry.entryNumber}
                      </td>
                      <td className="p-3 font-medium text-white">{entry.draw?.title}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isBonus
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isBonus ? <Sparkles className="w-3 h-3 text-amber-400" /> : <Ticket className="w-3 h-3 text-emerald-400" />}
                          <span>{isBonus ? 'Referral Bonus' : 'Standard Entry'}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-slate-400 font-mono">
                        {entry.draw?.endDate
                          ? new Date(entry.draw.endDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="p-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
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
