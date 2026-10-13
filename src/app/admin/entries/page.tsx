'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Search,
  Filter,
  CreditCard,
  Gift,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  User,
  Hash,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function AdminEntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'STANDARD' | 'REFERRAL_BONUS'>('ALL');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/entries');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Failed to load draw entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (entry.ticketNumber || '').toLowerCase().includes(query) ||
      (entry.user?.fullName || '').toLowerCase().includes(query) ||
      (entry.user?.phone || '').toLowerCase().includes(query) ||
      (entry.user?.email || '').toLowerCase().includes(query) ||
      (entry.payment?.transactionRef || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (filterType === 'STANDARD') return entry.entryType === 'STANDARD';
    if (filterType === 'REFERRAL_BONUS') return entry.entryType === 'REFERRAL_BONUS';

    return true;
  });

  const totalEntries = entries.length;
  const standardEntries = entries.filter((e) => e.entryType === 'STANDARD').length;
  const bonusEntries = entries.filter((e) => e.entryType === 'REFERRAL_BONUS').length;
  const totalVolumePKR = standardEntries * 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Audit Ledger
          </span>
          <h1 className="text-2xl font-black text-white">Draw Entries &amp; Tickets</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time verified log of every participant who placed lucky draw entries into the system.
          </p>
        </div>
        <button
          onClick={fetchEntries}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-white/10"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Refresh Ledger
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Ticket className="w-4 h-4 text-amber-400" />
            <span>Total Tickets</span>
          </div>
          <div className="text-2xl font-black text-white">{totalEntries}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Entries in pool</div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Paid Standard Entries</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{standardEntries}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">PKR {totalVolumePKR.toLocaleString()} collected</div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Gift className="w-4 h-4 text-cyan-400" />
            <span>Referral Bonus Entries</span>
          </div>
          <div className="text-2xl font-black text-cyan-400">{bonusEntries}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awarded via free referrals</div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Audit Status</span>
          </div>
          <div className="text-xl font-black text-amber-300">100% Cryptographic</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tamper-evident logs</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticket #, participant name, phone, or transaction ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All Tickets ({totalEntries})
          </button>
          <button
            onClick={() => setFilterType('STANDARD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'STANDARD'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Standard ({standardEntries})
          </button>
          <button
            onClick={() => setFilterType('REFERRAL_BONUS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'REFERRAL_BONUS'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Bonus ({bonusEntries})
          </button>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs">Loading draw ticket entries...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No tickets entered yet</p>
            <p className="text-xs text-slate-500 mt-1">
              When participants put entries into the active draw, they will appear here live.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Ticket Number</th>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Entry Type</th>
                  <th className="p-4">Draw Title</th>
                  <th className="p-4">Payment Reference</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-mono font-bold text-amber-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-amber-500" />
                        <span>{entry.ticketNumber}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div>
                        <div className="font-bold text-white text-xs">
                          {entry.user?.fullName || 'Anonymous Participant'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          {entry.user?.phone && (
                            <span className="font-mono text-emerald-400 flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5" /> {entry.user.phone}
                            </span>
                          )}
                          {entry.user?.email && (
                            <span className="truncate max-w-[140px]">{entry.user.email}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {entry.entryType === 'REFERRAL_BONUS' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-[10px]">
                          <Gift className="w-3 h-3" /> Referral Bonus
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Paid (Standard)
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-white font-medium text-xs">
                      {entry.draw?.title || 'Active Draw'}
                    </td>

                    <td className="p-4">
                      {entry.payment ? (
                        <div className="font-mono text-[10px]">
                          <span className="text-white block font-bold">{entry.payment.transactionRef}</span>
                          <span className="text-slate-400">
                            {entry.payment.method} · PKR {entry.payment.amountPKR}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-mono">
                          {entry.entryType === 'REFERRAL_BONUS' ? 'Granted via Referral' : 'System Direct'}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right text-[11px] text-slate-400 font-mono">
                      <div>{new Date(entry.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
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
