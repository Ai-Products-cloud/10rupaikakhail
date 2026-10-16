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
          Inspect official prize allocations for the Grand Pakistan Mega Draw. Win a brand new Bike,
          a high-performance Smart Mobile, or a durable Mobile phone for just PKR 10.
        </p>
      </div>

      {/* Prize Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <PrizeCard
          rank={1}
          title="Bike"
          tagline="1st Prize • Brand New Motorcycle"
          estimatedValue=""
          description="Brand new fuel-efficient motorcycle built for dependable performance, exceptional mileage, and everyday commute across Pakistan."
          eligibility="Eligibility: Verified Pakistani citizen with valid CNIC. Free registration & road tax support included."
          imageUrl="https://ahsanautos.pk/images/products/cd70-black-2027.webp"
          status="Active Draw Allocation"
          onEnterClick={() => setIsModalOpen(true)}
        />

        <PrizeCard
          rank={2}
          title="Smart Mobile"
          tagline="2nd Prize • Touchscreen Smart Mobile Phone"
          estimatedValue=""
          description="Modern PTA-approved touchscreen smartphone featuring vibrant high-resolution display, advanced multi-camera array, and all-day battery endurance."
          eligibility="Eligibility: 100% Brand new, factory sealed, PTA-approved with valid Pakistani tax clearance."
          imageUrl="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"
          status="Active Draw Allocation"
          onEnterClick={() => setIsModalOpen(true)}
        />

        <PrizeCard
          rank={3}
          title="Mobile"
          tagline="3rd Prize • Mobile Phone"
          estimatedValue=""
          description="Durable compact mobile phone engineered for loud & clear voice calls, wireless FM entertainment, and ultra-long battery standby."
          eligibility="Eligibility: Official PTA-approved brand new handset with official warranty."
          imageUrl="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
          status="Active Draw Allocation"
          onEnterClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Detailed Technical Specs Comparison */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <h3 className="text-xl font-extrabold text-white">Prize Eligibility &amp; Claim Procedures</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-amber-400 block text-sm">Bike Delivery (1st Prize)</strong>
            <p>
              Delivered directly through authorized dealership partner in Karachi, Lahore, Rawalpindi/Islamabad, Faisalabad, or Peshawar. Winner must present original CNIC matching account registration.
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-slate-200 block text-sm">Smart Mobile (2nd Prize)</strong>
            <p>
              Shipped insured with TCS / Leopards courier service or handed over at our verification office. Shipped with official PTA duty receipt and warranty documentation.
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-emerald-400 block text-sm">Mobile (3rd Prize)</strong>
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
