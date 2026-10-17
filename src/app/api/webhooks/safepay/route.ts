import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  verifySafepayWebhookSignature,
  generateTicketCode,
} from '@/lib/safepay';
import { sendConcertEnrollmentEmail } from '@/lib/concertMailer';
import { processReferralConversion } from '@/lib/referral';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let rawBody = '';
  try {
    // 1. Read raw body as required by signature-verification procedure
    rawBody = await request.text();

    const signature =
      request.headers.get('x-sfpy-signature') ||
      request.headers.get('x-safepay-signature') ||
      request.headers.get('x-signature');

    const timestamp =
      request.headers.get('x-sfpy-timestamp') ||
      request.headers.get('x-safepay-timestamp') ||
      request.headers.get('x-timestamp');

    const headerEventId =
      request.headers.get('x-sfpy-event-id') ||
      request.headers.get('x-safepay-event-id');

    // 2. Validate webhook signature using HMAC-SHA256 and replay protection
    const verification = verifySafepayWebhookSignature({
      rawBody,
      signature,
      timestamp,
    });

    if (!verification.isValid) {
      console.warn(
        `[SAFEPAY_WEBHOOK_REJECTED] Invalid signature or timestamp drift: ${verification.reason}`
      );
      return NextResponse.json(
        {
          error: 'Unauthorized. Invalid Safepay signature or expired timestamp.',
          reason: verification.reason,
        },
        { status: 400 }
      );
    }

    // 3. Parse JSON payload
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload received.' },
        { status: 400 }
      );
    }

    const eventType = (
      body.event ||
      body.event_type ||
      body.type ||
      'payment.succeeded'
    ).toLowerCase();

    const data = body.data || body;
    const tracker =
      data.token ||
      data.tracker ||
      body.tracker ||
      data.beacon ||
      '';

    const providerEventId =
      headerEventId ||
      body.id ||
      body.event_id ||
      (tracker ? `${tracker}-${eventType}` : `evt_${Date.now()}`);

    // 4. Enforce Idempotency via WebhookEvents table
    const existingWebhookEvent = await prisma.webhookEvent.findUnique({
      where: {
        provider_providerEventId: {
          provider: 'SAFEPAY',
          providerEventId,
        },
      },
    });

    if (
      existingWebhookEvent &&
      existingWebhookEvent.processingStatus === 'PROCESSED'
    ) {
      return NextResponse.json({
        status: 'already_processed',
        message: 'Webhook event previously processed (idempotent)',
        eventId: providerEventId,
      });
    }

    // 5. Match event to internal payment record
    const internalReference =
      data.reference ||
      data.order_id ||
      data.metadata?.internalReference ||
      data.metadata?.order_id ||
      body.order_id;

    const payment = await prisma.concertPayment.findFirst({
      where: {
        OR: [
          internalReference ? { internalReference } : undefined,
          tracker ? { providerReference: tracker } : undefined,
        ].filter(Boolean) as any,
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

    if (!payment) {
      // Record failed event for troubleshooting
      await prisma.webhookEvent.upsert({
        where: {
          provider_providerEventId: {
            provider: 'SAFEPAY',
            providerEventId,
          },
        },
        create: {
          provider: 'SAFEPAY',
          providerEventId,
          eventType,
          payload: rawBody,
          processingStatus: 'FAILED',
          errorMessage: `No matching internal payment record found for tracker=${tracker}, ref=${internalReference}`,
        },
        update: {
          processingStatus: 'FAILED',
          errorMessage: `No matching internal payment record found for tracker=${tracker}, ref=${internalReference}`,
        },
      });

      return NextResponse.json(
        {
          error:
            'No matching internal payment record found for transaction reference.',
          tracker,
          internalReference,
        },
        { status: 404 }
      );
    }

    // 6. Verify Amount and Currency against original database record
    const payloadAmount = Number(data.amount);
    const payloadCurrency = (data.currency || 'PKR').toUpperCase();

    if (payloadCurrency !== payment.currency.toUpperCase()) {
      await prisma.webhookEvent.upsert({
        where: {
          provider_providerEventId: {
            provider: 'SAFEPAY',
            providerEventId,
          },
        },
        create: {
          provider: 'SAFEPAY',
          providerEventId,
          eventType,
          payload: rawBody,
          processingStatus: 'FAILED',
          errorMessage: `Currency mismatch: expected ${payment.currency}, got ${payloadCurrency}`,
        },
        update: {
          processingStatus: 'FAILED',
          errorMessage: `Currency mismatch: expected ${payment.currency}, got ${payloadCurrency}`,
        },
      });

      return NextResponse.json(
        { error: 'Transaction currency mismatch.' },
        { status: 400 }
      );
    }

    // Amount can be in integer paisa (e.g. 150000) or PKR (e.g. 1500)
    const matchesPaisa = payloadAmount === payment.amountPaisa;
    const matchesPKR = payloadAmount === payment.amountPaisa / 100;

    if (!matchesPaisa && !matchesPKR) {
      const err = `Amount mismatch: expected ${payment.amountPaisa} paisa (${payment.amountPaisa / 100} PKR), got ${payloadAmount}`;
      await prisma.webhookEvent.upsert({
        where: {
          provider_providerEventId: {
            provider: 'SAFEPAY',
            providerEventId,
          },
        },
        create: {
          provider: 'SAFEPAY',
          providerEventId,
          eventType,
          payload: rawBody,
          processingStatus: 'FAILED',
          errorMessage: err,
        },
        update: {
          processingStatus: 'FAILED',
          errorMessage: err,
        },
      });

      return NextResponse.json(
        { error: 'Transaction amount mismatch.' },
        { status: 400 }
      );
    }

    // 7. Handle Failure / Cancellation events
    const isFailureEvent =
      eventType.includes('failed') ||
      eventType.includes('declined') ||
      data.state === 'FAILED' ||
      data.status === 'failed';

    const isCancelEvent =
      eventType.includes('cancelled') ||
      data.state === 'CANCELLED' ||
      data.status === 'cancelled';

    if (isFailureEvent || isCancelEvent) {
      const newStatus = isCancelEvent ? 'CANCELLED' : 'FAILED';
      // Only transition if not already succeeded or refunded
      if (payment.status === 'PENDING') {
        await prisma.concertPayment.update({
          where: { id: payment.id },
          data: {
            status: newStatus,
            metadata: JSON.stringify({
              failureReason: data.reason || data.message || `Provider event: ${eventType}`,
            }),
          },
        });
      }

      await prisma.webhookEvent.upsert({
        where: {
          provider_providerEventId: {
            provider: 'SAFEPAY',
            providerEventId,
          },
        },
        create: {
          provider: 'SAFEPAY',
          providerEventId,
          eventType,
          payload: rawBody,
          processedAt: new Date(),
          processingStatus: 'PROCESSED',
        },
        update: {
          processedAt: new Date(),
          processingStatus: 'PROCESSED',
        },
      });

      return NextResponse.json({
        status: 'recorded',
        paymentStatus: newStatus,
      });
    }

    // 8. Handle Success & Automatic Enrollment in an ACID Database Transaction
    const isSuccessEvent =
      eventType.includes('succeeded') ||
      eventType.includes('completed') ||
      eventType.includes('paid') ||
      data.state === 'PAID' ||
      data.state === 'COMPLETED' ||
      data.status === 'success';

    if (!isSuccessEvent) {
      // Event acknowledged without state change
      return NextResponse.json({
        status: 'ignored',
        message: `Unhandled event type: ${eventType}`,
      });
    }

    const txResult = await prisma.$transaction(async (tx) => {
      // Re-read current payment state inside transaction
      const currentPayment = await tx.concertPayment.findUnique({
        where: { id: payment.id },
        include: {
          registration: {
            include: { enrollment: true },
          },
        },
      });

      if (!currentPayment) {
        throw new Error('Payment record disappeared');
      }

      // If already succeeded, keep existing enrollment and don't duplicate
      if (
        currentPayment.status === 'SUCCEEDED' &&
        currentPayment.registration.enrollment
      ) {
        return {
          payment: currentPayment,
          enrollment: currentPayment.registration.enrollment,
          alreadyProcessed: true,
        };
      }

      // 1. Update Payment status to SUCCEEDED
      const updatedPayment = await tx.concertPayment.update({
        where: { id: currentPayment.id },
        data: {
          status: 'SUCCEEDED',
          providerReference: tracker || currentPayment.providerReference,
          verifiedAt: new Date(),
        },
      });

      // 2. Update Registration status to ENROLLED
      await tx.registration.update({
        where: { id: currentPayment.registrationId },
        data: { status: 'ENROLLED' },
      });

      // 3. Create Enrollment (Enforce exactly one enrollment per registration)
      let enrollment = currentPayment.registration.enrollment;
      if (!enrollment) {
        enrollment = await tx.enrollment.create({
          data: {
            registrationId: currentPayment.registrationId,
            ticketCode: generateTicketCode(),
            status: 'ACTIVE',
            enrolledAt: new Date(),
          },
        });
      }

      // 4. Also ensure DrawEntry exists for this user in the active Draw
      const activeDraw = await tx.draw.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (activeDraw) {
        const existingEntry = await tx.drawEntry.findFirst({
          where: {
            userId: currentPayment.registration.userId,
            drawId: activeDraw.id,
          },
        });

        if (!existingEntry) {
          await tx.drawEntry.create({
            data: {
              entryNumber: enrollment.ticketCode,
              userId: currentPayment.registration.userId,
              drawId: activeDraw.id,
              entryType: 'STANDARD',
              status: 'ACTIVE',
              notes: `Verified Safepay entry (${currentPayment.internalReference})`,
            },
          });

          await tx.draw.update({
            where: { id: activeDraw.id },
            data: {
              totalEntriesCount: { increment: 1 },
            },
          });
        }
      }

      // 5. Log WebhookEvent as PROCESSED
      await tx.webhookEvent.upsert({
        where: {
          provider_providerEventId: {
            provider: 'SAFEPAY',
            providerEventId,
          },
        },
        create: {
          provider: 'SAFEPAY',
          providerEventId,
          eventType,
          payload: rawBody,
          processedAt: new Date(),
          processingStatus: 'PROCESSED',
        },
        update: {
          processedAt: new Date(),
          processingStatus: 'PROCESSED',
          errorMessage: null,
        },
      });

      return {
        payment: updatedPayment,
        enrollment,
        activeDrawId: activeDraw?.id,
        alreadyProcessed: false,
      };
    });

    // 9. Send receipt and confirmation email asynchronously, and award referral bonus
    if (!txResult.alreadyProcessed) {
      if (payment.registration.user.email) {
        sendConcertEnrollmentEmail({
          toEmail: payment.registration.user.email,
          customerName: payment.registration.user.fullName,
          concertTitle: payment.registration.concert.title,
          ticketCode: txResult.enrollment.ticketCode,
          amountPaisa: payment.amountPaisa,
          currency: payment.currency,
          internalReference: payment.internalReference,
          providerReference: tracker || payment.providerReference,
          enrolledAt: txResult.enrollment.enrolledAt,
        }).catch((emailErr) => {
          console.error('Failed to send confirmation email:', emailErr);
        });
      }

      // Convert referral bonus for the referrer if referee entered
      if (txResult.activeDrawId) {
        processReferralConversion({
          refereeId: payment.registration.userId,
          drawId: txResult.activeDrawId,
        }).catch((refErr) => {
          console.error('Referral bonus conversion error on Safepay webhook:', refErr);
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Payment verified and customer enrolled successfully.',
      internalReference: payment.internalReference,
      ticketCode: txResult.enrollment.ticketCode,
      enrolled: true,
      alreadyProcessed: txResult.alreadyProcessed,
    });
  } catch (error: any) {
    console.error('Safepay webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}
