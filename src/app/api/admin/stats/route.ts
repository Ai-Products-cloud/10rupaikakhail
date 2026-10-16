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
      recentUsers,
      recentPayments,
      recentEntries,
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
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          referralCode: true,
          createdAt: true,
          referredBy: {
            select: {
              fullName: true,
              referralCode: true,
            },
          },
          _count: {
            select: {
              entries: true,
              payments: true,
            },
          },
        },
      }),
      prisma.payment.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              phone: true,
              referralCode: true,
            },
          },
        },
      }),
      prisma.drawEntry.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              phone: true,
            },
          },
          draw: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    const compliance = await getComplianceSettings();

    // Calculate actual collected revenue from successful payments
    const totalRevenuePKR = successfulPayments * 10;

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalEntries,
        standardEntries,
        bonusEntries,
        totalPayments,
        successfulPayments,
        totalRevenuePKR,
        totalSimulatedRevenuePKR: totalRevenuePKR,
        verifiedReferrals,
        pendingReferrals,
        activeDraws,
      },
      compliance,
      recentAuditLogs,
      recentUsers,
      recentPayments,
      recentEntries,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
