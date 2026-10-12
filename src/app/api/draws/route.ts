import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const draws = await prisma.draw.findMany({
      include: {
        prizes: {
          orderBy: { rank: 'asc' },
        },
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ draws });
  } catch (error: any) {
    console.error('Error fetching draws:', error);
    return NextResponse.json({ error: 'Failed to fetch draws' }, { status: 500 });
  }
}
