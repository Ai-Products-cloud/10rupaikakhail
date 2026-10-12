import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">Refund and Cancellation Policy</h1>
        <p className="text-xs text-slate-400">Rules governing entry fee refunds, draw cancellations, and referral bonus reversals</p>
      </div>

      <div className="space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Draw Cancellations by Platform</h2>
          <p>
            In the event that an active draw cannot proceed due to statutory directives, regulatory requirements, or administrative cancellation prior to closure, all registered participants will receive a full 100% refund of their entry fee (PKR 10).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Reversal of Referral Bonus Entries</h2>
          <p>
            In order to maintain strict leaderboard integrity and prevent abuse:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-xs text-slate-400">
            <li>If an entry payment is refunded, reversed, or charged back, any referral bonus entry awarded to the referring user on account of that transaction is immediately reversed and annulled.</li>
            <li>The referring user&apos;s leaderboard score and bonus entry counter will be recalculated in real-time.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Duplicate Processing Safeguard</h2>
          <p>
            Our backend enforces idempotent transaction hashing. In the rare event of duplicate processing caused by network timeout on client wallets, duplicate charges are automatically reversed.
          </p>
        </section>
      </div>
    </div>
  );
}
