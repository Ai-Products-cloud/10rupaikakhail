'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck } from 'lucide-react';

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is 10kakhail?',
      a: '10kakhail is a Pakistani online lucky draw platform featuring a PKR 10 entry fee model paired with an incentive referral structure. Participants can enter draws and refer friends to earn extra entries and climb the leaderboard for top prizes.',
    },
    {
      q: 'How does the PKR 10 entry fee work?',
      a: 'When you select an active draw, you initiate a payment of PKR 10 using supported channels (simulated JazzCash, Easypaisa, or 1-Click Sandbox). Once verified server-side, a unique ticket reference is permanently registered under your account.',
    },
    {
      q: 'How do referral bonus entries work?',
      a: 'Every user gets an exclusive referral link. When an invited contact registers and completes their first eligible draw entry, the referrer is awarded exactly one (1) bonus draw entry for that draw. For example: 1 standard entry + 5 verified referrals = 6 total entries.',
    },
    {
      q: 'What prizes are available?',
      a: 'In the Grand 2027 Mega Draw, there are three primary prizes: First Prize is a brand-new Honda CD 70 2027 Model Pakistani motorcycle; Second Prize is an iPhone 17 Pro Max; and Third Prize is an Android Flagship Smartphone. You can view full details of each prize on our Prize page.',
    },
    {
      q: 'How is the winner selected?',
      a: 'The primary proposed model is Referral Ranking: the participants who finish 1st, 2nd, and 3rd on the referral leaderboard when the draw closes are awarded the First, Second, and Third prizes respectively. Ties are broken by the earliest timestamp at which the referral total was achieved.',
    },
    {
      q: 'Why does the website say "Demo Sandbox Mode"?',
      a: 'Under Pakistani law, real-money collections and paid prize draws must be formally cleared by legal counsel under provincial lottery and competition regulations. To maintain full transparency and compliance, the platform currently operates in demo mode using simulated payments.',
    },
    {
      q: 'Can I refer myself using multiple SIM cards?',
      a: 'No. Our automated anti-fraud algorithm detects self-referrals, identical device fingerprints, and cyclical referral patterns. Any fraudulent attempts will result in immediate reversal of bonus entries and disqualification.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-4xl font-black text-white">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-300">
          Everything you need to know about entries, referrals, rules, and compliance on 10kakhail.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-emerald-300 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
