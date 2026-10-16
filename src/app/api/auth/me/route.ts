import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getReferralLeaderboard } from '@/lib/referral';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
            email: true,
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

    // Dynamically resolve app domain/Vercel URL from incoming request
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (host?.includes('localhost') ? 'http' : 'https');
    
    let domainUrl = host ? `${proto}://${host}` : '';
    if (!domainUrl && process.env.VERCEL_URL) {
      domainUrl = `https://${process.env.VERCEL_URL}`;
    }
    if (!domainUrl && process.env.NEXT_PUBLIC_APP_URL) {
      domainUrl = process.env.NEXT_PUBLIC_APP_URL;
    }

    const referralLink = `${domainUrl}/register?ref=${user.referralCode}`;

    // Fetch user concert registrations and admission passes
    const concertRegistrations = await prisma.registration.findMany({
      where: { userId: user.id },
      include: {
        concert: true,
        enrollment: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

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
      concertRegistrations,
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile data' }, { status: 500 });
  }
}
