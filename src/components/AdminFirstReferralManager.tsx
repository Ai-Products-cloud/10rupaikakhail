'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  Phone,
  Sparkles,
  Users,
  UserPlus,
  RefreshCw,
  ExternalLink,
  Edit3,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AdminFirstReferralManager() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Edit root code modal
  const [isEditingRoot, setIsEditingRoot] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Create pioneer modal
  const [isCreatingPioneer, setIsCreatingPioneer] = useState(false);
  const [pioneerName, setPioneerName] = useState('');
  const [pioneerPhone, setPioneerPhone] = useState('');
  const [pioneerCustomCode, setPioneerCustomCode] = useState('');
  const [pioneerLoading, setPioneerLoading] = useState(false);
  const [pioneerError, setPioneerError] = useState<string | null>(null);
  const [pioneerSuccess, setPioneerSuccess] = useState<any>(null);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/referrals');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.rootReferral) {
          setCustomCode(json.rootReferral.referralCode || '');
          setCustomPhone(json.rootReferral.phone || '');
        }
      }
    } catch (err) {
      console.error('Failed to load referral settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (data?.rootReferral?.referralLink) {
      navigator.clipboard.writeText(data.rootReferral.referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (data?.rootReferral?.referralCode) {
      navigator.clipboard.writeText(data.rootReferral.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (data?.rootReferral?.referralLink) {
      const text = encodeURIComponent(
        `Join me on 10 Rupai Ka Khail! Register with my official referral code: ${data.rootReferral.referralCode} and enter for PKR 10 to win a Bike or Smart Mobile! Register here: ${data.rootReferral.referralLink}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleUpdateRootCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ROOT_CODE',
          newReferralCode: customCode,
          newPhone: customPhone,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to update root referral code.');
      }

      setIsEditingRoot(false);
      fetchReferralData();
      alert('Root referral code successfully updated!');
    } catch (err: any) {
      setEditError(err.message || 'Error updating code.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreatePioneer = async (e: React.FormEvent) => {
    e.preventDefault();
    setPioneerError(null);
    setPioneerLoading(true);

    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_PIONEER_REFERRER',
          fullName: pioneerName,
          phone: pioneerPhone,
          customCode: pioneerCustomCode,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to create pioneer account.');
      }

      setPioneerSuccess(resData.pioneer);
      setPioneerName('');
      setPioneerPhone('');
      setPioneerCustomCode('');
      fetchReferralData();
    } catch (err: any) {
      setPioneerError(err.message || 'Error creating pioneer.');
    } finally {
      setPioneerLoading(false);
    }
  };

  const root = data?.rootReferral;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Onboarding &amp; Bootstrap System
            </span>
            <h3 className="text-lg font-black text-white">First Referral &amp; Root Invitation Manager</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingRoot(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-white/10"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Customize First Referral</span>
          </button>
          <button
            onClick={() => {
              setIsCreatingPioneer(true);
              setPioneerSuccess(null);
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-950"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Pioneer Referral</span>
          </button>
        </div>
      </div>

      {/* Main Info Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Active Code */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/10 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Official Root Referral Code
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-black text-amber-400 select-all">
              {root?.referralCode || '10K-ADMIN786'}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Copy code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Anyone can enter this code in the registration form to register.
          </p>
        </div>

        {/* Card 2: Registered Mobile Referrer */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/10 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Referral Mobile Number
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-mono font-bold text-white select-all">
              {root?.phone || '03001234567'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Referrer
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Participants can also enter this mobile number directly as the referral number.
          </p>
        </div>

        {/* Card 3: Referees Joined */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/10 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Directly Onboarded
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-400">
              {root?.totalDirectReferees || 0}
            </span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-400">
            Participants successfully registered via this first referral link.
          </p>
        </div>
      </div>

      {/* Shareable Link Bar */}
      <div className="bg-slate-950/90 rounded-2xl p-4 border border-amber-500/20 space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
          Official First Referral Direct Registration URL
        </span>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            value={root?.referralLink || ''}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono select-all focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Pioneer Ambassadors List if any */}
      {data?.pioneers?.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Starter Pioneer Ambassadors ({data.pioneers.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.pioneers.map((p: any) => (
              <div
                key={p.id}
                className="bg-slate-950/70 border border-white/5 rounded-2xl p-3 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">{p.fullName}</div>
                  <div className="font-mono text-[11px] text-amber-400">{p.referralCode}</div>
                  <div className="text-[10px] text-slate-500">{p.phone}</div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[10px] text-slate-400 block">
                    {p._count?.referralsMade || 0} referred
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(p.referralLink);
                      alert(`Copied link for ${p.fullName}: ${p.referralLink}`);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 rounded-lg"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal 1: Edit Root Referral */}
      {isEditingRoot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Customize Primary Referral</h3>
              <button onClick={() => setIsEditingRoot(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRootCode} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Custom Referral Code (e.g. 10K-FIRST, 10K-OFFICIAL, 10K-MEGA)
                </label>
                <input
                  type="text"
                  required
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 10K-OFFICIAL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  This will be the primary referral code accepted when new participants register.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Admin Referral Mobile Number
                </label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Participants can also enter this phone number directly as their referral number.
                </p>
              </div>

              {editError && (
                <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingRoot(false)}
                  className="flex-1 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Save First Referral</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create Pioneer Ambassador */}
      {isCreatingPioneer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Pioneer Ambassador Account</h3>
              <button onClick={() => setIsCreatingPioneer(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {pioneerSuccess ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Ambassador Account Created!</span>
                  </div>
                  <div className="text-slate-300">
                    <strong>Name:</strong> {pioneerSuccess.fullName}
                  </div>
                  <div className="text-slate-300">
                    <strong>Phone:</strong> {pioneerSuccess.phone}
                  </div>
                  <div className="text-slate-300">
                    <strong>Referral Code:</strong>{' '}
                    <span className="font-mono text-amber-400">{pioneerSuccess.referralCode}</span>
                  </div>
                  <div className="text-slate-300">
                    <strong>Direct Link:</strong>{' '}
                    <span className="font-mono text-xs text-amber-400 break-all">
                      {pioneerSuccess.referralLink}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pioneerSuccess.referralLink);
                      alert('Copied ambassador referral link!');
                    }}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    Copy Ambassador Link
                  </button>
                  <button
                    onClick={() => setIsCreatingPioneer(false)}
                    className="py-2.5 px-4 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreatePioneer} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ambassador / Partner Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={pioneerName}
                    onChange={(e) => setPioneerName(e.target.value)}
                    placeholder="e.g. Asad Malik"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Pakistani Mobile Number (03xx...)
                  </label>
                  <input
                    type="text"
                    required
                    value={pioneerPhone}
                    onChange={(e) => setPioneerPhone(e.target.value)}
                    placeholder="e.g. 03019876543"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Custom Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={pioneerCustomCode}
                    onChange={(e) => setPioneerCustomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 10K-ASAD (auto-generated if blank)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                {pioneerError && (
                  <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{pioneerError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPioneer(false)}
                    className="flex-1 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pioneerLoading}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                  >
                    {pioneerLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    <span>Generate Ambassador Code</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
