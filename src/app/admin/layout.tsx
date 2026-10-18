'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Users,
  Trophy,
  History,
  FileCheck,
  ArrowLeft,
  AlertTriangle,
  Ticket,
  Volume2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(pathname !== '/admin/login');

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user?.role !== 'ADMIN') {
          router.push('/admin/login');
        } else {
          setCurrentUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [router, pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users & Referrals', href: '/admin/users', icon: Users },
    { name: 'Draw Entries Ledger', href: '/admin/entries', icon: Ticket },
    { name: 'Draws & Time Controls', href: '/admin/draws', icon: Trophy },
    { name: 'Sound & System Settings', href: '/admin/settings', icon: Volume2 },
    { name: 'Payments & Refunds', href: '/admin/payments', icon: CreditCard },
    { name: 'Legal & Feature Flags', href: '/admin/compliance', icon: ShieldAlert },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying Admin Permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Admin Bar */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-3 text-amber-300">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-wide">
              10KAKHAIL • Platform Administration
            </div>
            <div className="text-[11px] text-slate-400">
              Audit-Enforced Management System
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">
              {currentUser?.fullName || currentUser?.email || 'Chief Admin'}
            </span>
          </div>

          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/admin/login');
              router.refresh();
            }}
            className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-bold transition flex items-center gap-1.5"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Nav (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-2">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-3 shadow-xl space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Mobile Horizontal Scrollable Tab Bar (lg:hidden) */}
        <div className="lg:hidden col-span-1 -mt-2">
          <div className="overflow-x-auto flex items-center gap-2 pb-2 scrollbar-none -mx-4 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex-shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                      : 'bg-slate-900/90 text-slate-300 border border-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <section className="lg:col-span-3 min-w-0">{children}</section>
      </div>
    </div>
  );
}
