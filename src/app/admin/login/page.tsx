'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Phone, ArrowRight, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
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
        throw new Error(data.error || 'Admin authentication failed.');
      }

      if (data.user?.role !== 'ADMIN') {
        throw new Error(
          'Access Denied: This portal is restricted to authorized platform administrators only.'
        );
      }

      // Successful Admin Authentication
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during admin sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              10 Rupai Ka Khail • Security Portal
            </span>
            <h1 className="text-2xl font-black text-white">Administrator Sign In</h1>
            <p className="text-xs text-slate-400">
              Authorized access only. All administrative logins and actions are strictly audited.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Admin Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. 03001234567 or admin@10kakhail.pk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-amber-500 text-sm font-mono placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Admin Secret Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-amber-500 text-sm placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></span>
                  <span>Verifying Credentials...</span>
                </span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800">
            <Link
              href="/login"
              className="text-xs text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Participant Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
