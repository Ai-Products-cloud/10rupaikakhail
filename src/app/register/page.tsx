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
  KeyRound,
  X,
  Smartphone,
  RefreshCw,
  Clock,
  ArrowLeft
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'PHONE' | 'EMAIL'>('EMAIL');

  // Verification modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Scenario: Capture referral code from query params or localStorage
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

  // Adjust default verification method if one field is empty
  useEffect(() => {
    if (phone.trim() && !email.trim()) {
      setVerificationMethod('PHONE');
    } else if (!phone.trim() && email.trim()) {
      setVerificationMethod('EMAIL');
    }
  }, [phone, email]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (!showOtpModal || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtpModal, resendTimer]);

  const getVerificationTarget = () => {
    return verificationMethod === 'EMAIL' ? email.trim() : phone.trim();
  };

  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpError(null);

    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setError('Please provide at least a mobile number or an email address.');
      return;
    }

    if (verificationMethod === 'PHONE' && !phone.trim()) {
      setError('Please enter your mobile number to verify via phone, or switch to email verification.');
      return;
    }

    if (verificationMethod === 'EMAIL' && !email.trim()) {
      setError('Please enter your email address to verify via email, or switch to phone verification.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    // Call real send-otp API
    await sendOtpRequest();
  };

  const sendOtpRequest = async () => {
    setIsSendingOtp(true);
    setError(null);
    setOtpError(null);

    try {
      const target = getVerificationTarget();
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          type: verificationMethod,
          fullName: fullName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      setOtpCode('');
      setResendTimer(60);
      setShowOtpModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSendingOtp) return;
    await sendOtpRequest();
  };

  const handleConfirmRegistration = async () => {
    if (otpCode.trim().length !== 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone: phone.trim() || null,
          email: email.trim() || null,
          password,
          confirmPassword,
          termsAccepted,
          refCode: refCode.trim() || null,
          verificationMethod,
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Clear cached referral code after successful registration
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refCode');
      }

      setShowOtpModal(false);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setOtpError(err.message || 'An error occurred during verification.');
    } finally {
      setIsVerifying(false);
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
            Join 10kakhail to participate for PKR 10 and get your own verified referral link.
          </p>
        </div>

        {/* Referral Welcome Badge */}
        {refCode && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-3 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">You were referred by a friend!</span>
              <span className="text-[11px] text-slate-400">
                Referral Code: <strong className="font-mono text-amber-300">{refCode}</strong>. Register and enter a draw to reward your friend with a bonus ticket.
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

        <form onSubmit={handleInitiateVerification} className="space-y-4 text-xs">
          {/* Full Name */}
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

          {/* Contact Details */}
          <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-white/5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Contact &amp; Verification Details
            </span>
            <p className="text-[11px] text-slate-400">
              Provide your mobile number, email, or both. Choose which channel to receive your 6-digit verification code.
            </p>

            {/* Mobile Number */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">
                  Mobile Number {verificationMethod === 'PHONE' ? '*' : '(Optional)'}
                </label>
                {phone && (
                  <span className="text-[10px] text-emerald-400 font-medium font-mono">Any valid number</span>
                )}
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">
                  Email Address {verificationMethod === 'EMAIL' ? '*' : '(Optional)'}
                </label>
                <span className="text-[10px] text-slate-400">For draw notifications</span>
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

            {/* Verification Channel Selector */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                Send 6-Digit Verification Code To:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVerificationMethod('EMAIL')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                    verificationMethod === 'EMAIL'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">Email Address</span>
                    <span className="text-[9px] text-slate-400">Receive in Inbox</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVerificationMethod('PHONE')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                    verificationMethod === 'PHONE'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">Mobile Number</span>
                    <span className="text-[9px] text-slate-400">Receive via SMS</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Referral Code (Optional)
            </label>
            <div className="relative">
              <Sparkles className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                placeholder="e.g. 10K-ADMIN786"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono uppercase"
              />
            </div>
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
                I am 18+ years of age, a Pakistani citizen/resident, and accept the{' '}
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

          <button
            type="submit"
            disabled={isSendingOtp}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSendingOtp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending 6-Digit Code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code ({verificationMethod === 'PHONE' ? 'Phone' : 'Email'})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-400 font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </div>

      {/* Real Scenario Verification Modal (NO test OTP displayed) */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 text-white space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold">
                  Verify Your {verificationMethod === 'PHONE' ? 'Mobile Number' : 'Email Address'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                We have sent a 6-digit verification code to:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-white/10 flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {getVerificationTarget()}
                </span>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="text-[10px] text-amber-400 hover:underline font-bold"
                >
                  Change
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Please check your {verificationMethod === 'EMAIL' ? 'email inbox (and spam/junk folder)' : 'SMS messages'} and enter the code below.
              </p>
            </div>

            {otpError && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Enter 6-Digit Code:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-center font-mono text-2xl text-emerald-400 tracking-[0.5em] focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            {/* Resend Code Section */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
              <span className="text-slate-400 text-[11px]">Didn&apos;t receive the code?</span>
              {resendTimer > 0 ? (
                <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  disabled={isSendingOtp}
                  onClick={handleResendOtp}
                  className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRegistration}
                disabled={isVerifying || otpCode.length !== 6}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-xs">
          Loading registration...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
