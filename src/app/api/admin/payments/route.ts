import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { reverseReferralBonus } from '@/lib/referral';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            referralCode: true,
          },
        },
        draw: {
          select: {
            id: true,
            title: true,
            entryFeePKR: true,
          },
        },
        entries: {
          select: {
            id: true,
            entryNumber: true,
            entryType: true,
            status: true,
          },
        },
        refunds: true,
      },
    });

    const totalTransactions = payments.length;
    const successfulTransactions = payments.filter((p) => p.status === 'SUCCESS').length;
    const pendingTransactions = payments.filter((p) => p.status === 'PENDING').length;
    const refundedTransactions = payments.filter((p) => p.status === 'REFUNDED').length;
    const totalRevenuePKR = payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + (p.amountPKR || 10), 0);

    return NextResponse.json({
      payments,
      metrics: {
        totalTransactions,
        successfulTransactions,
        pendingTransactions,
        refundedTransactions,
        totalRevenuePKR,
      },
    });
  } catch (error: any) {
    console.error('Admin payments fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve payment records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, reason = 'Administrative refund' } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { entries: true, user: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    if (payment.status === 'REFUNDED') {
      return NextResponse.json({ error: 'This payment is already marked as refunded' }, { status: 400 });
    }

    // Process refund in transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
        },
      });

      // 2. Create refund record
      await tx.refund.create({
        data: {
          paymentId: payment.id,
          userId: payment.userId,
          amountPKR: payment.amountPKR,
          reason,
          status: 'APPROVED',
          adminNotes: `Refund authorized by Admin: ${user.fullName} (${user.id})`,
          processedAt: new Date(),
        },
      });

      // 3. Reverse associated draw entries
      for (const entry of payment.entries) {
        await tx.drawEntry.update({
          where: { id: entry.id },
          data: {
            status: 'REVERSED',
            notes: `Entry reversed due to refund: ${reason}`,
          },
        });
      }

      // 4. Record audit log
      await tx.auditLog.create({
        data: {
          adminId: user.id,
          action: 'PAYMENT_REFUNDED',
          targetType: 'PAYMENT',
          targetId: payment.id,
          details: `Refunded PKR ${payment.amountPKR} for ${payment.user.fullName} (${payment.transactionRef})`,
        },
      });

      return updatedPayment;
    });

    return NextResponse.json({
      message: 'Payment refunded successfully and audit logs recorded',
      payment: updated,
    });
  } catch (error: any) {
    console.error('Admin refund error:', error);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}
