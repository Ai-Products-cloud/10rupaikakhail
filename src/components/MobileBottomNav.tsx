'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Trophy, Sparkles, LayoutDashboard, Gift } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Draws', href: '/draws', icon: Ticket },
    { name: 'Prize', href: '/prizes', icon: Gift },
    { name: 'Rankings', href: '/leaderboard', icon: Trophy },
    { name: 'Account', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-emerald-900/40 px-2 py-1.5 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] ${
                isActive
                  ? 'text-emerald-400 font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-400' : 'text-slate-400'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
