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
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user?.role !== 'ADMIN') {
          router.push('/dashboard');
        } else {
          setCurrentUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const navItems = [
    { name: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Legal & Feature Flags', href: '/admin/compliance', icon: ShieldAlert },
    { name: 'Draws Management', href: '/admin/draws', icon: Trophy },
    { name: 'Registered Users', href: '/admin/users', icon: Users },
    { name: 'Payments & Refunds', href: '/admin/payments', icon: CreditCard },
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
      {/* Top Admin Warning & Breadcrumb */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-300">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>
            <strong>Administrator Control Center</strong> — All modifications are recorded in the immutable audit log.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-white/10 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>User Dashboard</span>
          </Link>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            Role: Chief Admin
          </span>
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
