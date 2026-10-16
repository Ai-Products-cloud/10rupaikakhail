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
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    refundedTransactions: 0,
    totalRevenuePKR: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'REFUNDED'>('ALL');
  const [isRefunding, setIsRefunding] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    const reason = prompt('Please enter a reason for this refund:', 'Customer requested / audit reversal');
    if (reason === null) return;

    setIsRefunding(paymentId);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to refund payment');
      }

      alert('Payment refunded successfully. Associated draw entries have been reversed.');
      fetchPayments();
    } catch (err: any) {
      alert(err.message || 'Refund error occurred');
    } finally {
      setIsRefunding(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (p.transactionRef || '').toLowerCase().includes(query) ||
      (p.user?.fullName || '').toLowerCase().includes(query) ||
      (p.user?.phone || '').toLowerCase().includes(query) ||
      (p.method || '').toLowerCase().includes(query) ||
      (p.payerAccount || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Financial Ledger &amp; Money Transactions
          </span>
          <h1 className="text-2xl font-black text-white">Payments &amp; Revenue Ledger</h1>
          <p className="text-xs text-slate-300 mt-1">
            Track who deposited money, monitor JazzCash/Easypaisa transactions, and manage refunds.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-white/10"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Total Money Collected</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            PKR {metrics.totalRevenuePKR?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {metrics.successfulTransactions || 0} successful deposits
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Total Transactions</span>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.totalTransactions || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">All initiated payments</div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Pending Approvals</span>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {metrics.pendingTransactions || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting gateway sync</div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
            <span>Refunded</span>
          </div>
          <div className="text-2xl font-black text-rose-400">
            {metrics.refundedTransactions || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Reversed transactions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref #, participant name, phone, or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All ({metrics.totalTransactions || 0})
          </button>
          <button
            onClick={() => setFilterStatus('SUCCESS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'SUCCESS'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Success ({metrics.successfulTransactions || 0})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'PENDING'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Pending ({metrics.pendingTransactions || 0})
          </button>
          <button
            onClick={() => setFilterStatus('REFUNDED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'REFUNDED'
                ? 'bg-rose-500 text-white shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Refunded ({metrics.refundedTransactions || 0})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs">Loading transaction records...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No transactions recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              When participants register money or pay the PKR 10 entry fee, their transactions appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Method &amp; Account</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date &amp; Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-mono font-bold text-amber-400 text-xs">
                      {p.transactionRef}
                    </td>

                    <td className="p-4">
                      <div>
                        <div className="font-bold text-white text-xs">
                          {p.user?.fullName || 'Anonymous Participant'}
                        </div>
                        {p.user?.phone && (
                          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" /> {p.user.phone}
                          </div>
                        )}
                        {p.user?.referralCode && (
                          <div className="text-[9px] text-slate-500 font-mono">
                            Ref: {p.user.referralCode}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-white">
                        {p.method === 'JAZZCASH' ? (
                          <span className="text-red-400">JazzCash</span>
                        ) : p.method === 'EASYPAISA' ? (
                          <span className="text-emerald-400">Easypaisa</span>
                        ) : (
                          p.method
                        )}
                      </div>
                      {p.payerAccount && (
                        <div className="text-[10px] font-mono text-slate-400">
                          {p.payerAccount}
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-400 text-xs">
                      PKR {p.amountPKR || 10}
                    </td>

                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      <div>{new Date(p.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : p.status === 'REFUNDED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {p.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {p.status === 'REFUNDED' && <ArrowDownLeft className="w-3 h-3 text-rose-400" />}
                        {p.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-400" />}
                        <span>{p.status}</span>
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {p.status === 'SUCCESS' && (
                        <button
                          onClick={() => handleRefund(p.id)}
                          disabled={isRefunding === p.id}
                          className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[11px] font-bold border border-rose-500/30 transition disabled:opacity-50"
                        >
                          {isRefunding === p.id ? 'Reversing...' : 'Refund'}
                        </button>
                      )}
                      {p.status === 'REFUNDED' && (
                        <span className="text-[10px] text-slate-500 italic">Reversed in Ledger</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
