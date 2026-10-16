import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
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

    // Look up by primary key, internal reference, or provider reference
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
            user: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
              },
            },
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

    // Strict Authorization: Only the paying customer or an authorized admin may access
    const isOwner = payment.registration.userId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. You are not authorized to view this payment record.' },
        { status: 403 }
      );
    }

    const enrollment = payment.registration.enrollment;
    const isEnrolled = !!enrollment && enrollment.status === 'ACTIVE';

    return NextResponse.json({
      paymentId: payment.id,
      internalReference: payment.internalReference,
      providerReference: payment.providerReference,
      provider: payment.provider,
      amountPaisa: payment.amountPaisa,
      amountPKR: payment.amountPaisa / 100,
      currency: payment.currency,
      status: payment.status,
      checkoutUrl: payment.checkoutUrl,
      createdAt: payment.createdAt,
      verifiedAt: payment.verifiedAt,
      isConfirmed: payment.status === 'SUCCEEDED',
      isEnrolled,
      customer: {
        id: payment.registration.user.id,
        fullName: payment.registration.user.fullName,
        email: payment.registration.user.email,
        phone: payment.registration.user.phone,
      },
      registration: {
        id: payment.registration.id,
        status: payment.registration.status,
        createdAt: payment.registration.createdAt,
        concert: {
          id: payment.registration.concert.id,
          title: payment.registration.concert.title,
          venue: payment.registration.concert.venue,
          eventDate: payment.registration.concert.eventDate,
          feePaisa: payment.registration.concert.feePaisa,
          currency: payment.registration.concert.currency,
        },
        enrollment: enrollment
          ? {
              id: enrollment.id,
              ticketCode: enrollment.ticketCode,
              status: enrollment.status,
              enrolledAt: enrollment.enrolledAt,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Payment fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve payment status.' },
      { status: 500 }
    );
  }
}
