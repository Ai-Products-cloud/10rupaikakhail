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

    // Fetch all draw entries
    const entries = await prisma.drawEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            referralCode: true,
          },
        },
        draw: {
          select: {
            id: true,
            title: true,
            status: true,
            entryFeePKR: true,
          },
        },
        payment: {
          select: {
            transactionRef: true,
            amountPKR: true,
            method: true,
            status: true,
            verifiedAt: true,
          },
        },
      },
    });

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error('Admin entries fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve draw entries' }, { status: 500 });
  }
}
