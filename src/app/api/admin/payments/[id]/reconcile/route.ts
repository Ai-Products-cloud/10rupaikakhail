import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateTicketCode } from '@/lib/safepay';
import { sendConcertEnrollmentEmail } from '@/lib/concertMailer';
import { processReferralConversion } from '@/lib/referral';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges are required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required.' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, reason, evidenceRef, adminNotes } = body;

    // Strict Rule: Manual reconciliation requires verifiable rationale & evidence
    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return NextResponse.json(
        {
          error:
            'A documented reason (minimum 5 characters) is required for audit compliance.',
        },
        { status: 400 }
      );
    }

    if (action === 'APPROVE_MANUAL' && (!evidenceRef || evidenceRef.trim().length < 3)) {
      return NextResponse.json(
        {
          error:
            'Valid transaction evidence reference (e.g. bank slip, provider reference) is mandatory for manual approval.',
        },
        { status: 400 }
      );
    }

    // Locate concert payment
    const payment = await prisma.concertPayment.findFirst({
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

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found.' },
        { status: 404 }
      );
    }

    const previousStatus = payment.status;

    // Execute atomic reconciliation
    const result = await prisma.$transaction(async (tx) => {
      let updatedPayment: any = payment;
      let enrollment: any = payment.registration.enrollment;

      if (action === 'APPROVE_MANUAL') {
        if (payment.status === 'SUCCEEDED' && enrollment) {
          throw new Error('This payment is already confirmed as SUCCEEDED.');
        }

        updatedPayment = await tx.concertPayment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCEEDED',
            verifiedAt: new Date(),
            reconciliationNotes: `Manual reconciliation approved by Admin (${user.fullName}). Evidence: ${evidenceRef}. Reason: ${reason}`,
          },
        });

        await tx.registration.update({
          where: { id: payment.registrationId },
          data: { status: 'ENROLLED' },
        });

        if (!enrollment) {
          enrollment = await tx.enrollment.create({
            data: {
              registrationId: payment.registrationId,
              ticketCode: generateTicketCode(),
              status: 'ACTIVE',
              enrolledAt: new Date(),
            },
          });
        } else if (enrollment.status !== 'ACTIVE') {
          enrollment = await tx.enrollment.update({
            where: { id: enrollment.id },
            data: { status: 'ACTIVE' },
          });
        }

        // Also ensure DrawEntry exists for this participant
        const activeDraw = await tx.draw.findFirst({
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        });

        if (activeDraw) {
          const existingEntry = await tx.drawEntry.findFirst({
            where: {
              userId: payment.registration.userId,
              drawId: activeDraw.id,
            },
          });

          if (!existingEntry) {
            await tx.drawEntry.create({
              data: {
                entryNumber: enrollment.ticketCode,
                userId: payment.registration.userId,
                drawId: activeDraw.id,
                entryType: 'STANDARD',
                status: 'ACTIVE',
                notes: `Admin reconciled entry (${payment.internalReference})`,
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
      } else if (action === 'REVERSE_REFUND') {
        updatedPayment = await tx.concertPayment.update({
          where: { id: payment.id },
          data: {
            status: 'REFUNDED',
            reconciliationNotes: `Reversed/Refunded by Admin (${user.fullName}). Reason: ${reason}`,
          },
        });

        await tx.registration.update({
          where: { id: payment.registrationId },
          data: { status: 'REFUNDED' },
        });

        if (enrollment) {
          enrollment = await tx.enrollment.update({
            where: { id: enrollment.id },
            data: { status: 'REVOKED' },
          });
        }
      } else if (action === 'MARK_FAILED') {
        updatedPayment = await tx.concertPayment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            reconciliationNotes: `Marked failed by Admin (${user.fullName}). Reason: ${reason}`,
          },
        });
      } else {
        throw new Error(`Unsupported reconciliation action: ${action}`);
      }

      // Record immutable audit log
      const auditLog = await tx.auditLog.create({
        data: {
          adminId: user.id,
          action: `CONCERT_PAYMENT_${action}`,
          targetType: 'CONCERT_PAYMENT',
          targetId: payment.id,
          details: JSON.stringify({
            action,
            reason,
            evidenceRef: evidenceRef || null,
            adminNotes: adminNotes || null,
            previousStatus,
            newStatus: updatedPayment.status,
            customerName: payment.registration.user.fullName,
            customerEmail: payment.registration.user.email,
            internalReference: payment.internalReference,
            amountPaisa: payment.amountPaisa,
          }),
        },
      });

      return {
        payment: updatedPayment,
        enrollment,
        auditLog,
      };
    });

    // Send email on manual approval if customer has email
    if (
      action === 'APPROVE_MANUAL' &&
      result.enrollment &&
      payment.registration.user.email
    ) {
      sendConcertEnrollmentEmail({
        toEmail: payment.registration.user.email,
        customerName: payment.registration.user.fullName,
        concertTitle: payment.registration.concert.title,
        ticketCode: result.enrollment.ticketCode,
        amountPaisa: payment.amountPaisa,
        currency: payment.currency,
        internalReference: payment.internalReference,
        providerReference: payment.providerReference || evidenceRef,
        enrolledAt: result.enrollment.enrolledAt,
      }).catch((e) => console.error('Failed to dispatch receipt on manual approval:', e));

      // Award referral bonus if user was referred
      prisma.draw.findFirst({ where: { status: 'ACTIVE' } }).then((activeDraw) => {
        if (activeDraw) {
          processReferralConversion({
            refereeId: payment.registration.userId,
            drawId: activeDraw.id,
          }).catch((refErr) => console.error('Manual approval referral bonus error:', refErr));
        }
      });
    }

    return NextResponse.json({
      message: `Payment successfully reconciled: ${action}`,
      payment: result.payment,
      enrollment: result.enrollment,
      auditLogId: result.auditLog.id,
    });
  } catch (error: any) {
    console.error('Reconciliation error:', error);
    return NextResponse.json(
      { error: error.message || 'Reconciliation failed.' },
      { status: 500 }
    );
  }
}
