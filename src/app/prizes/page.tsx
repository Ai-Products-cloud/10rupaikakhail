'use client';

import React, { useState } from 'react';
import { Trophy, Sparkles, ShieldCheck, Gift, CheckCircle2 } from 'lucide-react';
import PrizeCard from '@/components/PrizeCard3D';
import SimulatedPaymentModal from '@/components/SimulatedPaymentModal';

export default function PrizesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultDraw = {
    id: 'demo-draw-2027',
    title: 'Grand Pakistan Mega Draw 2027',
    entryFeePKR: 10,
    endDate: '2027-03-23T23:59:59Z',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-10 sm:space-y-16">
      {/* Title */}
      <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
          <Gift className="w-3.5 h-3.5" />
          <span>Official Prize Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Prize Showcase 2027</h1>
        <p className="text-xs sm:text-sm text-slate-300 px-2">
          Inspect genuine prize allocations for the Grand Pakistan Mega Draw 2027. Win the iconic Pakistani CD 70 2027 model motorcycle,
          the titanium iPhone 17 Pro Max, or the high-performance Android flagship for just PKR 10.
        </p>
      </div>

      {/* Prize Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <PrizeCard
          rank={1}
          title="Honda CD 70 2027 Model"
          tagline="1st Prize • Pakistani Model 2027 Motorcycle"
          estimatedValue="PKR 185,000"
          description="The undisputed King of Pakistani transport. Specially commissioned 2027 edition featuring upgraded chrome exhaust, aerodynamic tank graphics, high fuel efficiency (70+ km/l), and 4-stroke overhead cam engine."
          eligibility="Eligibility: Verified Pakistani citizen with valid CNIC. Free registration & road tax support included."
          imageUrl="https://ahsanautos.pk/images/products/cd70-black-2027.webp"
          status="Active Draw Allocation"
          onEnterClick={() => setIsModalOpen(true)}
        />

        <PrizeCard
          rank={2}
          title="iPhone 17 Pro Max"
          tagline="2nd Prize • Desert Titanium Flagship"
          estimatedValue="PKR 495,000"
          description="Apple's ultimate flagship smartphone with Grade 5 Titanium chassis, next-gen A19 Pro Bionic silicon, 48MP periscope telephoto sensor, and 120Hz ProMotion OLED screen."
          eligibility="Eligibility: 100% Brand new, factory sealed, PTA-approved with valid Pakistani tax clearance."
          imageUrl="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"
          status="Active Draw Allocation"
          onEnterClick={() => setIsModalOpen(true)}
        />

        <PrizeCard
          rank={3}
          title="Android Flagship Smartphone"
          tagline="3rd Prize • Emerald Green 120Hz AMOLED"
          estimatedValue="PKR 145,000"
          description="Equipped with 120Hz Curved AMOLED display, 108MP Quad-camera array, 5000mAh battery with 67W Turbo Fast Charging, 12GB RAM, and 256GB storage."
          eligibility="Eligibility: Official Pakistani variant with 1-Year Local Official Warranty and PTA certification."
          imageUrl="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80"
          status="Active Draw Allocation"
          onEnterClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Detailed Technical Specs Comparison */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <h3 className="text-xl font-extrabold text-white">Prize Eligibility &amp; Claim Procedures</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-amber-400 block text-sm">Motorcycle Delivery (1st Prize)</strong>
            <p>
              Delivered directly through authorized dealership partner in Karachi, Lahore, Rawalpindi/Islamabad, Faisalabad, or Peshawar. Winner must present original CNIC matching account registration.
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-slate-200 block text-sm">iPhone 17 Pro Max (2nd Prize)</strong>
            <p>
              Shipped insured with TCS / Leopards courier service or handed over at our verification office. Shipped with official PTA duty receipt and warranty documentation.
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-emerald-400 block text-sm">Android Smartphone (3rd Prize)</strong>
            <p>
              Dispatched with manufacturer warranty and original IMEI registration certificate verified against the PTA DIRBS portal.
            </p>
          </div>
        </div>
      </div>

      <SimulatedPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        draw={defaultDraw}
      />
    </div>
  );
}
