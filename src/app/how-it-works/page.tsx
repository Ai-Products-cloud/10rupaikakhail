import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Users,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Complete Platform Guide</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">How 10kakhail Works</h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          Understand the transparent rules, PKR 10 entry process, verified referral bonus engine, and leaderboard prize selection.
        </p>
      </div>

      {/* Step by Step Breakdown */}
      <div className="space-y-8">
        <div className="bg-slate-900/80 rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              1
            </div>
            <h2 className="text-xl font-extrabold text-white">Step 1: Account Registration &amp; Mobile Verification</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed pl-13">
            Sign up using your legal full name and active Pakistani mobile number (0300 to 0349 series). Your account is immediately secured with encrypted session tokens. You receive a personalized dashboard and an exclusive referral link formatted as:
            <code className="block mt-2 p-3 bg-slate-950 rounded-xl text-emerald-400 font-mono text-xs border border-white/5">
              https://10kakhail.pk/register?ref=10K-YOURCODE
            </code>
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              2
            </div>
            <h2 className="text-xl font-extrabold text-white">Step 2: PKR 10 Draw Entry Workflow</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed pl-13">
            Choose an active draw such as the <strong>Grand Pakistan Mega Draw 2027</strong>. The entry fee is exactly <strong>PKR 10</strong>. During the current compliance sandbox phase, simulated mobile wallets (JazzCash, Easypaisa, or Sandbox 1-Click) are utilized so no real currency is deducted. Once verified server-side, your immutable ticket reference (e.g. <code>10KK-ENT-984321</code>) is issued to your ledger.
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black">
              3
            </div>
            <h2 className="text-xl font-extrabold text-white">Step 3: Referral Bonus Entry Formula</h2>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed pl-13 space-y-3">
            <p>
              Share your referral link on WhatsApp, Facebook, or SMS. When a friend signs up through your link and completes their first verified draw entry:
            </p>
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-emerald-200">
              <strong className="text-white block mb-1">The Rule: Exactly +1 Bonus Entry Per Verified Referral</strong>
              <p className="text-xs">
                If you have 1 initial entry and refer 10 friends who join and verify, you receive 10 bonus entries, giving you a total of <strong>11 eligible entries</strong>!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
              4
            </div>
            <h2 className="text-xl font-extrabold text-white">Step 4: Live Leaderboard &amp; Winner Determination</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed pl-13">
            The primary proposed prize allocation model is <strong>Referral Ranking</strong>. At draw closing date:
          </p>
          <ul className="list-disc pl-18 text-xs text-slate-300 space-y-1.5">
            <li><strong className="text-amber-400">Rank #1:</strong> Wins the First Prize — <strong>Bike</strong></li>
            <li><strong className="text-slate-300">Rank #2:</strong> Wins the Second Prize — <strong>Smart Mobile</strong></li>
            <li><strong className="text-emerald-400">Rank #3:</strong> Wins the Third Prize — <strong>Mobile</strong></li>
          </ul>
          <p className="text-xs text-slate-400 pl-13 pt-2">
            <strong>Tie-Breaking Rule:</strong> If two participants finish with the identical number of verified referrals, the tie is broken by the <em>earliest timestamp</em> at which the referral total was achieved.
          </p>
        </div>
      </div>

      {/* Compliance Box */}
      <div className="p-6 bg-slate-950 border border-amber-600/30 rounded-3xl flex items-start gap-4 text-xs text-slate-400">
        <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-300 text-sm mb-1">Legal Pre-Launch Requirement</h4>
          <p className="leading-relaxed">
            Prior to enabling real payments, formal confirmation from qualified Pakistani legal counsel under the Lotteries Act and Provincial Competition Statutes is mandatory. Until formal certification is logged by the administrator, the entire platform runs in simulated demo mode.
          </p>
        </div>
      </div>
    </div>
  );
}
