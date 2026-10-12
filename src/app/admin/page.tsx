'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Ticket,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  History,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading admin metrics...</div>;
  }

  const metrics = data?.metrics || {};
  const compliance = data?.compliance || {};
  const auditLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Platform Operations &amp; Metrics</h1>
        <p className="text-xs text-slate-300 mt-1">
          Real-time ledger overview, financial counters, and audit trail.
        </p>
      </div>

      {/* Compliance State Banner */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              Statutory Feature Flag Status: Sandbox Demo
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Real-money payments: <strong className="text-rose-400">DISABLED</strong> • Paid prize allocation: <strong className="text-rose-400">DISABLED</strong> • Demo simulator: <strong className="text-emerald-400">ACTIVE</strong>
          </p>
        </div>
        <Link
          href="/admin/compliance"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs whitespace-nowrap transition"
        >
          Manage Compliance Flags
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Registered Users</span>
          <div className="text-2xl font-black text-white">{metrics.totalUsers || 0}</div>
          <span className="text-[10px] text-emerald-400">All verified accounts</span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Total Draw Entries</span>
          <div className="text-2xl font-black text-white">{metrics.totalEntries || 0}</div>
          <span className="text-[10px] text-slate-400">
            {metrics.standardEntries || 0} std + {metrics.bonusEntries || 0} bonus
          </span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Verified Referrals</span>
          <div className="text-2xl font-black text-emerald-400">{metrics.verifiedReferrals || 0}</div>
          <span className="text-[10px] text-slate-500">
            {metrics.pendingReferrals || 0} pending conversion
          </span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Simulated Gross Rev</span>
          <div className="text-2xl font-black text-amber-400">
            PKR {metrics.totalSimulatedRevenuePKR || 0}
          </div>
          <span className="text-[10px] text-slate-500">
            {metrics.successfulPayments || 0} verified payments
          </span>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Administrative Audit Trail</h3>
          </div>
          <span className="text-[11px] text-slate-400">Cryptographically verifiable</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3">Action</th>
                <th className="p-3">Target</th>
                <th className="p-3">Performed By</th>
                <th className="p-3">Details</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No administrative changes recorded yet. Actions such as flag modifications will appear here.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/20">
                    <td className="p-3 font-mono font-bold text-amber-400">{log.action}</td>
                    <td className="p-3 text-slate-300 font-semibold">{log.targetType}</td>
                    <td className="p-3 text-white">{log.admin?.fullName || 'System'}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{log.details}</td>
                    <td className="p-3 text-right text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
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
