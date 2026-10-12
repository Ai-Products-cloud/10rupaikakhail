import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getComplianceSettings } from '@/lib/compliance';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const [
      totalUsers,
      totalEntries,
      standardEntries,
      bonusEntries,
      totalPayments,
      successfulPayments,
      verifiedReferrals,
      pendingReferrals,
      activeDraws,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.drawEntry.count(),
      prisma.drawEntry.count({ where: { entryType: 'STANDARD' } }),
      prisma.drawEntry.count({ where: { entryType: 'REFERRAL_BONUS' } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'SUCCESS' } }),
      prisma.referral.count({ where: { status: 'VERIFIED' } }),
      prisma.referral.count({ where: { status: 'PENDING' } }),
      prisma.draw.count({ where: { status: 'ACTIVE' } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { fullName: true } } },
      }),
    ]);

    const compliance = await getComplianceSettings();

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalEntries,
        standardEntries,
        bonusEntries,
        totalPayments,
        successfulPayments,
        totalSimulatedRevenuePKR: successfulPayments * 10,
        verifiedReferrals,
        pendingReferrals,
        activeDraws,
      },
      compliance,
      recentAuditLogs,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
