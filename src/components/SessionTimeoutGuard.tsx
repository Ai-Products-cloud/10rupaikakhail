'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AlertCircle, Clock } from 'lucide-react';

export default function SessionTimeoutGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Fetch timeout minutes configured by Admin
  useEffect(() => {
    fetch('/api/sound-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sessionTimeoutMinutes) {
          setTimeoutMinutes(data.sessionTimeoutMinutes);
        }
      })
      .catch(() => {});
  }, []);

  // Update activity timestamp on user interaction
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (isWarningVisible) {
        setIsWarningVisible(false);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isWarningVisible]);

  // Inactivity check interval
  useEffect(() => {
    const isAuthRoute =
      pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

    if (!isAuthRoute) return;

    const intervalMs = 1000; // Check every second
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = Math.max(30000, timeoutMs - 60000); // 1 min before logout

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= timeoutMs) {
        // Session Expired: Log user out
        clearInterval(timerRef.current);
        fetch('/api/auth/logout', { method: 'POST' })
          .finally(() => {
            router.push('/login?reason=session_expired');
            router.refresh();
          });
      } else if (elapsed >= warningMs) {
        const remainingSec = Math.max(1, Math.round((timeoutMs - elapsed) / 1000));
        setSecondsRemaining(remainingSec);
        setIsWarningVisible(true);
      } else {
        setIsWarningVisible(false);
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname, timeoutMinutes, router]);

  if (!isWarningVisible) return null;

  return (
    <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-top duration-300 max-w-sm">
      <div className="bg-amber-950/95 border border-amber-500/60 rounded-2xl p-4 text-white shadow-2xl backdrop-blur-md space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Session Inactivity Notice</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Due to admin inactivity security policy, your session will expire in{' '}
          <strong className="text-amber-300 font-mono text-sm">{secondsRemaining}s</strong>. Move your mouse or tap to stay logged in.
        </p>
      </div>
    </div>
  );
}
