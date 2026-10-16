'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Phone,
  Lock,
  User,
  Mail,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { isValidPakistaniPhone } from '@/lib/phoneValidation';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Capture referral code from URL query param (?ref=...) or localStorage
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      const cleanRef = refParam.toUpperCase();
      setRefCode(cleanRef);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refCode', cleanRef);
      }
    } else if (typeof window !== 'undefined') {
      const cachedRef = localStorage.getItem('refCode');
      if (cachedRef) {
        setRefCode(cachedRef.toUpperCase());
      }
    }
  }, [searchParams]);

  const isPhoneEligible = phone ? isValidPakistaniPhone(phone) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    if (!phone.trim()) {
      setError('Please provide an eligible Pakistani mobile number.');
      return;
    }

    if (!isValidPakistaniPhone(phone)) {
      setError(
        'Invalid mobile number. Please enter an eligible Pakistani mobile number (11 digits starting with 03xx, e.g. 03001234567).'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and password confirmation do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!refCode.trim()) {
      setError('Referral Number or Referral Code is required. You cannot register without a referral.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          password,
          confirmPassword,
          termsAccepted,
          refCode: refCode.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Clear cached referral code
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refCode');
      }

      // Direct entry to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
      <div className="bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-400 p-0.5 mx-auto shadow-lg shadow-emerald-950">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-xl font-black text-amber-400">10K</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Create Your Account</h1>
          <p className="text-xs text-slate-400">
            Join 10kakhail to participate for PKR 10. Direct registration with eligible Pakistani numbers.
          </p>
        </div>

        {/* Referral Welcome Banner */}
        {refCode && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-3 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Referred by a Friend</span>
              <span className="text-[11px] text-slate-400">
                Referral Code: <strong className="font-mono text-amber-300">{refCode}</strong>. You will be successfully registered under this referral.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Legal Name */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Full Legal Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Muhammad Usman"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Pakistani Mobile Number */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">
                Pakistani Mobile Number *
              </label>
              {phone && (
                <span
                  className={`text-[10px] font-semibold flex items-center gap-1 ${
                    isPhoneEligible ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isPhoneEligible ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Eligible Pakistani Number
                    </>
                  ) : (
                    'Must be 03xx (11 digits)'
                  )}
                </span>
              )}
            </div>
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
            <div className="mt-1.5 p-2 bg-slate-950/60 rounded-lg border border-white/5 text-[10px] text-slate-400 space-y-0.5">
              <div className="flex items-center gap-1 text-slate-300 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>PTA Eligible Networks: Jazz (030x/032x), Zong (031x), Ufone (033x), Telenor (034x), SCO (0355)</span>
              </div>
              <p className="text-slate-500">
                Direct registration — no SMS/OTP confirmation code required.
              </p>
            </div>
          </div>

          {/* Email Address (Optional) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">Email Address (Optional)</label>
              <span className="text-[10px] text-slate-500">For draw notifications</span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. usman@example.com"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
              />
            </div>
          </div>

          {/* Referral Number or Code (Mandatory) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">
                Referral Number or Code *
              </label>
              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                <Gift className="w-3 h-3 text-amber-400" /> Mandatory to Register
              </span>
            </div>
            <div className="relative">
              <Sparkles className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                placeholder="e.g. 03001234567 or 10K-ADMIN786"
                className="w-full bg-slate-950 border border-amber-500/30 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-amber-400 text-sm font-mono uppercase"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Enter the mobile number or referral code of the member who invited you. Registration is not permitted without a referral.
            </span>
          </div>

          {/* Password */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded bg-slate-950 border-white/20 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 leading-tight">
                I am 18+ years of age, a Pakistani resident, and accept the{' '}
                <Link href="/terms" className="text-emerald-400 hover:underline">
                  Terms &amp; Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-emerald-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-3 border-t border-white/10">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
