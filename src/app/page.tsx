'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Clock,
  Share2,
  AlertTriangle,
  Gift,
  Flame,
  ChevronDown,
} from 'lucide-react';
import PrizeCard3D from '@/components/PrizeCard3D';
import CountdownTimer from '@/components/CountdownTimer';
import LeaderboardTable from '@/components/LeaderboardTable';
import SimulatedPaymentModal from '@/components/SimulatedPaymentModal';

export default function HomePage() {
  const [activeDraw, setActiveDraw] = useState<any>(null);
  const [leaderboardItems, setLeaderboardItems] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    // Capture referral code if present in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('refCode', ref.toUpperCase());
      }
    }

    // Fetch active draw & prizes
    fetch('/api/draws')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.draws?.length > 0) {
          setActiveDraw(data.draws[0]);
        }
      })
      .catch(() => {});

    // Fetch live leaderboard
    fetch('/api/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) {
          setLeaderboardItems(data.items.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  const defaultDraw = activeDraw || {
    id: 'demo-draw-2027',
    title: 'Grand Pakistan Mega Draw 2027',
    entryFeePKR: 10,
    endDate: '2027-03-23T23:59:59Z',
  };

  const faqs = [
    {
      q: 'How does 10kakhail work?',
      a: 'Register an account with your Pakistani mobile number, join the eligible draw with an entry fee of PKR 10, and receive your unique referral link. For every friend you refer who joins and verifies an entry, you earn exactly one additional draw entry!',
    },
    {
      q: 'Why is the platform currently in Sandbox Demo Mode?',
      a: 'In accordance with Pakistani legal regulations and provincial consumer protection statutes, real-money operations are strictly held in demo mode until formal legal clearance is finalized. You can test all features using simulated payments without spending any real money.',
    },
    {
      q: 'How are winners selected?',
      a: 'The primary proposed winner-selection model is referral ranking: the top 3 participants with the highest verified referrals at draw close qualify for 1st Prize (Bike), 2nd Prize (Smart Mobile), and 3rd Prize (Mobile). All ties are broken by the earliest timestamp at which the referral total was achieved.',
    },
    {
      q: 'How many bonus entries can I earn?',
      a: 'There is no limit to your referrals! If you invite 10 verified friends, you earn 10 extra entries in addition to your initial entry, giving you 11 total entries and a much higher leaderboard position.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* Legal & Regulatory Pre-Launch Compliance Warning */}
      <div className="bg-emerald-950/40 border-b border-emerald-500/20 py-2.5 px-4 text-center">
        <p className="text-xs text-emerald-300 font-medium flex items-center justify-center gap-2 flex-wrap">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Pakistan Compliance Notice:</strong> Simulated Demo Mode Active. Real-money operations
            disabled pending formal Pakistani legal counsel review.
          </span>
          <Link href="/terms" className="underline text-amber-300 font-bold ml-1 hover:text-white">
            Learn more
          </Link>
        </p>
      </div>

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 sm:pt-12">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 shadow-lg shadow-emerald-950">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-300">
              Sirf 10 Rupay Mein Bari Jeet
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Pakistan&apos;s Most Rewarding{' '}
            <span className="gold-gradient-text block sm:inline">PKR 10 Lucky Draw</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto px-2">
            Participate in eligible draws for just <strong className="text-amber-400">PKR 10</strong>.
            Earn <strong className="text-emerald-400">+1 Bonus Draw Entry</strong> for every verified friend
            you refer. Climb the live leaderboard to claim Pakistan&apos;s most coveted prizes!
          </p>

          {/* Countdown & Action Buttons */}
          <div className="pt-2 sm:pt-4 flex flex-col items-center gap-5 sm:gap-6">
            <CountdownTimer
              targetDate={defaultDraw.endDate}
              label="Grand Draw Deadline:"
              className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 shadow-xl"
            />

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer min-h-[48px]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Enter Now for PKR 10 (Demo)</span>
              </button>

              <Link
                href="/register"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white border border-white/10 flex items-center justify-center gap-2 transition min-h-[48px]"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Get My Referral Link</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 2: DEDICATED PRIZES ----------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="prizes">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Grand Draw Prizes</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Exclusive Mega Prizes for Draw 2027
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 px-2">
            Inspect genuine prize allocations for Draw 2027. Winners qualify through verified participation and referral rankings.
          </p>
        </div>

        {/* 3 Prize Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* First Prize: Bike */}
          <PrizeCard3D
            rank={1}
            title="Bike"
            tagline="First Prize • Brand New Motorcycle"
            estimatedValue=""
            description="Brand new fuel-efficient motorcycle built for reliable performance, high mileage, and everyday commute across Pakistan."
            eligibility="Eligibility: Verified Pakistani citizen with valid CNIC. Free registration & road tax support included."
            modelType="cd70"
            imageUrl="https://ahsanautos.pk/images/products/cd70-black-2027.webp"
            status="Active in Draw 2027"
            onEnterClick={() => setIsPaymentModalOpen(true)}
          />

          {/* Second Prize: Smart Mobile */}
          <PrizeCard3D
            rank={2}
            title="Smart Mobile"
            tagline="Second Prize • Touchscreen Smart Mobile Phone"
            estimatedValue=""
            description="Modern PTA-approved touchscreen smartphone featuring vibrant high-resolution display, advanced multi-camera array, and all-day battery endurance."
            eligibility="Eligibility: Official PTA-approved brand new sealed box unit with warranty."
            modelType="iphone17"
            imageUrl="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"
            status="Active in Draw 2027"
            onEnterClick={() => setIsPaymentModalOpen(true)}
          />

          {/* Third Prize: Mobile */}
          <PrizeCard3D
            rank={3}
            title="Mobile"
            tagline="Third Prize • Mobile Phone"
            estimatedValue=""
            description="Durable compact mobile phone engineered for loud & clear voice calls, wireless FM entertainment, and ultra-long battery standby."
            eligibility="Eligibility: Official PTA-approved brand new handset with standard warranty."
            modelType="android"
            imageUrl="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
            status="Active in Draw 2027"
            onEnterClick={() => setIsPaymentModalOpen(true)}
          />
        </div>
      </section>

      {/* ----------------- SECTION 3: 3-STEP EXPLANATION ----------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/40 rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Simple &amp; Transparent</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">How It Works in 3 Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-950/60 rounded-2xl p-6 border border-white/5 space-y-4 relative group hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/20">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Register Free Account</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign up with your Pakistani mobile number (03xx). Instantly access your personal dashboard and receive your unique shareable referral link.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/60 rounded-2xl p-6 border border-white/5 space-y-4 relative group hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-xl border border-amber-500/20">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Participate for PKR 10</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter any active lucky draw with a minimal fee of PKR 10 via JazzCash, Easypaisa, or Sandbox Demo mode. Receive an instant entry ticket reference.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/60 rounded-2xl p-6 border border-white/5 space-y-4 relative group hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-xl border border-teal-500/20">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Invite &amp; Earn Bonus Entries</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Share your referral link on WhatsApp. Every verified friend who enters grants you exactly <strong>+1 extra bonus entry</strong> and propels you up the leaderboard!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 4: REFERRAL SYSTEM FORMULA ----------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase">
              <Share2 className="w-3.5 h-3.5" />
              <span>Verified Referral Bonus Formula</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              One Friend Invited = <span className="text-emerald-400">One Additional Draw Entry</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Unlike ordinary lotteries where your chances stay static, 10kakhail gives you complete control.
              The more genuine friends you invite, the more entries you accumulate.
            </p>

            <div className="bg-slate-900/90 rounded-2xl p-5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Example Calculation:</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-950 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Initial Entry</span>
                  <span className="text-lg font-extrabold text-white">1</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">5 Friends Referred</span>
                  <span className="text-lg font-extrabold text-emerald-400">+5</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
                  <span className="text-emerald-400 block text-[11px] font-bold">Total Entries</span>
                  <span className="text-lg font-black text-amber-400">6</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-white/10 transition"
              >
                Read Official Rules
              </Link>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="bg-slate-900/70 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Anti-Fraud &amp; Fairness Guarantees</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Exactly-Once Bonus Issuance</strong>
                  Each referral converts only when the invited participant completes mobile and entry verification.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Strict Anti-Loop Algorithm</strong>
                  Self-referrals, cyclic referral loops, and fraudulent duplicate accounts are automatically detected and disqualified.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Transparent Tie-Breaking</strong>
                  All leaderboard ranking ties are decided based on the earliest timestamp at which the referral total was achieved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 5: LIVE LEADERBOARD PREVIEW ----------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="leaderboard">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Ranking</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">Referral Leaderboard Preview</h2>
            <p className="text-xs text-slate-400 mt-1">
              Top 3 ranked participants are currently positioned for the 1st, 2nd, and 3rd Prizes.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition self-start md:self-auto"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <LeaderboardTable items={leaderboardItems} />
      </section>

      {/* ----------------- SECTION 6: FAQ ACCORDION ----------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Common Questions</span>
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = faqOpen === index;
            return (
              <div
                key={index}
                className="bg-slate-900/70 border border-white/5 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-emerald-300"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
      </section>

      {/* ----------------- SECTION 7: CALL TO ACTION BANNER ----------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black">Ready to Win Your Bike or Smart Mobile?</h2>
            <p className="text-sm text-emerald-100">
              Join thousands of participants across Pakistan. Sign up now, test the PKR 10 entry workflow, and share your link with friends.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-slate-950 text-white font-extrabold text-sm shadow-xl hover:bg-slate-900 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Create Free Account</span>
              </Link>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm backdrop-blur-md border border-white/20 transition"
              >
                Test PKR 10 Simulated Entry
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Simulated Payment Modal */}
      <SimulatedPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        draw={defaultDraw}
      />
    </div>
  );
}
