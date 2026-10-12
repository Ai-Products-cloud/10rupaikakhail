import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { initiatePayment } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Please log in or register before entering the lucky draw.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { drawId, method, payerAccount, idempotencyKey } = body;

    if (!drawId) {
      return NextResponse.json({ error: 'Draw ID is required.' }, { status: 400 });
    }

    const payment = await initiatePayment({
      userId: user.id,
      drawId,
      method: method || 'SIMULATED_WALLET',
      payerAccount: payerAccount || user.phone,
      idempotencyKey,
    });

    return NextResponse.json({
      message: 'Payment initialized successfully.',
      payment,
    });
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initiation failed.' },
      { status: 500 }
    );
  }
}
