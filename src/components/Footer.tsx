import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, AlertTriangle, FileText, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-emerald-950/60 pt-16 pb-12 text-slate-400 text-xs">
      {/* Legal & Regulatory Pre-Launch Compliance Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-amber-950/30 border border-amber-600/30 rounded-2xl p-5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center gap-4 text-amber-200/90">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-300 mb-0.5">
              Legal Compliance &amp; Demo Sandbox Disclosure (Pakistan)
            </h4>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              In strict adherence to Pakistani provincial competition, lottery, and consumer protection laws,
              real-money payments and paid prize allocations remain <strong>disabled</strong> on this platform.
              All operations are presented in a sandbox demonstration mode using simulated payments. Real-money
              activation will strictly require formal legal opinion and regulatory clearances.
            </p>
          </div>
          <Link
            href="/terms"
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs whitespace-nowrap transition border border-amber-500/30"
          >
            Review Legal Terms
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/5">
        {/* Brand Col */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-lg font-black text-amber-400">10K</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-white">10ka</span>
                <span className="text-xl font-black text-emerald-400">khail</span>
              </div>
              <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-bold">
                Pakistan
              </span>
            </div>
          </Link>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Pakistan&apos;s transparent, modern online lucky draw platform. Participate for just PKR 10,
            invite your friends with your personalized referral link, and earn verified bonus entries.
          </p>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> 100% Verified Server Draws
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Lock className="w-4 h-4" /> 256-Bit SSL Encrypted
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Explore</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/how-it-works" className="hover:text-emerald-400 transition">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/draws" className="hover:text-emerald-400 transition">
                Available Draws
              </Link>
            </li>
            <li>
              <Link href="/prizes" className="hover:text-emerald-400 transition">
                Prize Showcase
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="hover:text-emerald-400 transition">
                Referral Leaderboard
              </Link>
            </li>
            <li>
              <Link href="/winners" className="hover:text-emerald-400 transition">
                Winners &amp; Results
              </Link>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Legal &amp; Policies</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/terms" className="hover:text-emerald-400 transition">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-emerald-400 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-emerald-400 transition">
                Refund &amp; Cancellation
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-emerald-400 transition">
                FAQ &amp; Rules
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-amber-400 transition">
                Admin Management
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Customer Support</h4>
          <p className="text-slate-400 mb-2">Available 9:00 AM - 9:00 PM PKT</p>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>support@10kakhail.pk</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <p>&copy; 2026-2027 10kakhail. All rights reserved. Designed for Pakistani users.</p>
        <p className="flex items-center gap-3">
          <span>Responsible Participation Policy</span>
          <span>&bull;</span>
          <span>No Guaranteed Outcome Claims</span>
        </p>
      </div>
    </footer>
  );
}
