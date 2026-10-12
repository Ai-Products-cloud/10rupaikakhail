'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Menu, X, User, LogIn, LayoutDashboard, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check session on mount
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Close mobile drawer on route change or escape
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Available Draws', href: '/draws' },
    { name: 'Prizes (3D)', href: '/prizes' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Winners', href: '/winners' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-emerald-900/40 shadow-xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-950 group-hover:scale-105 transition flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-lg sm:text-xl font-black text-amber-400 tracking-tighter">10K</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">10ka</span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-400">khail</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-amber-400 tracking-widest block uppercase -mt-0.5 sm:-mt-1">
                Pakistan&apos;s Lucky Draw
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-emerald-500/30 text-xs font-bold transition shadow"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>{currentUser.fullName?.split(' ')[0] || 'Dashboard'}</span>
                </Link>
                {currentUser.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition hover:bg-slate-800/50"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-900/40 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Register Free</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button with 44px minimum tap target */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-900/90 text-slate-200 hover:text-white border border-white/10 active:scale-95 transition"
              aria-label="Toggle Navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer & Dimmed Backdrop */}
      {isOpen && (
        <>
          {/* Light-dismiss backdrop overlay */}
          <div
            className="fixed inset-0 top-20 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-50 lg:hidden bg-slate-950/95 border-b border-emerald-900/40 backdrop-blur-2xl px-4 pt-3 pb-6 max-h-[calc(100vh-5rem)] overflow-y-auto animate-in slide-in-from-top duration-200 shadow-2xl">
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition ${
                    pathname === link.href ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-900 active:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              {currentUser ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3.5 min-h-[48px] px-4 rounded-xl bg-slate-800 text-white text-center font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    <span>Go to My Dashboard</span>
                  </Link>
                  {currentUser.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3.5 min-h-[48px] px-4 rounded-xl bg-amber-500/20 text-amber-300 text-center font-bold text-sm active:scale-95 transition"
                    >
                      Admin Control Center
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3.5 min-h-[48px] px-4 rounded-xl bg-slate-900 text-slate-200 text-center font-bold text-sm border border-white/10 active:scale-95 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3.5 min-h-[48px] px-4 rounded-xl bg-emerald-600 text-white text-center font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 active:scale-95 transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Create Account (Get Referral Link)</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
