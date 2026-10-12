import React from 'react';
import Link from 'next/link';
import { Trophy, ShieldCheck, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function WinnersPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
          <Trophy className="w-3.5 h-3.5" />
          <span>Official Verification &amp; Announcements</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">Winners &amp; Results</h1>
        <p className="text-sm text-slate-300">
          Official results and verified prize awards for all completed draws on 10kakhail.
        </p>
      </div>

      {/* Active Draw Status */}
      <div className="bg-slate-900/80 rounded-3xl p-8 border border-emerald-900/40 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <Clock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white">Grand Pakistan Mega Draw 2027 In Progress</h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          The current draw is actively accepting entries. Official results and final winner publication will occur
          upon draw closure following server audit verification.
        </p>
        <div className="pt-2">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition"
          >
            <span>View Current Projected Leaders</span>
          </Link>
        </div>
      </div>

      {/* Winner Determination & Verification Standards */}
      <div className="bg-slate-900/60 rounded-3xl p-8 border border-white/5 space-y-6">
        <h3 className="text-xl font-extrabold text-white">Verification Standards for Winner Publication</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
          <div className="space-y-2">
            <strong className="text-white block font-semibold">1. Ledger Audit</strong>
            <p>Every referral and entry is audited against transaction logs and IP records to eliminate suspicious duplicate accounts.</p>
          </div>
          <div className="space-y-2">
            <strong className="text-white block font-semibold">2. CNIC &amp; SIM Verification</strong>
            <p>Prize claimants must verify Pakistani biometric SIM ownership matching their registered phone number.</p>
          </div>
          <div className="space-y-2">
            <strong className="text-white block font-semibold">3. Public Transparency</strong>
            <p>Final rankings and winning ticket references are permanently recorded on the public ledger.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
