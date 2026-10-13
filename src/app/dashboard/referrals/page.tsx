'use client';

import React, { useState, useEffect } from 'react';
import { Users, Share2, Copy, Check, Sparkles, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export default function MyReferralsPage() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [currentOrigin, setCurrentOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  const referralUrl = data?.user?.referralCode
    ? `${currentOrigin || (typeof window !== 'undefined' ? window.location.origin : '')}/register?ref=${data.user.referralCode}`
    : data?.referralLink || '';

  const handleCopy = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (referralUrl) {
      const text = encodeURIComponent(
        `Join me on 10kakhail! Enter the Grand Mega Draw for just PKR 10 and win Honda CD 70 2027 or iPhone 17 Pro Max! Register here: ${referralUrl}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const referrals = data?.referrals || [];
  const successfulCount = referrals.filter((r: any) => r.status === 'VERIFIED').length;
  const pendingCount = referrals.filter((r: any) => r.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
          Referral Management
        </span>
        <h1 className="text-2xl font-black text-white">My Referrals &amp; Bonus Entries</h1>
        <p className="text-xs text-slate-300 mt-1">
          Earn +1 free lucky draw entry for every friend who registers and enters an eligible draw.
        </p>
      </div>

      {/* Sharing Card */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white">Share Your Invitation Link</h2>
          </div>
          <span className="text-xs text-amber-400 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/20">
            Code: {data?.user?.referralCode}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-emerald-400 font-mono select-all focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link' : 'Copy'}</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <span>Share via WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400">Verified Successful Referrals</span>
          <div className="text-2xl font-black text-emerald-400">{successfulCount}</div>
          <span className="text-[10px] text-slate-500">Each earned +1 bonus entry</span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400">Pending Referrals</span>
          <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
          <span className="text-[10px] text-slate-500">Awaiting first eligible draw entry</span>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400">Total Bonus Entries Earned</span>
          <div className="text-2xl font-black text-white">{successfulCount}</div>
          <span className="text-[10px] text-slate-500">Credited to your draw ledger</span>
        </div>
      </div>

      {/* Referral History Table */}
      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white">Referral Activity History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3">Invited Contact</th>
                <th className="p-3">Mobile (Masked)</th>
                <th className="p-3">Registration Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Bonus Awarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No referrals recorded yet. Copy your referral link above and share it on WhatsApp to begin earning bonus entries!
                  </td>
                </tr>
              ) : (
                referrals.map((ref: any) => {
                  const isVerified = ref.status === 'VERIFIED';
                  const maskedPhone = ref.referee?.phone
                    ? `${ref.referee.phone.slice(0, 4)}-***${ref.referee.phone.slice(-4)}`
                    : '—';

                  return (
                    <tr key={ref.id} className="hover:bg-slate-800/20">
                      <td className="p-3 font-semibold text-white">
                        {ref.referee?.fullName || 'Participant'}
                      </td>
                      <td className="p-3 font-mono text-slate-400">{maskedPhone}</td>
                      <td className="p-3 text-slate-400">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> Pending Entry
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-300">
                        {isVerified ? '+1 Entry' : '0'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
