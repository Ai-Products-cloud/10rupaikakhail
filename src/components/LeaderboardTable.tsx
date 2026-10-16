'use client';

import React from 'react';
import { Trophy, Medal, Sparkles, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  userId: string;
  maskedName: string;
  successfulReferrals: number;
  eligibleBonusEntries: number;
  totalEntries: number;
  latestMilestoneTimestamp: string | Date;
  status: string;
}

interface LeaderboardTableProps {
  items: LeaderboardItem[];
  lastUpdated?: string;
  tieBreakerRule?: string;
  currentUserRank?: number;
}

export default function LeaderboardTable({
  items,
  lastUpdated,
  tieBreakerRule = 'Ties broken by earliest timestamp achieving the verified referral count.',
  currentUserRank,
}: LeaderboardTableProps) {
  return (
    <div className="w-full space-y-4">
      {/* Rules and timestamp banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span><strong>Tie-Breaking Rule:</strong> {tieBreakerRule}</span>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="md:hidden space-y-3">
        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/80 rounded-2xl border border-white/5">
            No verified referrals registered yet. Be the first to invite friends and take the #1 spot!
          </div>
        ) : (
          items.map((item) => {
            const isFirst = item.rank === 1;
            const isSecond = item.rank === 2;
            const isThird = item.rank === 3;

            return (
              <div
                key={item.userId}
                className={`p-4 rounded-2xl border transition shadow-lg ${
                  isFirst
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : isSecond
                    ? 'bg-slate-900/90 border-slate-400/30'
                    : isThird
                    ? 'bg-amber-950/20 border-amber-700/30'
                    : 'bg-slate-900/80 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    {/* Rank Indicator */}
                    {isFirst ? (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30 text-sm">
                        1
                      </div>
                    ) : isSecond ? (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-slate-300/30 text-sm">
                        2
                      </div>
                    ) : isThird ? (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-700 to-amber-600 text-white flex items-center justify-center font-black shadow-md text-sm">
                        3
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold font-mono text-xs border border-white/5">
                        #{item.rank}
                      </div>
                    )}

                    <div>
                      <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        <span>{item.maskedName}</span>
                        {isFirst && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">Position #{item.rank}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-white/5">
                    {item.totalEntries} Total Tickets
                  </span>
                </div>

                {/* Referrals & Bonus Badges Grid */}
                <div className="grid grid-cols-2 gap-2 text-center my-3">
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Verified Referrals</span>
                    <span className="text-base font-black font-mono text-emerald-400">
                      {item.successfulReferrals}
                    </span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Bonus Entries</span>
                    <span className="text-base font-black font-mono text-amber-400">
                      +{item.eligibleBonusEntries}
                    </span>
                  </div>
                </div>

                {/* Projected Prize Pill */}
                <div className="pt-2 border-t border-white/5">
                  {isFirst ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                      <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>1st Prize: Bike</span>
                    </div>
                  ) : isSecond ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-400/20 border border-slate-300/40 text-slate-200 font-bold text-xs">
                      <Medal className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                      <span>2nd Prize: Smart Mobile</span>
                    </div>
                  ) : isThird ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-800/20 border border-amber-700/40 text-amber-400 font-bold text-xs">
                      <Medal className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>3rd Prize: Mobile</span>
                    </div>
                  ) : (
                    <div className="text-center text-[11px] text-slate-500 py-1">
                      Top Performer Certificate
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (hidden on mobile, visible on md+) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md shadow-2xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10 font-bold">
            <tr>
              <th scope="col" className="px-6 py-4">Rank</th>
              <th scope="col" className="px-6 py-4">Participant</th>
              <th scope="col" className="px-6 py-4 text-center">Verified Referrals</th>
              <th scope="col" className="px-6 py-4 text-center">Bonus Entries</th>
              <th scope="col" className="px-6 py-4">Current Projected Prize</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No verified referrals registered yet. Be the first to invite friends and take the #1 spot!
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isFirst = item.rank === 1;
                const isSecond = item.rank === 2;
                const isThird = item.rank === 3;

                return (
                  <tr
                    key={item.userId}
                    className={`transition ${
                      isFirst
                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                        : isSecond
                        ? 'bg-slate-800/40 hover:bg-slate-800/60'
                        : isThird
                        ? 'bg-amber-900/10 hover:bg-amber-900/20'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isFirst ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
                            1
                          </div>
                        ) : isSecond ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-slate-300/30">
                            2
                          </div>
                        ) : isThird ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-700 to-amber-600 text-white flex items-center justify-center font-black shadow-md">
                            3
                          </div>
                        ) : (
                          <span className="w-8 h-8 flex items-center justify-center text-slate-400 font-semibold font-mono">
                            #{item.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Participant Masked Name */}
                    <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{item.maskedName}</span>
                        {isFirst && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Successful Referrals */}
                    <td className="px-6 py-4 text-center font-mono font-bold text-emerald-400 text-base">
                      {item.successfulReferrals}
                    </td>

                    {/* Bonus Entries Earned */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/20 text-xs">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>+{item.eligibleBonusEntries} Entries</span>
                      </span>
                    </td>

                    {/* Projected Prize */}
                    <td className="px-6 py-4">
                      {isFirst ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>1st Prize: Bike</span>
                        </div>
                      ) : isSecond ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-400/20 border border-slate-300/40 text-slate-200 font-bold text-xs">
                          <Medal className="w-3.5 h-3.5 text-slate-300" />
                          <span>2nd Prize: Smart Mobile</span>
                        </div>
                      ) : isThird ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-800/20 border border-amber-700/40 text-amber-400 font-bold text-xs">
                          <Medal className="w-3.5 h-3.5 text-amber-500" />
                          <span>3rd Prize: Mobile</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">Top Performer Certificate</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-[11px] text-slate-500 text-center">
        Leaderboard rankings are computed automatically from verified server transactions. Unverified or refunded referrals are strictly excluded.
      </div>
    </div>
  );
}
