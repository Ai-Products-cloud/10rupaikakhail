import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">Privacy &amp; Data Protection Policy</h1>
        <p className="text-xs text-slate-400">Compliance with Pakistani Consumer Data Protection Regulations</p>
      </div>

      <div className="space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Information Collection</h2>
          <p>
            We collect personal identification information including your full name, Pakistani mobile number (03XX), email address (if supplied), and referral association codes. Payment information processed via simulated or partner gateways is handled with tokenized references.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Public Leaderboard Privacy Controls</h2>
          <p>
            To protect your privacy on our public leaderboard, names and mobile numbers are systematically masked (e.g. &ldquo;Hamza K.&rdquo; or &ldquo;0301-***5678&rdquo;). Your full phone number and identity are never exposed to public viewers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Purpose of Processing</h2>
          <p>
            We process data to authenticate user access, attribute referrals, award bonus entries, verify transactions, prevent duplicate accounts, and compute verified leaderboard standings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Account Deletion Rights</h2>
          <p>
            You have the right to request deletion of your account and personal data from your dashboard settings. Any active draw entries associated with a deleted account will be closed in accordance with draw regulations.
          </p>
        </section>
      </div>
    </div>
  );
}
