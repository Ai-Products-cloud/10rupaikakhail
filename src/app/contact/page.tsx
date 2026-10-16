'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black text-white">Contact &amp; Support</h1>
        <p className="text-sm text-slate-300">
          Have queries regarding your draw entry or referral standings? Reach our team anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Support info */}
        <div className="bg-slate-900/80 rounded-3xl p-8 border border-white/10 space-y-6">
          <h2 className="text-xl font-extrabold text-white">Customer Helpdesk (Pakistan)</h2>
          <div className="space-y-4 text-xs text-slate-300">

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-emerald-400 mt-0.5" />
              <div>
                <strong className="text-white block">Official Inquiries</strong>
                <span>support@10kakhail.pk</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-400 mt-0.5" />
              <div>
                <strong className="text-white block">Headquarters</strong>
                <span>Blue Area, Islamabad, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-900/80 rounded-3xl p-8 border border-white/10">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Message Dispatched!</h3>
              <p className="text-xs text-slate-300">
                Our support desk has received your ticket and will respond via SMS/email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Muhammad Usman"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter mobile number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Message / Question</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your inquiry or question..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
