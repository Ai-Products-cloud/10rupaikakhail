'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  FileCheck,
  Save,
} from 'lucide-react';

export default function AdminCompliancePage() {
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [legalNote, setLegalNote] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.compliance) {
          setCompliance(data.compliance);
          setLegalNote(data.compliance.legalReviewNotes || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggle = async (key: string, currentValue: boolean) => {
    const newValue = !currentValue;

    if (key === 'REAL_MONEY_PAYMENTS_ENABLED' && newValue === true) {
      const confirmed = window.confirm(
        'LEGAL COMPLIANCE WARNING:\nEnabling real-money payment collection requires documented confirmation from licensed Pakistani legal counsel under provincial lottery regulations.\n\nAre you sure you wish to enable this feature flag?'
      );
      if (!confirmed) return;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: newValue,
          legalCounselNote: legalNote,
        }),
      });

      if (res.ok) {
        setCompliance((prev: any) => ({
          ...prev,
          [key === 'REAL_MONEY_PAYMENTS_ENABLED'
            ? 'realMoneyEnabled'
            : key === 'PAID_PRIZE_DRAWS_ENABLED'
            ? 'paidPrizeDrawsEnabled'
            : key === 'REFERRAL_BONUS_ENABLED'
            ? 'referralBonusEnabled'
            : 'demoModeActive']: newValue,
        }));
        setSuccessMsg(`Setting ${key} updated and recorded in audit log.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      alert('Failed to update setting');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'LEGAL_REVIEW_NOTES',
          value: legalNote,
          legalCounselNote: 'Counsel opinion updated by admin',
        }),
      });
      setSuccessMsg('Legal counsel notes saved successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      alert('Failed to save notes');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
          Regulatory Controls
        </span>
        <h1 className="text-2xl font-black text-white">Legal Compliance &amp; Feature Flags</h1>
        <p className="text-xs text-slate-300 mt-1">
          All real-money and paid-prize features default to disabled until formal Pakistani legal review.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Feature Flags Grid */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Independent Operational Feature Flags</span>
        </h3>

        <div className="space-y-4 divide-y divide-white/5">
          {/* Real Money Payments Flag */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">Real-Money Payment Processing</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Critical
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Enables live payment gateways (JazzCash / Easypaisa merchant API). Must remain disabled until formal counsel opinion.
              </p>
            </div>
            <button
              onClick={() => handleToggle('REAL_MONEY_PAYMENTS_ENABLED', compliance?.realMoneyEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                compliance?.realMoneyEnabled
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {compliance?.realMoneyEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Paid Prize Draws Flag */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-white text-xs">Paid Prize Allocation &amp; Distribution</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Permits final award and physical handover of paid draw prizes.
              </p>
            </div>
            <button
              onClick={() => handleToggle('PAID_PRIZE_DRAWS_ENABLED', compliance?.paidPrizeDrawsEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                compliance?.paidPrizeDrawsEnabled
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {compliance?.paidPrizeDrawsEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Referral Bonus Issuance Flag */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-white text-xs">Referral Bonus Issuance Engine</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically awards +1 bonus entry per verified referee.
              </p>
            </div>
            <button
              onClick={() => handleToggle('REFERRAL_BONUS_ENABLED', compliance?.referralBonusEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                compliance?.referralBonusEnabled
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {compliance?.referralBonusEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Demo Sandbox Mode Flag */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-white text-xs">Sandbox Demo Simulator</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Enables testing with simulated wallets without actual cash collection.
              </p>
            </div>
            <button
              onClick={() => handleToggle('DEMO_MODE_ACTIVE', compliance?.demoModeActive)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                compliance?.demoModeActive
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {compliance?.demoModeActive ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>
        </div>
      </div>

      {/* Legal Counsel Review Record */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 shadow-xl">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Pakistani Legal Counsel Review Documentation</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Legal Opinion Notes &amp; Statutory References:
            </label>
            <textarea
              rows={4}
              value={legalNote}
              onChange={(e) => setLegalNote(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <button
            onClick={handleSaveNotes}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Legal Record to Audit Log</span>
          </button>
        </div>
      </div>
    </div>
  );
}
