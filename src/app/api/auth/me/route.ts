import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getReferralLeaderboard } from '@/lib/referral';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Fetch user referrals
    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referee: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const successfulReferrals = referrals.filter((r) => r.status === 'VERIFIED');
    const pendingReferrals = referrals.filter((r) => r.status === 'PENDING');

    // Fetch user draw entries
    const entries = await prisma.drawEntry.findMany({
      where: { userId: user.id },
      include: {
        draw: {
          select: {
            id: true,
            title: true,
            endDate: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeEntries = entries.filter((e) => e.status === 'ACTIVE');
    const standardEntries = activeEntries.filter((e) => e.entryType === 'STANDARD');
    const bonusEntries = activeEntries.filter((e) => e.entryType === 'REFERRAL_BONUS');

    // Fetch user payments
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      include: {
        draw: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check rank on leaderboard
    const leaderboard = await getReferralLeaderboard(100);
    const userRankItem = leaderboard.items.find((item) => item.userId === user.id);
    const currentRank = userRankItem ? userRankItem.rank : null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const referralLink = `${appUrl}/register?ref=${user.referralCode}`;

    return NextResponse.json({
      user,
      stats: {
        totalEligibleEntries: activeEntries.length,
        standardEntriesCount: standardEntries.length,
        bonusEntriesCount: bonusEntries.length,
        totalSuccessfulReferrals: successfulReferrals.length,
        totalPendingReferrals: pendingReferrals.length,
        currentRank,
        totalParticipants: leaderboard.totalEligibleParticipants,
      },
      referralLink,
      referrals,
      entries,
      payments,
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile data' }, { status: 500 });
  }
}
