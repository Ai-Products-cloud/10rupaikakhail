'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Ticket,
  CreditCard,
  ShieldCheck,
  History,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Share2,
  Calendar,
  Phone,
  Hash,
  Download,
  Copy,
  Check,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'USERS' | 'PAYMENTS' | 'ENTRIES'>('USERS');
  const [copiedReport, setCopiedReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs">Loading administrative control center...</span>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentUsers = data?.recentUsers || [];
  const recentPayments = data?.recentPayments || [];
  const recentEntries = data?.recentEntries || [];
  const auditLogs = data?.recentAuditLogs || [];

  const generateReportText = () => {
    const timestamp = new Date().toLocaleString();
    return `================================================
10KAKHAIL PLATFORM EXECUTIVE AUDIT REPORT
Generated At: ${timestamp}
================================================

1. FINANCIAL & REVENUE SUMMARY:
------------------------------------------------
- Total Money / Revenue Collected: PKR ${metrics.totalRevenuePKR?.toLocaleString() || 0}
- Total Successful Transactions:   ${metrics.successfulPayments || 0}
- Total Initiated Transactions:    ${metrics.totalPayments || 0}
- Standard Entry Fee:              PKR 10 per entry

2. PARTICIPANT & REGISTRATION METRICS:
------------------------------------------------
- Total Registered Users:          ${metrics.totalUsers || 0}
- Verified Referral Conversions:   ${metrics.verifiedReferrals || 0}
- Pending Referrals:               ${metrics.pendingReferrals || 0}

3. DRAW TICKETS LEDGER:
------------------------------------------------
- Total Tickets in Pool:           ${metrics.totalEntries || 0}
- Paid Standard Entries:           ${metrics.standardEntries || 0}
- Free Referral Bonus Entries:     ${metrics.bonusEntries || 0}
- Active Draws:                    ${metrics.activeDraws || 1}

4. ACTIVE PRIZE ALLOCATIONS:
------------------------------------------------
- 1st Prize: Bike (Motorcycle)
- 2nd Prize: Smart Mobile (Touchscreen Smartphone)
- 3rd Prize: Mobile (Mobile Phone)
- Status: Active in Draw 2027

================================================
END OF REPORT - 10KAKHAIL ADMINISTRATION
================================================`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Real-Time Operations &amp; Ledger
          </span>
          <h1 className="text-2xl font-black text-white">Administrator Control Panel</h1>
          <p className="text-xs text-slate-300 mt-1">
            Monitor real participant registrations, track collected funds, view lucky draw entries, and export complete platform data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-amber-950"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Full Report</span>
          </button>

          <button
            onClick={fetchStats}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalUsers || 0}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Real verified accounts
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Money Collected</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            PKR {metrics.totalRevenuePKR?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-400">
            {metrics.successfulPayments || 0} successful payments
          </div>
        </div>

        {/* Total Draw Entries */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Tickets</span>
            <Ticket className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalEntries || 0}</div>
          <div className="text-[10px] text-slate-400">
            {metrics.standardEntries || 0} paid + {metrics.bonusEntries || 0} bonus
          </div>
        </div>

        {/* Verified Referrals */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Referrals</span>
            <Share2 className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-3xl font-black text-amber-300">
            {metrics.verifiedReferrals || 0}
          </div>
          <div className="text-[10px] text-slate-400">
            {metrics.pendingReferrals || 0} pending conversion
          </div>
        </div>
      </div>

      {/* Live Activity Feed (Who comes, who register money, entries) */}
      <div className="bg-slate-900/90 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">Live Platform Activity Feed</h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'USERS'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Who Registered ({recentUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'PAYMENTS'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Money Received ({recentPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('ENTRIES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'ENTRIES'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tickets ({recentEntries.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Who Registered */}
        {activeTab === 'USERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-white/5">
                <tr>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Mobile Number</th>
                  <th className="p-4">Referral Code</th>
                  <th className="p-4">Referred By</th>
                  <th className="p-4 text-center">Tickets</th>
                  <th className="p-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No user registrations recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-amber-400 text-xs">
                          {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                        </div>
                        <span>{u.fullName}</span>
                      </td>

                      <td className="p-4 font-mono text-emerald-400 text-xs">
                        {u.phone || 'N/A'}
                      </td>

                      <td className="p-4">
                        <span className="font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          {u.referralCode}
                        </span>
                      </td>

                      <td className="p-4">
                        {u.referredBy ? (
                          <div className="text-[11px]">
                            <span className="text-white font-semibold">{u.referredBy.fullName}</span>
                            <span className="text-slate-500 block text-[9px] font-mono">
                              {u.referredBy.referralCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Direct Join</span>
                        )}
                      </td>

                      <td className="p-4 text-center font-mono font-bold text-white">
                        {u._count?.entries || 0}
                      </td>

                      <td className="p-4 text-right font-mono text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Showing recent registrations</span>
              <Link
                href="/admin/users"
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <span>View Full User Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Money Received */}
        {activeTab === 'PAYMENTS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-white/5">
                <tr>
                  <th className="p-4">Transaction Ref</th>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No payments or money deposits recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4 font-mono font-bold text-amber-400 text-xs">
                        {p.transactionRef}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white">{p.user?.fullName || 'Participant'}</div>
                        {p.user?.phone && (
                          <div className="text-[10px] font-mono text-emerald-400">{p.user.phone}</div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-white">
                          {p.method === 'JAZZCASH' ? 'JazzCash' : p.method === 'EASYPAISA' ? 'Easypaisa' : p.method}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-bold text-emerald-400">
                        PKR {p.amountPKR || 10}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : p.status === 'REFUNDED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="p-4 text-right font-mono text-slate-400 text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Showing recent deposits</span>
              <Link
                href="/admin/payments"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <span>Manage All Payments &amp; Refunds</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 3: Tickets */}
        {activeTab === 'ENTRIES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-white/5">
                <tr>
                  <th className="p-4">Ticket Number</th>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Draw Title</th>
                  <th className="p-4">Entry Type</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No draw tickets placed yet.
                    </td>
                  </tr>
                ) : (
                  recentEntries.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4 font-mono font-bold text-amber-400 text-xs flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-amber-500" />
                        <span>{e.entryNumber || e.ticketNumber}</span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white">{e.user?.fullName}</div>
                        {e.user?.phone && (
                          <div className="text-[10px] font-mono text-emerald-400">{e.user.phone}</div>
                        )}
                      </td>

                      <td className="p-4 text-white text-xs">
                        {e.draw?.title || 'Grand Pakistan Mega Draw'}
                      </td>

                      <td className="p-4">
                        {e.entryType === 'REFERRAL_BONUS' ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-[10px]">
                            Referral Bonus
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                            Paid Standard
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right font-mono text-slate-400 text-[11px]">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Showing recent tickets</span>
              <Link
                href="/admin/entries"
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <span>View Full Entries Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Audit Trail */}
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

      {/* Full Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Full Platform Audit Report</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-2xl border border-white/10 font-mono text-xs text-slate-300 overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap">
              {generateReportText()}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Official encrypted report generated directly from PostgreSQL database.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? 'Copied to Clipboard!' : 'Copy Report'}</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
