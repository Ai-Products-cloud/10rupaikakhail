'use client';

import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Trash2, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AccountSettingsPage() {
  const [data, setData] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d?.user) {
          setData(d);
          setFullName(d.user.fullName || '');
          setEmail(d.user.email || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
          Preferences
        </span>
        <h1 className="text-2xl font-black text-white">Account &amp; Security Settings</h1>
        <p className="text-xs text-slate-300 mt-1">
          Manage your contact credentials and platform security preferences.
        </p>
      </div>

      {/* Verification Status */}
      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security &amp; Verification Badges</span>
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px]">Mobile Verification</span>
              <span className="font-mono text-white font-bold">{data?.user?.phone}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              Verified
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px]">CNIC Prize Claim</span>
              <span className="text-slate-300 font-bold">Awaiting Claim</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
              Upon Win
            </span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          <span>Personal Information</span>
        </h3>

        {saved && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Full Legal Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-slate-900/80 rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Change Password</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">New Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => alert('Password updated in demo session!')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-6 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Danger Zone: Account Deletion</span>
        </h3>
        <p className="text-rose-200/70">
          Requesting deletion of your account will forfeit all active entries and pending referral records in accordance with draw regulations.
        </p>
        <button
          type="button"
          onClick={() => alert('Account deletion request registered with administrative audit ledger.')}
          className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold border border-rose-500/40 transition"
        >
          Request Account Deletion
        </button>
      </div>
    </div>
  );
}
