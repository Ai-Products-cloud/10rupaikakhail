import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const body = await request.json();
    const { status, endDate, maxTotalEntries, maxEntriesPerUser, title, description } = body;

    const updateData: any = {};
    if (status) {
      if (!['ACTIVE', 'PAUSED', 'CLOSED', 'COMPLETED', 'DRAFT'].includes(status)) {
        return NextResponse.json({ error: 'Invalid draw status' }, { status: 400 });
      }
      updateData.status = status;
    }

    if (endDate) {
      const parsedDate = new Date(endDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid cutoff date' }, { status: 400 });
      }
      updateData.endDate = parsedDate;
    }

    if (maxTotalEntries !== undefined) {
      const parsedTotal = parseInt(maxTotalEntries, 10);
      if (isNaN(parsedTotal) || parsedTotal <= 0) {
        return NextResponse.json({ error: 'maxTotalEntries must be a positive integer' }, { status: 400 });
      }
      updateData.maxTotalEntries = parsedTotal;
    }

    if (maxEntriesPerUser !== undefined) {
      const parsedPerUser = parseInt(maxEntriesPerUser, 10);
      if (isNaN(parsedPerUser) || parsedPerUser <= 0) {
        return NextResponse.json({ error: 'maxEntriesPerUser must be a positive integer' }, { status: 400 });
      }
      updateData.maxEntriesPerUser = parsedPerUser;
    }

    if (title) updateData.title = title;
    if (description) updateData.description = description;

    const updated = await prisma.draw.update({
      where: { id: params.id },
      data: updateData,
      include: {
        prizes: {
          orderBy: { rank: 'asc' },
        },
        _count: {
          select: { entries: true },
        },
      },
    });

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: `DRAW_CONFIGURATION_UPDATED_${params.id}`,
        targetType: 'DRAW',
        targetId: params.id,
        details: JSON.stringify({
          updatedFields: updateData,
          adminName: user.fullName,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ message: 'Draw updated successfully', draw: updated });
  } catch (error: any) {
    console.error('Error updating draw:', error);
    return NextResponse.json({ error: 'Failed to update draw configuration' }, { status: 500 });
  }
}
