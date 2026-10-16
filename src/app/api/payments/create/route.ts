import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { initiatePayment as initiateDrawPayment } from '@/lib/payments';
import {
  createSafepayCheckoutSession,
  generateInternalPaymentRef,
} from '@/lib/safepay';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to proceed.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    // If drawId is provided, route to the legacy lucky draw payment flow
    if (body.drawId && !body.concertId) {
      const { drawId, method, payerAccount, idempotencyKey } = body;
      const payment = await initiateDrawPayment({
        userId: user.id,
        drawId,
        method: method || 'SIMULATED_WALLET',
        payerAccount: payerAccount || user.phone,
        idempotencyKey,
      });

      return NextResponse.json({
        message: 'Draw payment initialized successfully.',
        payment,
      });
    }

    // Concert Payment Flow (Primary)
    // 1. Locate the requested active concert (by ID, slug, or default active concert)
    let concert;
    if (body.concertId && body.concertId !== 'active') {
      concert =
        (await prisma.concert.findUnique({ where: { id: body.concertId } })) ||
        (await prisma.concert.findUnique({ where: { slug: body.concertId } }));
    } else {
      concert = await prisma.concert.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!concert || concert.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'The requested concert is not found or registration is currently closed.' },
        { status: 404 }
      );
    }

    // 2. Validate customer registration eligibility
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_concertId: {
          userId: user.id,
          concertId: concert.id,
        },
      },
      include: {
        enrollment: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (existingRegistration) {
      // If already enrolled or has successful payment
      if (
        existingRegistration.status === 'ENROLLED' ||
        existingRegistration.enrollment
      ) {
        return NextResponse.json(
          {
            error: 'You are already registered and enrolled for this concert.',
            registrationId: existingRegistration.id,
            status: 'ENROLLED',
            ticketCode: existingRegistration.enrollment?.ticketCode,
          },
          { status: 400 }
        );
      }

      // Check if there is already a confirmed payment
      const hasSucceededPayment = existingRegistration.payments.some(
        (p) => p.status === 'SUCCEEDED'
      );
      if (hasSucceededPayment) {
        return NextResponse.json(
          {
            error: 'A verified payment has already been recorded for this registration.',
            registrationId: existingRegistration.id,
            status: 'SUCCEEDED',
          },
          { status: 400 }
        );
      }
    }

    // 3. Create or reuse pending registration
    let registration = existingRegistration;
    if (!registration) {
      registration = await prisma.registration.create({
        data: {
          userId: user.id,
          concertId: concert.id,
          status: 'PENDING',
        },
        include: {
          enrollment: true,
          payments: true,
        },
      });
    }

    // 4. Server authoritative fee (NEVER trust client submitted amounts)
    const amountPaisa = concert.feePaisa;
    const currency = concert.currency || 'PKR';
    const provider = (body.provider || 'SAFEPAY').toUpperCase();

    // 5. Generate collision-resistant internal reference
    const internalReference = generateInternalPaymentRef('CONC-PAY');

    // 6. Return URLs
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';
    const redirectUrl =
      body.redirectUrl || `${origin}/payment/success?ref=${internalReference}`;
    const cancelUrl =
      body.cancelUrl || `${origin}/payment/cancelled?ref=${internalReference}`;

    // 7. Handle provider initiation
    if (provider === 'SAFEPAY') {
      try {
        const session = await createSafepayCheckoutSession({
          internalReference,
          amountPaisa,
          currency,
          customerEmail: user.email,
          customerPhone: user.phone,
          customerName: user.fullName,
          concertTitle: concert.title,
          redirectUrl,
          cancelUrl,
        });

        const payment = await prisma.concertPayment.create({
          data: {
            registrationId: registration.id,
            provider: 'SAFEPAY',
            internalReference,
            providerReference: session.tracker,
            amountPaisa,
            currency,
            status: 'PENDING',
            checkoutUrl: session.checkoutUrl,
            metadata: JSON.stringify({
              customerName: user.fullName,
              customerEmail: user.email,
              customerPhone: user.phone,
              concertTitle: concert.title,
              sessionResponse: session.rawResponse,
            }),
          },
        });

        return NextResponse.json({
          message: 'Safepay checkout session created successfully.',
          paymentId: payment.id,
          internalReference: payment.internalReference,
          checkoutUrl: payment.checkoutUrl,
          tracker: payment.providerReference,
          amountPaisa: payment.amountPaisa,
          amountPKR: payment.amountPaisa / 100,
          currency: payment.currency,
          status: payment.status,
          registrationId: registration.id,
          concertTitle: concert.title,
        });
      } catch (safepayErr: any) {
        console.error('Safepay session creation failed:', safepayErr);

        // Record failed attempt safely so user can retry without duplicate registration
        await prisma.concertPayment.create({
          data: {
            registrationId: registration.id,
            provider: 'SAFEPAY',
            internalReference,
            amountPaisa,
            currency,
            status: 'FAILED',
            metadata: JSON.stringify({
              error: safepayErr.message || 'Safepay checkout init failed',
            }),
          },
        });

        return NextResponse.json(
          {
            error:
              'Failed to initiate Safepay checkout session. Please try again.',
            registrationId: registration.id,
          },
          { status: 502 }
        );
      }
    }

    // Alternative Payment Providers: JAZZCASH / BANK_TRANSFER
    if (provider === 'JAZZCASH') {
      const payment = await prisma.concertPayment.create({
        data: {
          registrationId: registration.id,
          provider: 'JAZZCASH',
          internalReference,
          providerReference: `JC-${Date.now()}`,
          amountPaisa,
          currency,
          status: 'PENDING',
          metadata: JSON.stringify({
            customerName: user.fullName,
            customerPhone: user.phone,
            payerAccount: body.payerAccount || user.phone,
          }),
        },
      });

      return NextResponse.json({
        message: 'JazzCash payment pending verification.',
        paymentId: payment.id,
        internalReference: payment.internalReference,
        amountPaisa: payment.amountPaisa,
        amountPKR: payment.amountPaisa / 100,
        currency: payment.currency,
        status: payment.status,
        provider: 'JAZZCASH',
        registrationId: registration.id,
      });
    }

    if (provider === 'BANK_TRANSFER' || provider === 'RAAST') {
      const payment = await prisma.concertPayment.create({
        data: {
          registrationId: registration.id,
          provider: 'BANK_TRANSFER',
          internalReference,
          providerReference: `BT-${Date.now()}`,
          amountPaisa,
          currency,
          status: 'PENDING',
          metadata: JSON.stringify({
            customerName: user.fullName,
            bankDetails: {
              bankName: 'Meezan Bank Limited / HBL',
              accountTitle: 'Concert Registrations Pakistan',
              iban: 'PK12MEZN0000123456789012',
              raastId: '03001234567',
              paymentReference: internalReference,
            },
          }),
        },
      });

      return NextResponse.json({
        message:
          'Bank transfer instructions generated. Payment pending administrative verification.',
        paymentId: payment.id,
        internalReference: payment.internalReference,
        amountPaisa: payment.amountPaisa,
        amountPKR: payment.amountPaisa / 100,
        currency: payment.currency,
        status: payment.status,
        provider: 'BANK_TRANSFER',
        registrationId: registration.id,
        bankDetails: {
          bankName: 'Meezan Bank Limited',
          accountTitle: 'Concert Registrations Pakistan',
          iban: 'PK12MEZN0000123456789012',
          raastId: '03001234567',
          paymentReference: internalReference,
        },
      });
    }

    return NextResponse.json(
      { error: `Unsupported payment provider: ${provider}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Payment create route error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment processing failed.' },
      { status: 500 }
    );
  }
}
