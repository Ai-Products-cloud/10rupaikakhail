'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Edit, PauseCircle, PlayCircle, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/draws')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d?.draws) setDraws(d.draws);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggleStatus = (drawId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setDraws((prev) =>
      prev.map((d) => (d.id === drawId ? { ...d, status: nextStatus } : d))
    );
    alert(`Draw status updated to ${nextStatus} in audit ledger.`);
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
          Draw Lifecycle
        </span>
        <h1 className="text-2xl font-black text-white">Lucky Draw Management</h1>
        <p className="text-xs text-slate-300 mt-1">
          Configure draw rules, entry fees, deadlines, and prize allocations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {draws.map((draw) => (
          <div
            key={draw.id}
            className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      draw.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    Status: {draw.status}
                  </span>
                  <span className="text-xs text-amber-400 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/20">
                    Fee: PKR {draw.entryFeePKR}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">{draw.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(draw.id, draw.status)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {draw.status === 'ACTIVE' ? (
                    <>
                      <PauseCircle className="w-4 h-4 text-amber-400" />
                      <span>Pause Draw</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 text-emerald-400" />
                      <span>Activate Draw</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Prizes linked */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Allocated 3D Prizes:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {draw.prizes?.map((prize: any) => (
                  <div
                    key={prize.id}
                    className="p-3 bg-slate-950 rounded-2xl border border-white/5 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {prize.rank === 1 ? '1st' : prize.rank === 2 ? '2nd' : '3rd'} Prize
                      </span>
                      <span className="text-amber-400 font-bold">{prize.estimatedValue}</span>
                    </div>
                    <span className="text-slate-300 block font-medium truncate">{prize.title}</span>
                    <span className="text-[10px] text-emerald-400 block">3D Model: {prize.model3dType}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 gap-2">
              <span>Total Entries in Ledger: <strong className="text-white">{draw._count?.entries || 0}</strong></span>
              <span>Deadline: <strong className="text-white font-mono">{new Date(draw.endDate).toLocaleDateString()}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
