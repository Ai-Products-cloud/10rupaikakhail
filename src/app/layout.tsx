import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '10kakhail - Pakistan\'s Premier PKR 10 Lucky Draw & Referral Platform',
  description:
    'Join 10kakhail: Participate in eligible lucky draws for just PKR 10. Win 1st prize CD 70 2027 Model, iPhone 17 Pro Max, or Android Smartphone. Invite friends and earn verified bonus entries.',
  keywords: [
    '10kakhail',
    'Lucky Draw Pakistan',
    'CD 70 2027',
    'iPhone 17 Pro Max',
    'Referral Bonus Draw',
    'PKR 10 Draw',
    'Jeeto Pakistan',
  ],
  authors: [{ name: '10kakhail Pakistan' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
