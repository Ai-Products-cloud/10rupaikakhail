import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import SoundPlayer from '@/components/SoundPlayer';
import SessionTimeoutGuard from '@/components/SessionTimeoutGuard';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#064e3b',
};

export const metadata: Metadata = {
  title: "10kakhail - Pakistan's Premier PKR 10 Lucky Draw & Referral Platform",
  description:
    'Join 10kakhail: Participate in eligible lucky draws for just PKR 10. Win 1st prize Bike, 2nd prize Smart Mobile, or 3rd prize Mobile. Invite friends and earn verified bonus entries.',
  keywords: [
    '10kakhail',
    'Lucky Draw Pakistan',
    'Bike Lucky Draw',
    'Smart Mobile Draw',
    'Mobile Draw',
    'Referral Bonus Draw',
    'PKR 10 Draw',
    'Jeeto Pakistan',
  ],
  authors: [{ name: '10kakhail Pakistan' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white antialiased">
        <SessionTimeoutGuard />
        <Navbar />
        <main className="flex-1 pt-20 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
        <SoundPlayer />
      </body>
    </html>
  );
}
