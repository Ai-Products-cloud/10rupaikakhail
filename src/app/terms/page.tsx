import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-slate-300 text-sm">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Legal Agreement</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Terms and Conditions of Participation</h1>
        <p className="text-xs text-slate-400">
          Last revised: October 2026 • Governed under the Laws of the Islamic Republic of Pakistan
        </p>
      </div>

      {/* Legal Banner */}
      <div className="p-5 bg-amber-950/30 border border-amber-600/30 rounded-2xl text-amber-200/90 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <AlertTriangle className="w-4 h-4" />
          <span>Statutory Compliance &amp; Demo Sandbox Disclosure</span>
        </div>
        <p>
          Before enabling paid entries, collecting currency, or distributing prizes in production, 10kakhail
          must complete formal compliance review by licensed Pakistani legal counsel under provincial lottery,
          prize competition, and consumer protection frameworks. Until formal certification is rendered,
          real-money payments and paid prize distributions remain strictly disabled.
        </p>
      </div>

      <div className="space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Eligibility</h2>
          <p>
            Participation is open solely to Pakistani citizens holding a valid National Identity Card (CNIC) or Smart NIC who are eighteen (18) years of age or older. Participants must register using a legitimate Pakistani mobile telephone number registered in their name.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Entry Fee &amp; Mode of Operation</h2>
          <p>
            The proposed entry fee for lucky draws is PKR 10. While the platform operates in Sandbox Demo Mode, all transactions are processed through simulated gateways (including simulated JazzCash and Easypaisa test modules). No real funds will be deducted from user accounts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Referral Program &amp; Bonus Entry Mechanics</h2>
          <p>
            Every registered user receives a unique referral hyperlink. When an invited individual completes registration and confirms their initial draw entry, the referring user is awarded exactly one (1) bonus entry for that applicable draw.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-xs text-slate-400 mt-2">
            <li>Bonus entries are issued exactly once per verified referral.</li>
            <li>Self-referrals, cyclic referral loops, and fictitious registrations created to manipulate rankings are strictly fraudulent and result in immediate disqualification.</li>
            <li>Should a qualifying entry be refunded, reversed, or invalidated, any associated referral bonus entry is automatically revoked.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Prize Determination &amp; Referral Ranking</h2>
          <p>
            The proposed primary prize distribution model utilizes referral leaderboard rankings rather than chance-based odds. The first-, second-, and third-ranked participants with the highest verified referrals at draw closure are allocated the First, Second, and Third Prizes respectively, subject to legal counsel ratification.
          </p>
          <p className="text-xs text-slate-400">
            <strong>Tie-Breaking:</strong> In the event of an exact tie in successful referrals, the participant whose verified referral total was achieved at the earliest timestamp takes precedence.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">5. Disclaimers &amp; No Guarantee</h2>
          <p>
            10kakhail does not guarantee winning outcomes, guaranteed earnings, or commercial investment returns. Participation is entirely voluntary.
          </p>
        </section>
      </div>
    </div>
  );
}
