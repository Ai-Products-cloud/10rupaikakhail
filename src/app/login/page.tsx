'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Phone, ArrowRight, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginIdentifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (identifier: string, pass: string) => {
    setLoginIdentifier(identifier);
    setPassword(pass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-400 p-0.5 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-xl font-black text-amber-400">10K</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400">
            Log in to manage your lucky draw entries and referral bonus statistics.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Mobile Number or Email
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="03001234567 or email"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">Password</label>
              <Link href="/forgot-password" className="text-emerald-400 hover:underline text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          New to 10kakhail?{' '}
          <Link href="/register" className="text-emerald-400 font-bold hover:underline">
            Register now
          </Link>
        </div>
      </div>

      {/* Live Admin Credentials Quick-Fill */}
      <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs space-y-3">
        <span className="text-amber-400 font-bold uppercase tracking-wider block text-[10px]">
          Live Administrator Credentials:
        </span>
        <div>
          <button
            type="button"
            onClick={() => handleQuickFill('03001234567', 'AdminPassword123!')}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-500 text-left transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-amber-300 font-bold text-xs block">Chief Administrator</span>
                <span className="text-[10px] text-slate-400 font-mono">03001234567 / admin@10kakhail.pk</span>
              </div>
            </div>
            <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              Quick Fill
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
