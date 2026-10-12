'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Trophy, Clock, CheckCircle, ShieldCheck } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import SimulatedPaymentModal from '@/components/SimulatedPaymentModal';

export default function DrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [selectedDraw, setSelectedDraw] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/draws')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.draws) setDraws(data.draws);
      })
      .catch(() => {});
  }, []);

  const handleOpenEnter = (draw: any) => {
    setSelectedDraw(draw);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Official Draws</span>
        <h1 className="text-4xl font-black text-white">Available Lucky Draws</h1>
        <p className="text-sm text-slate-300">
          Select an active draw to participate for PKR 10. Invite friends to earn bonus entries and climb the ranking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {draws.length > 0 ? (
          draws.map((draw) => (
            <div
              key={draw.id}
              className="bg-slate-900/80 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    {draw.status === 'ACTIVE' ? 'Active Lucky Draw' : draw.status}
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/20">
                    PKR {draw.entryFeePKR} Entry Fee
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white mb-2">{draw.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">{draw.description}</p>

                {/* Prizes list */}
                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Available Prizes:
                  </span>
                  {draw.prizes?.map((prize: any) => (
                    <div
                      key={prize.id}
                      className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-4 h-4 ${prize.rank === 1 ? 'text-amber-400' : prize.rank === 2 ? 'text-slate-300' : 'text-amber-600'}`} />
                        <span className="font-semibold text-white">
                          {prize.rank === 1 ? '1st' : prize.rank === 2 ? '2nd' : '3rd'} Prize: {prize.title}
                        </span>
                      </div>
                      <span className="text-amber-400 font-bold">{prize.estimatedValue}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <CountdownTimer targetDate={draw.endDate} label="Closing Deadline:" />
                  <div className="text-xs text-slate-400 text-center sm:text-right">
                    <span className="block font-bold text-white">{draw._count?.entries || 0} Entries</span>
                    <span className="text-[10px]">Verified in Ledger</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleOpenEnter(draw)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Enter Draw for PKR {draw.entryFeePKR}</span>
                </button>
                <Link
                  href="/prizes"
                  className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold text-center transition"
                >
                  View 3D Models
                </Link>
              </div>
            </div>
          ))
        ) : (
          /* Default Draw Card while loading */
          <div className="bg-slate-900/80 border border-emerald-900/40 rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                Active Lucky Draw
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full">
                PKR 10 Entry Fee
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">Grand Pakistan Mega Draw 2027</h2>
            <p className="text-xs text-slate-300">
              The flagship national draw for 2027 featuring 1st Prize Honda CD 70 2027 Model, 2nd Prize iPhone 17 Pro Max, and 3rd Prize Android Flagship.
            </p>
            <button
              onClick={() =>
                handleOpenEnter({
                  id: 'demo-draw-2027',
                  title: 'Grand Pakistan Mega Draw 2027',
                  entryFeePKR: 10,
                  endDate: '2027-03-23T23:59:59Z',
                })
              }
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition"
            >
              Enter Draw for PKR 10
            </button>
          </div>
        )}
      </div>

      {selectedDraw && (
        <SimulatedPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          draw={selectedDraw}
        />
      )}
    </div>
  );
}
