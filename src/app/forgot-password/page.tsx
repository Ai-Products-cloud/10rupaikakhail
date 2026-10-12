'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone) {
      setSent(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-8 shadow-2xl space-y-6">
        <h1 className="text-2xl font-black text-white text-center">Reset Password</h1>
        <p className="text-xs text-slate-400 text-center">
          Enter your registered Pakistani mobile number to receive an OTP verification code.
        </p>

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Simulated OTP Sent!</h3>
            <p className="text-xs text-slate-300">
              In demo mode, your simulated reset code is <strong className="text-emerald-400 font-mono">7860</strong>.
            </p>
            <Link
              href="/login"
              className="inline-block py-2.5 px-6 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Registered Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2"
            >
              <span>Send Recovery Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
