import { NextResponse } from 'next/server';
import { getReferralLeaderboard } from '@/lib/referral';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getReferralLeaderboard(50);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve referral leaderboard.' },
      { status: 500 }
    );
  }
}
