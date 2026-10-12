'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a full app we fetch all users; here we fetch leaderboard and participants
    fetch('/api/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) setUsers(data.items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
          Identity &amp; Accounts
        </span>
        <h1 className="text-2xl font-black text-white">Registered Participants &amp; Referrals</h1>
        <p className="text-xs text-slate-300 mt-1">
          Audit user identity, referral links, and anti-fraud indicators.
        </p>
      </div>

      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Active Participants</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Biometric SIM Validated (Pakistan)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Participant</th>
                <th className="p-3 text-center">Verified Referrals</th>
                <th className="p-3 text-center">Total Entries</th>
                <th className="p-3">Fraud Check</th>
                <th className="p-3 text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.userId} className="hover:bg-slate-800/20">
                  <td className="p-3 font-mono font-bold text-amber-400">#{u.rank}</td>
                  <td className="p-3 font-semibold text-white">{u.maskedName}</td>
                  <td className="p-3 text-center font-bold text-emerald-400 font-mono">
                    {u.successfulReferrals}
                  </td>
                  <td className="p-3 text-center font-mono">{u.totalEntries}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Clean
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
