import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'concert', 'draw', 'all'
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const concertId = searchParams.get('concertId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Date range filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // 1. Fetch Concert Payments
    const concertWhere: any = {};
    if (status && status !== 'ALL') {
      concertWhere.status = status;
    }
    if (provider && provider !== 'ALL') {
      concertWhere.provider = provider;
    }
    if (concertId) {
      concertWhere.registration = { concertId };
    }
    if (startDate || endDate) {
      concertWhere.createdAt = dateFilter;
    }

    const rawConcertPayments = await prisma.concertPayment.findMany({
      where: concertWhere,
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        registration: {
          include: {
            concert: true,
            enrollment: true,
            user: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                referralCode: true,
              },
            },
          },
        },
      },
    });

    // In-memory text search across multiple relation fields if search param provided
    const concertPayments = rawConcertPayments.filter((p) => {
      if (!search) return true;
      const ref = (p.internalReference || '').toLowerCase();
      const provRef = (p.providerReference || '').toLowerCase();
      const name = (p.registration?.user?.fullName || '').toLowerCase();
      const phone = (p.registration?.user?.phone || '').toLowerCase();
      const email = (p.registration?.user?.email || '').toLowerCase();
      const concertTitle = (p.registration?.concert?.title || '').toLowerCase();
      const ticketCode = (p.registration?.enrollment?.ticketCode || '').toLowerCase();

      return (
        ref.includes(search) ||
        provRef.includes(search) ||
        name.includes(search) ||
        phone.includes(search) ||
        email.includes(search) ||
        concertTitle.includes(search) ||
        ticketCode.includes(search)
      );
    });

    // Concert Metrics
    const totalConcertTransactions = concertPayments.length;
    const succeededConcertTransactions = concertPayments.filter(
      (p) => p.status === 'SUCCEEDED'
    ).length;
    const pendingConcertTransactions = concertPayments.filter(
      (p) => p.status === 'PENDING'
    ).length;
    const failedConcertTransactions = concertPayments.filter(
      (p) => p.status === 'FAILED'
    ).length;
    const cancelledConcertTransactions = concertPayments.filter(
      (p) => p.status === 'CANCELLED'
    ).length;
    const refundedConcertTransactions = concertPayments.filter(
      (p) => p.status === 'REFUNDED'
    ).length;
    const totalConcertRevenuePaisa = concertPayments
      .filter((p) => p.status === 'SUCCEEDED')
      .reduce((sum, p) => sum + p.amountPaisa, 0);

    const concertMetrics = {
      totalTransactions: totalConcertTransactions,
      successfulTransactions: succeededConcertTransactions,
      pendingTransactions: pendingConcertTransactions,
      failedTransactions: failedConcertTransactions,
      cancelledTransactions: cancelledConcertTransactions,
      refundedTransactions: refundedConcertTransactions,
      totalRevenuePaisa: totalConcertRevenuePaisa,
      totalRevenuePKR: totalConcertRevenuePaisa / 100,
    };

    // 2. Fetch Draw Payments for backward compatibility
    let drawPayments: any[] = [];
    let drawMetrics = {
      totalTransactions: 0,
      successfulTransactions: 0,
      pendingTransactions: 0,
      refundedTransactions: 0,
      totalRevenuePKR: 0,
    };

    if (type === 'all' || type === 'draw') {
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

      drawPayments = payments;
      drawMetrics = {
        totalTransactions: payments.length,
        successfulTransactions: payments.filter((p) => p.status === 'SUCCESS').length,
        pendingTransactions: payments.filter((p) => p.status === 'PENDING').length,
        refundedTransactions: payments.filter((p) => p.status === 'REFUNDED').length,
        totalRevenuePKR: payments
          .filter((p) => p.status === 'SUCCESS')
          .reduce((sum, p) => sum + (p.amountPKR || 10), 0),
      };
    }

    return NextResponse.json({
      concertPayments,
      concertMetrics,
      // For existing frontend /admin/payments which expects `payments` and `metrics`
      payments: type === 'concert' ? concertPayments : drawPayments,
      metrics: type === 'concert' ? concertMetrics : drawMetrics,
      drawPayments,
      drawMetrics,
    });
  } catch (error: any) {
    console.error('Admin payments fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve payment records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, reason = 'Administrative refund' } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Check if this is a ConcertPayment first
    const concertPayment = await prisma.concertPayment.findUnique({
      where: { id: paymentId },
      include: {
        registration: {
          include: { enrollment: true, user: true },
        },
      },
    });

    if (concertPayment) {
      const updated = await prisma.$transaction(async (tx) => {
        const p = await tx.concertPayment.update({
          where: { id: paymentId },
          data: {
            status: 'REFUNDED',
            reconciliationNotes: `Refund authorized by Admin: ${user.fullName}. Reason: ${reason}`,
          },
        });

        await tx.registration.update({
          where: { id: concertPayment.registrationId },
          data: { status: 'REFUNDED' },
        });

        if (concertPayment.registration.enrollment) {
          await tx.enrollment.update({
            where: { id: concertPayment.registration.enrollment.id },
            data: { status: 'REVOKED' },
          });
        }

        await tx.auditLog.create({
          data: {
            adminId: user.id,
            action: 'CONCERT_PAYMENT_REFUNDED',
            targetType: 'CONCERT_PAYMENT',
            targetId: concertPayment.id,
            details: `Refunded PKR ${concertPayment.amountPaisa / 100} for ${concertPayment.registration.user.fullName} (${concertPayment.internalReference})`,
          },
        });

        return p;
      });

      return NextResponse.json({
        message: 'Concert payment refunded and pass revoked.',
        payment: updated,
      });
    }

    // Fallback to legacy Draw Payment refund
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

    const updated = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
        },
      });

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

      for (const entry of payment.entries) {
        await tx.drawEntry.update({
          where: { id: entry.id },
          data: {
            status: 'REVERSED',
            notes: `Entry reversed due to refund: ${reason}`,
          },
        });
      }

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
