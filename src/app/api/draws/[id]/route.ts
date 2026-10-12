import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const draw = await prisma.draw.findUnique({
      where: { id: params.id },
      include: {
        prizes: {
          orderBy: { rank: 'asc' },
        },
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!draw) {
      return NextResponse.json({ error: 'Draw not found' }, { status: 404 });
    }

    return NextResponse.json({ draw });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve draw' }, { status: 500 });
  }
}
