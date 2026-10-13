import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    // Fetch all registered users with referrals and entries summary
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        referralCode: true,
        role: true,
        isVerified: true,
        phoneVerified: true,
        emailVerified: true,
        verificationMethod: true,
        createdAt: true,
        referredBy: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            referralCode: true,
          },
        },
        referralTracking: {
          select: {
            id: true,
            status: true,
            bonusEntryAwarded: true,
            createdAt: true,
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
        },
        _count: {
          select: {
            entries: true,
            payments: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve user list' }, { status: 500 });
  }
}
