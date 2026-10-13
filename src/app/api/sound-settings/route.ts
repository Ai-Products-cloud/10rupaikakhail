import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.platformSetting.findMany({
      where: {
        key: {
          in: [
            'SOUND_ENABLED',
            'SOUND_TRACK_TITLE',
            'SOUND_TRACK_URL',
            'SOUND_VOLUME',
            'SESSION_TIMEOUT_MINUTES',
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    return NextResponse.json({
      soundEnabled: map.get('SOUND_ENABLED') === 'true',
      trackTitle: map.get('SOUND_TRACK_TITLE') || 'Jeeto Pakistan Rhythmic Beats',
      trackUrl: map.get('SOUND_TRACK_URL') || 'synthesized-jeeto-beats',
      volume: parseFloat(map.get('SOUND_VOLUME') || '0.6'),
      sessionTimeoutMinutes: parseInt(map.get('SESSION_TIMEOUT_MINUTES') || '30', 10),
    });
  } catch (error) {
    return NextResponse.json({
      soundEnabled: true,
      trackTitle: 'Jeeto Pakistan Rhythmic Beats',
      trackUrl: 'synthesized-jeeto-beats',
      volume: 0.6,
      sessionTimeoutMinutes: 30,
    });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const body = await request.json();
    const {
      soundEnabled,
      trackTitle,
      trackUrl,
      volume,
      sessionTimeoutMinutes,
    } = body;

    const updates = [];

    if (soundEnabled !== undefined) {
      updates.push(
        prisma.platformSetting.upsert({
          where: { key: 'SOUND_ENABLED' },
          update: { value: String(soundEnabled) },
          create: {
            key: 'SOUND_ENABLED',
            value: String(soundEnabled),
            category: 'GENERAL',
            description: 'Global master toggle for full website sound',
          },
        })
      );
    }

    if (trackTitle !== undefined) {
      updates.push(
        prisma.platformSetting.upsert({
          where: { key: 'SOUND_TRACK_TITLE' },
          update: { value: String(trackTitle) },
          create: {
            key: 'SOUND_TRACK_TITLE',
            value: String(trackTitle),
            category: 'GENERAL',
            description: 'Sound track display title',
          },
        })
      );
    }

    if (trackUrl !== undefined) {
      updates.push(
        prisma.platformSetting.upsert({
          where: { key: 'SOUND_TRACK_URL' },
          update: { value: String(trackUrl) },
          create: {
            key: 'SOUND_TRACK_URL',
            value: String(trackUrl),
            category: 'GENERAL',
            description: 'Audio URL or sound engine preset',
          },
        })
      );
    }

    if (volume !== undefined) {
      updates.push(
        prisma.platformSetting.upsert({
          where: { key: 'SOUND_VOLUME' },
          update: { value: String(volume) },
          create: {
            key: 'SOUND_VOLUME',
            value: String(volume),
            category: 'GENERAL',
            description: 'Default sound player volume (0.0 to 1.0)',
          },
        })
      );
    }

    if (sessionTimeoutMinutes !== undefined) {
      updates.push(
        prisma.platformSetting.upsert({
          where: { key: 'SESSION_TIMEOUT_MINUTES' },
          update: { value: String(sessionTimeoutMinutes) },
          create: {
            key: 'SESSION_TIMEOUT_MINUTES',
            value: String(sessionTimeoutMinutes),
            category: 'SECURITY',
            description: 'Inactivity timeout minutes before auto-logout',
          },
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      message: 'Sound and session settings saved successfully.',
    });
  } catch (error: any) {
    console.error('Sound settings update error:', error);
    return NextResponse.json({ error: 'Failed to update sound settings' }, { status: 500 });
  }
}
