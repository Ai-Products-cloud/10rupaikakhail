'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Clock,
  Edit3,
  PauseCircle,
  PlayCircle,
  StopCircle,
  CheckCircle2,
  AlertTriangle,
  Save,
  X,
  Users,
  Ticket,
  Sliders,
  Calendar,
  Layers
} from 'lucide-react';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDrawId, setEditingDrawId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    status: string;
    endDate: string;
    maxTotalEntries: number;
    maxEntriesPerUser: number;
    title: string;
  }>({
    status: 'ACTIVE',
    endDate: '',
    maxTotalEntries: 5000,
    maxEntriesPerUser: 50,
    title: '',
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/draws');
      if (res.ok) {
        const d = await res.json();
        if (d?.draws) setDraws(d.draws);
      }
    } catch (err) {
      console.error('Failed to load draws:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (drawId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/draws/${drawId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setDraws((prev) =>
          prev.map((d) => (d.id === drawId ? { ...d, status: nextStatus } : d))
        );
        showNotice('success', `Draw status successfully updated to ${nextStatus}.`);
      } else {
        showNotice('error', 'Failed to update draw status.');
      }
    } catch (err) {
      showNotice('error', 'Network error changing status.');
    }
  };

  const startEditing = (draw: any) => {
    // Convert UTC date to local ISO format for datetime-local input
    const d = new Date(draw.endDate);
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setEditForm({
      status: draw.status,
      endDate: localIso,
      maxTotalEntries: draw.maxTotalEntries || 5000,
      maxEntriesPerUser: draw.maxEntriesPerUser || 50,
      title: draw.title,
    });
    setEditingDrawId(draw.id);
  };

  const saveEdit = async (drawId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/draws/${drawId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editForm.status,
          endDate: new Date(editForm.endDate).toISOString(),
          maxTotalEntries: editForm.maxTotalEntries,
          maxEntriesPerUser: editForm.maxEntriesPerUser,
          title: editForm.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraws((prev) => prev.map((d) => (d.id === drawId ? data.draw : d)));
        setEditingDrawId(null);
        showNotice('success', 'Draw limits and time controls saved successfully.');
      } else {
        const err = await res.json();
        showNotice('error', err.error || 'Failed to save draw settings.');
      }
    } catch (err) {
      showNotice('error', 'Network error saving changes.');
    } finally {
      setSaving(false);
    }
  };

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const applyTimeExtension = (hours: number) => {
    const current = editForm.endDate ? new Date(editForm.endDate) : new Date();
    const updated = new Date(current.getTime() + hours * 60 * 60 * 1000);
    const localIso = new Date(updated.getTime() - updated.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEditForm((prev) => ({ ...prev, endDate: localIso }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Draw Controls &amp; Cutoffs
          </span>
          <h1 className="text-2xl font-black text-white">Lucky Draw Management</h1>
          <p className="text-xs text-slate-300 mt-1">
            Control draw deadlines (&quot;after how much time off the entries&quot;), maximum capacity caps, and active statuses.
          </p>
        </div>
        <button
          onClick={fetchDraws}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-white/10"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Refresh
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-3xl border border-white/10">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs">Loading lucky draws...</span>
        </div>
      ) : draws.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-3xl border border-white/10">
          <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No lucky draws initialized</p>
        </div>
      ) : (
        <div className="space-y-6">
          {draws.map((draw) => {
            const isEditing = editingDrawId === draw.id;
            const isExpired = new Date(draw.endDate).getTime() <= Date.now();
            const totalEntries = draw._count?.entries || 0;
            const maxCap = draw.maxTotalEntries || 5000;
            const percentageFilled = Math.min(100, Math.round((totalEntries / maxCap) * 100));

            return (
              <div
                key={draw.id}
                className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl"
              >
                {/* Main Card Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          draw.status === 'ACTIVE' && !isExpired
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : draw.status === 'PAUSED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isExpired && draw.status === 'ACTIVE' ? 'DEADLINE EXPIRED' : draw.status}
                      </span>
                      <span className="text-xs text-amber-400 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/20">
                        PKR {draw.entryFeePKR} / Ticket
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-white/5">
                        Max Per User: <strong className="text-white">{draw.maxEntriesPerUser || 50}</strong>
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{draw.title}</h2>
                    <p className="text-xs text-slate-400">{draw.description}</p>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {draw.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleQuickStatusChange(draw.id, 'PAUSED')}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <PauseCircle className="w-4 h-4" />
                        <span>Pause Entries</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickStatusChange(draw.id, 'ACTIVE')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Resume Entries</span>
                      </button>
                    )}

                    {draw.status !== 'CLOSED' && (
                      <button
                        onClick={() => handleQuickStatusChange(draw.id, 'CLOSED')}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <StopCircle className="w-4 h-4" />
                        <span>Close Draw</span>
                      </button>
                    )}

                    <button
                      onClick={() => (isEditing ? setEditingDrawId(null) : startEditing(draw))}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/10"
                    >
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>{isEditing ? 'Cancel Edit' : 'Edit Time & Limits'}</span>
                    </button>
                  </div>
                </div>

                {/* Edit Form Drawer */}
                {isEditing && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/40 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-bold text-white">
                          Configure Draw Limits &amp; Entry Cutoff Time
                        </h3>
                      </div>
                      <button
                        onClick={() => setEditingDrawId(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Status */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 block">Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="ACTIVE">ACTIVE (Accepting Entries)</option>
                          <option value="PAUSED">PAUSED (Temporarily Suspended)</option>
                          <option value="CLOSED">CLOSED (Entries Off Permanently)</option>
                        </select>
                      </div>

                      {/* Cutoff Date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 block">
                          Cutoff Deadline (Off Entries Time)
                        </label>
                        <input
                          type="datetime-local"
                          value={editForm.endDate}
                          onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Max Total Entries */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 block">
                          Max Total Entries (Platform Cap)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100000"
                          value={editForm.maxTotalEntries}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              maxTotalEntries: parseInt(e.target.value, 10) || 5000,
                            })
                          }
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Max Entries Per User */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 block">
                          Max Entries Per User
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={editForm.maxEntriesPerUser}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              maxEntriesPerUser: parseInt(e.target.value, 10) || 50,
                            })
                          }
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Quick Time Extension Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-semibold">Quick Deadline:</span>
                        <button
                          type="button"
                          onClick={() => applyTimeExtension(1)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                        >
                          +1 Hour
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTimeExtension(6)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                        >
                          +6 Hours
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTimeExtension(24)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                        >
                          +24 Hours (1 Day)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTimeExtension(168)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                        >
                          +7 Days
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingDrawId(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => saveEdit(draw.id)}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Capacity Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-amber-400" />
                      Entry Capacity: <strong className="text-white font-mono">{totalEntries}</strong> /{' '}
                      <strong className="text-white font-mono">{maxCap}</strong> tickets filled
                    </span>
                    <span className="font-mono font-bold text-amber-400">{percentageFilled}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentageFilled}%` }}
                    />
                  </div>
                </div>

                {/* Draw Prizes Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Prizes:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {draw.prizes?.map((prize: any) => (
                      <div
                        key={prize.id}
                        className="p-3 bg-slate-950 rounded-2xl border border-white/5 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">
                            {prize.rank === 1 ? '1st Prize' : prize.rank === 2 ? '2nd Prize' : '3rd Prize'}
                          </span>
                          <span className="text-amber-400 font-bold">{prize.estimatedValue}</span>
                        </div>
                        <span className="text-slate-300 block font-medium truncate">{prize.title}</span>
                        <span className="text-[10px] text-emerald-400 block">{prize.tagline}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Time & Cutoff Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cutoff Deadline:</span>
                    <strong className="text-white font-mono">
                      {new Date(draw.endDate).toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpired ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Entries Closed (Time Elapsed)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Active &amp; Accepting Entries
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
