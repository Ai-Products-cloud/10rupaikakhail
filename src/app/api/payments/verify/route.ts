import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { verifyAndCompletePayment } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentId, simulatedSuccess = true, otpCode, gatewayResponse } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required.' }, { status: 400 });
    }

    const result = await verifyAndCompletePayment({
      paymentId,
      simulatedSuccess,
      otpCode,
      gatewayResponse,
    });

    return NextResponse.json({
      message: result.alreadyProcessed
        ? 'Payment already verified.'
        : simulatedSuccess
        ? 'Payment verified successfully and draw entry generated!'
        : 'Payment was declined or failed.',
      payment: result.payment,
      entry: result.entry,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
