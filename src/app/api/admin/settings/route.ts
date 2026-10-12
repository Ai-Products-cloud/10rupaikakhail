import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getComplianceSettings } from '@/lib/compliance';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const compliance = await getComplianceSettings();
    return NextResponse.json({ compliance });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, legalCounselNote } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required.' }, { status: 400 });
    }

    // Upsert setting
    const updated = await prisma.platformSetting.upsert({
      where: { key },
      update: {
        value: String(value),
        description: legalCounselNote || 'Updated by administrator',
      },
      create: {
        key,
        value: String(value),
        description: legalCounselNote || 'Created by administrator',
        category: 'LEGAL',
      },
    });

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: `FEATURE_FLAG_CHANGED_${key}`,
        targetType: 'PLATFORM_SETTING',
        targetId: updated.id,
        details: JSON.stringify({
          key,
          newValue: value,
          adminName: user.fullName,
          legalNote: legalCounselNote || 'No counsel note provided',
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      message: `Setting ${key} updated successfully.`,
      setting: updated,
    });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
