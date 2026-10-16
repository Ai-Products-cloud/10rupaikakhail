'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Search,
  Filter,
  ArrowDownLeft,
  Clock,
  Phone,
  User,
  Music,
  Ticket,
  Calendar,
  XCircle,
  AlertTriangle,
  FileText,
  Trophy,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'concert' | 'draw'>('concert');
  
  // Concert payments state
  const [concertPayments, setConcertPayments] = useState<any[]>([]);
  const [concertMetrics, setConcertMetrics] = useState<any>({
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    cancelledTransactions: 0,
    refundedTransactions: 0,
    totalRevenuePKR: 0,
  });

  // Draw payments state (for backwards compatibility)
  const [drawPayments, setDrawPayments] = useState<any[]>([]);
  const [drawMetrics, setDrawMetrics] = useState<any>({
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    refundedTransactions: 0,
    totalRevenuePKR: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterProvider, setFilterProvider] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reconciliation modal state
  const [reconcileModalPayment, setReconcileModalPayment] = useState<any | null>(null);
  const [reconcileAction, setReconcileAction] = useState<'APPROVE_MANUAL' | 'REVERSE_REFUND' | 'MARK_FAILED'>('APPROVE_MANUAL');
  const [reconcileReason, setReconcileReason] = useState('');
  const [reconcileEvidence, setReconcileEvidence] = useState('');
  const [reconcileSubmitting, setReconcileSubmitting] = useState(false);
  const [reconcileError, setReconcileError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [filterStatus, filterProvider, startDate, endDate]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.set('status', filterStatus);
      if (filterProvider !== 'ALL') params.set('provider', filterProvider);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setConcertPayments(data.concertPayments || []);
        if (data.concertMetrics) setConcertMetrics(data.concertMetrics);
        setDrawPayments(data.drawPayments || data.payments || []);
        if (data.drawMetrics) setDrawMetrics(data.drawMetrics);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReconcile = (payment: any) => {
    setReconcileModalPayment(payment);
    setReconcileAction(payment.status === 'SUCCEEDED' ? 'REVERSE_REFUND' : 'APPROVE_MANUAL');
    setReconcileReason('');
    setReconcileEvidence('');
    setReconcileError(null);
  };

  const submitReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileModalPayment) return;

    if (!reconcileReason.trim() || reconcileReason.trim().length < 5) {
      setReconcileError('A valid audit reason (minimum 5 characters) is mandatory.');
      return;
    }

    if (reconcileAction === 'APPROVE_MANUAL' && (!reconcileEvidence.trim() || reconcileEvidence.trim().length < 3)) {
      setReconcileError('An external evidence reference (e.g. Bank TID, Safepay tracker) is required.');
      return;
    }

    try {
      setReconcileSubmitting(true);
      setReconcileError(null);

      const res = await fetch(`/api/admin/payments/${reconcileModalPayment.id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reconcileAction,
          reason: reconcileReason,
          evidenceRef: reconcileEvidence,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Reconciliation failed');
      }

      alert(`Success: Payment reconciled with audit log ID: ${data.auditLogId}`);
      setReconcileModalPayment(null);
      fetchPayments();
    } catch (err: any) {
      setReconcileError(err.message || 'Failed to submit reconciliation.');
    } finally {
      setReconcileSubmitting(false);
    }
  };

  // Filtered concert payments with client search
  const filteredConcertPayments = concertPayments.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    const ref = (p.internalReference || '').toLowerCase();
    const provRef = (p.providerReference || '').toLowerCase();
    const name = (p.registration?.user?.fullName || '').toLowerCase();
    const phone = (p.registration?.user?.phone || '').toLowerCase();
    const email = (p.registration?.user?.email || '').toLowerCase();
    const title = (p.registration?.concert?.title || '').toLowerCase();
    const ticket = (p.registration?.enrollment?.ticketCode || '').toLowerCase();

    return (
      ref.includes(q) ||
      provRef.includes(q) ||
      name.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      title.includes(q) ||
      ticket.includes(q)
    );
  });

  // Filtered draw payments
  const filteredDrawPayments = drawPayments.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      (p.transactionRef || '').toLowerCase().includes(q) ||
      (p.user?.fullName || '').toLowerCase().includes(q) ||
      (p.user?.phone || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Financial Ledger &amp; Provider Monitoring
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Payment &amp; Enrollment Ledger</h1>
          <p className="text-xs text-slate-300 mt-1">
            Safepay hosted checkout monitoring, automated webhook verification, and audit reconciliation.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('concert')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'concert'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Safepay Draw Transactions ({concertPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('draw')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'draw'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>PKR 10 Lucky Draw Transactions ({drawPayments.length})</span>
        </button>
      </div>

      {/* Concert Tab Content */}
      {activeTab === 'concert' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Total Concert Revenue</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                PKR {concertMetrics.totalRevenuePKR?.toLocaleString('en-PK')}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                {concertMetrics.successfulTransactions} verified payments
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Enrolled Attendees</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {concertMetrics.successfulTransactions}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Active admission passes
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Pending Authorizations</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">
                {concertMetrics.pendingTransactions}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Awaiting Safepay webhook
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>Failed / Refunded</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-300">
                {concertMetrics.failedTransactions + concertMetrics.refundedTransactions}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {concertMetrics.refundedTransactions} refunded
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by customer name, email, phone, reference, or ticket code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCEEDED">Succeeded</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>

              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Gateways</option>
                <option value="SAFEPAY">Safepay</option>
                <option value="JAZZCASH">JazzCash</option>
                <option value="BANK_TRANSFER">Bank Transfer / Raast</option>
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                title="Start Date"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                title="End Date"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-slate-900/90 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Concert &amp; References</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Enrollment &amp; Ticket</th>
                    <th className="py-3 px-4">Timestamps</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredConcertPayments.length > 0 ? (
                    filteredConcertPayments.map((p) => {
                      const user = p.registration?.user;
                      const concert = p.registration?.concert;
                      const enrollment = p.registration?.enrollment;

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          {/* Customer */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{user?.fullName || 'Anonymous'}</div>
                            <div className="text-[11px] text-slate-400">{user?.email || 'No email'}</div>
                            <div className="text-[11px] font-mono text-slate-500">{user?.phone || 'No phone'}</div>
                          </td>

                          {/* Concert & References */}
                          <td className="py-3 px-4 space-y-0.5">
                            <div className="font-semibold text-slate-200">
                              {concert?.title || 'Concert'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Internal: <span className="font-mono text-amber-400 select-all">{p.internalReference}</span>
                            </div>
                            {p.providerReference && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                Tracker: {p.providerReference}
                              </div>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">
                              PKR {(p.amountPaisa / 100).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {p.amountPaisa} paisa
                            </div>
                          </td>

                          {/* Provider */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {p.provider}
                            </span>
                          </td>

                          {/* Payment Status */}
                          <td className="py-3 px-4">
                            {p.status === 'SUCCEEDED' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                SUCCEEDED
                              </span>
                            )}
                            {p.status === 'PENDING' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                PENDING
                              </span>
                            )}
                            {p.status === 'FAILED' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                FAILED
                              </span>
                            )}
                            {p.status === 'CANCELLED' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
                                CANCELLED
                              </span>
                            )}
                            {p.status === 'REFUNDED' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                REFUNDED
                              </span>
                            )}
                          </td>

                          {/* Enrollment & Ticket Pass */}
                          <td className="py-3 px-4">
                            {enrollment ? (
                              <div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                  ENROLLED
                                </span>
                                <div className="text-[11px] font-mono font-bold text-amber-400 mt-0.5 select-all">
                                  {enrollment.ticketCode}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Not Enrolled</span>
                            )}
                          </td>

                          {/* Timestamps */}
                          <td className="py-3 px-4 text-[11px] text-slate-400 space-y-0.5">
                            <div>Created: {new Date(p.createdAt).toLocaleString()}</div>
                            {p.verifiedAt && (
                              <div className="text-emerald-400">
                                Verified: {new Date(p.verifiedAt).toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenReconcile(p)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition"
                            >
                              Reconcile
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No concert payments match the specified filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Draw Tab Content (Preserved for backwards compatibility) */}
      {activeTab === 'draw' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Transaction Ref</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDrawPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-amber-400">{p.transactionRef}</td>
                      <td className="py-3 px-4 text-white">{p.user?.fullName}</td>
                      <td className="py-3 px-4 text-white">PKR {p.amountPKR || 10}</td>
                      <td className="py-3 px-4 text-slate-300">{p.method}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Reconciliation Modal */}
      {reconcileModalPayment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Manual Audit Reconciliation</h3>
              </div>
              <button
                onClick={() => setReconcileModalPayment(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Customer: </span>
                <span className="font-semibold text-white">
                  {reconcileModalPayment.registration?.user?.fullName} ({reconcileModalPayment.registration?.user?.phone || 'No phone'})
                </span>
              </div>
              <div>
                <span className="text-slate-400">Internal Ref: </span>
                <span className="font-mono text-amber-400">{reconcileModalPayment.internalReference}</span>
              </div>
              <div>
                <span className="text-slate-400">Current Status: </span>
                <span className="font-bold text-white">{reconcileModalPayment.status}</span>
              </div>
              <div>
                <span className="text-slate-400">Amount: </span>
                <span className="font-bold text-emerald-400">PKR {reconcileModalPayment.amountPaisa / 100}</span>
              </div>
            </div>

            <form onSubmit={submitReconciliation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reconciliation Action</label>
                <select
                  value={reconcileAction}
                  onChange={(e) => setReconcileAction(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="APPROVE_MANUAL">Approve &amp; Issue Ticket Pass (Manual Verification)</option>
                  <option value="REVERSE_REFUND">Refund &amp; Revoke Admission Pass</option>
                  <option value="MARK_FAILED">Mark Transaction as Failed</option>
                </select>
              </div>

              {reconcileAction === 'APPROVE_MANUAL' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Evidence Reference <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meezan Bank Slip #89123 or Safepay Tracker ID"
                    value={reconcileEvidence}
                    onChange={(e) => setReconcileEvidence(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Proof of payment must be verified independently before overriding.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Compliance Audit Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why this manual reconciliation is justified (logged permanently in AuditLog)..."
                  value={reconcileReason}
                  onChange={(e) => setReconcileReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {reconcileError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-2.5 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{reconcileError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReconcileModalPayment(null)}
                  className="flex-1 py-2.5 px-4 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reconcileSubmitting}
                  className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  {reconcileSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Confirm Reconciliation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
