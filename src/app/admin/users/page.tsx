'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Share2,
  Ticket,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Gift,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  UserPlus
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'REFERRED' | 'DIRECT' | 'HAS_REFEREES'>('ALL');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (u.fullName || '').toLowerCase().includes(query) ||
      (u.phone || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.referralCode || '').toLowerCase().includes(query) ||
      (u.referredBy?.fullName || '').toLowerCase().includes(query) ||
      (u.referredBy?.referralCode || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (filterType === 'REFERRED') return !!u.referredBy;
    if (filterType === 'DIRECT') return !u.referredBy;
    if (filterType === 'HAS_REFEREES') return (u.referralTracking?.length || 0) > 0;

    return true;
  });

  const totalUsers = users.length;
  const referredUsersCount = users.filter((u) => u.referredBy).length;
  const directUsersCount = totalUsers - referredUsersCount;
  const totalReferralsGenerated = users.reduce((acc, u) => acc + (u.referralTracking?.length || 0), 0);

  const toggleExpand = (userId: string) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Real Participant Ledger
          </span>
          <h1 className="text-2xl font-black text-white">Users &amp; Referral Network</h1>
          <p className="text-xs text-slate-300 mt-1">
            Track real registrations, examine who joined with each referral code, and verify bonus entries.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-white/10"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Refresh Data
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Total Registered</span>
          </div>
          <div className="text-2xl font-black text-white">{totalUsers}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Real user accounts</div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Joined Via Referral</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{referredUsersCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totalUsers > 0 ? `${Math.round((referredUsersCount / totalUsers) * 100)}% of user base` : '0%'}
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Direct Registrations</span>
          </div>
          <div className="text-2xl font-black text-cyan-400">{directUsersCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Organic platform joins</div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Gift className="w-4 h-4 text-amber-300" />
            <span>Total Referees Joined</span>
          </div>
          <div className="text-2xl font-black text-amber-300">{totalReferralsGenerated}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Successful link invites</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or referral code..."
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
            All ({totalUsers})
          </button>
          <button
            onClick={() => setFilterType('REFERRED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'REFERRED'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Referred ({referredUsersCount})
          </button>
          <button
            onClick={() => setFilterType('DIRECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'DIRECT'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Direct ({directUsersCount})
          </button>
          <button
            onClick={() => setFilterType('HAS_REFEREES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'HAS_REFEREES'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Has Referees ({users.filter((u) => (u.referralTracking?.length || 0) > 0).length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs">Loading registered participants...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No participants found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or check registration database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Contact &amp; Status</th>
                  <th className="p-4">Referral Code</th>
                  <th className="p-4">Referred By</th>
                  <th className="p-4 text-center">Referees Joined</th>
                  <th className="p-4 text-center">Entries</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => {
                  const referees = user.referralTracking || [];
                  const isExpanded = expandedUserId === user.id;

                  return (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-slate-800/30 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-amber-400 text-xs">
                              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{user.fullName || 'Anonymous'}</span>
                                {user.role === 'ADMIN' && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-white font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.email && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span className="truncate max-w-[150px]">{user.email}</span>
                            </div>
                          )}
                          <div>
                            <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {user.verificationMethod || 'Verified'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-mono font-bold text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/20 text-xs">
                            {user.referralCode}
                          </span>
                        </td>

                        <td className="p-4">
                          {user.referredBy ? (
                            <div className="space-y-0.5">
                              <div className="font-semibold text-white flex items-center gap-1 text-[11px]">
                                <span className="text-emerald-400 font-bold">Via:</span>
                                <span>{user.referredBy.fullName || 'User'}</span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                Code: <span className="text-amber-300">{user.referredBy.referralCode}</span>
                              </div>
                              {user.referredBy.phone && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {user.referredBy.phone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                              Direct Join (None)
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          {referees.length > 0 ? (
                            <button
                              onClick={() => toggleExpand(user.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition"
                            >
                              <Users className="w-3 h-3" />
                              <span>{referees.length} Referees</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 ml-0.5" />
                              ) : (
                                <ChevronDown className="w-3 h-3 ml-0.5" />
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-500 text-xs font-mono">0</span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <div className="font-mono font-bold text-white text-xs">
                            {user._count?.entries || 0}
                          </div>
                          <span className="text-[9px] text-slate-400">
                            PKR {(user._count?.entries || 0) * 10}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          {referees.length > 0 && (
                            <button
                              onClick={() => toggleExpand(user.id)}
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
                            >
                              {isExpanded ? 'Hide Network' : 'Show Network'}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Referral Tree Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-950/70 border-b border-amber-500/20">
                          <td colSpan={7} className="p-4 sm:p-6">
                            <div className="bg-slate-900 rounded-2xl p-4 border border-amber-500/30 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <UserPlus className="w-4 h-4 text-amber-400" />
                                  <span className="font-bold text-xs text-white">
                                    Participants who joined using {user.fullName}&apos;s code ({user.referralCode}):
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Total: {referees.length} invited
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {referees.map((ref: any) => (
                                  <div
                                    key={ref.id}
                                    className="p-3 bg-slate-950 rounded-xl border border-white/10 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-white">
                                        {ref.referee?.fullName || 'Anonymous Participant'}
                                      </span>
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                          ref.bonusEntryAwarded
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        }`}
                                      >
                                        {ref.bonusEntryAwarded ? 'Bonus Credited' : 'Pending Entry'}
                                      </span>
                                    </div>

                                    {ref.referee?.phone && (
                                      <div className="text-[10px] font-mono text-slate-300 flex items-center gap-1">
                                        <Phone className="w-2.5 h-2.5 text-emerald-400" />
                                        <span>{ref.referee.phone}</span>
                                      </div>
                                    )}

                                    {ref.referee?.email && (
                                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Mail className="w-2.5 h-2.5 text-slate-500" />
                                        <span className="truncate">{ref.referee.email}</span>
                                      </div>
                                    )}

                                    <div className="text-[9px] text-slate-500 pt-1 border-t border-white/5 flex items-center justify-between">
                                      <span>Joined:</span>
                                      <span>
                                        {new Date(ref.createdAt || ref.referee?.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
