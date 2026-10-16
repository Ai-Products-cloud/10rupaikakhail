import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  createSafepayCheckoutSession,
  generateInternalPaymentRef,
} from '@/lib/safepay';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required.' }, { status: 400 });
    }

    // Look up original payment
    const originalPayment = await prisma.concertPayment.findFirst({
      where: {
        OR: [
          { id },
          { internalReference: id },
          { providerReference: id },
        ],
      },
      include: {
        registration: {
          include: {
            concert: true,
            enrollment: true,
            user: true,
          },
        },
      },
    });

    if (!originalPayment) {
      return NextResponse.json(
        { error: 'Payment record not found.' },
        { status: 404 }
      );
    }

    // Check ownership
    const isOwner = originalPayment.registration.userId === user.id;
    const isAdmin = user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. You are not authorized to retry this payment.' },
        { status: 403 }
      );
    }

    // Business rule: Do not allow retry if already succeeded or enrolled
    if (
      originalPayment.status === 'SUCCEEDED' ||
      originalPayment.registration.status === 'ENROLLED' ||
      originalPayment.registration.enrollment
    ) {
      return NextResponse.json(
        {
          error:
            'This registration has already been verified and enrolled. Retry is not permitted.',
          registrationId: originalPayment.registrationId,
        },
        { status: 400 }
      );
    }

    // Safely update the older payment to CANCELLED if it was still PENDING
    if (originalPayment.status === 'PENDING') {
      await prisma.concertPayment.update({
        where: { id: originalPayment.id },
        data: { status: 'CANCELLED' },
      });
    }

    const concert = originalPayment.registration.concert;
    const amountPaisa = concert.feePaisa;
    const currency = concert.currency || 'PKR';
    const newInternalReference = generateInternalPaymentRef('CONC-RETRY');

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';
    const redirectUrl = `${origin}/payment/success?ref=${newInternalReference}`;
    const cancelUrl = `${origin}/payment/cancelled?ref=${newInternalReference}`;

    // Create a fresh Safepay session without creating a duplicate registration
    const session = await createSafepayCheckoutSession({
      internalReference: newInternalReference,
      amountPaisa,
      currency,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerName: user.fullName,
      concertTitle: concert.title,
      redirectUrl,
      cancelUrl,
    });

    const newPayment = await prisma.concertPayment.create({
      data: {
        registrationId: originalPayment.registrationId,
        provider: 'SAFEPAY',
        internalReference: newInternalReference,
        providerReference: session.tracker,
        amountPaisa,
        currency,
        status: 'PENDING',
        checkoutUrl: session.checkoutUrl,
        metadata: JSON.stringify({
          previousPaymentId: originalPayment.id,
          retryReason: 'Customer initiated retry checkout attempt',
          sessionResponse: session.rawResponse,
        }),
      },
    });

    return NextResponse.json({
      message: 'New checkout attempt initiated successfully.',
      paymentId: newPayment.id,
      internalReference: newPayment.internalReference,
      checkoutUrl: newPayment.checkoutUrl,
      tracker: newPayment.providerReference,
      amountPaisa: newPayment.amountPaisa,
      amountPKR: newPayment.amountPaisa / 100,
      currency: newPayment.currency,
      status: newPayment.status,
      registrationId: originalPayment.registrationId,
    });
  } catch (error: any) {
    console.error('Payment retry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retry payment.' },
      { status: 500 }
    );
  }
}
