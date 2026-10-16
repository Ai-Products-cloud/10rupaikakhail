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
      return NextResponse.json({ error: 'Registration ID is required.' }, { status: 400 });
    }

    // Attempt lookup by Registration ID, or fallback to (concertId + current userId)
    let registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        concert: true,
        enrollment: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!registration) {
      registration = await prisma.registration.findFirst({
        where: {
          concertId: id,
          userId: user.id,
        },
        include: {
          concert: true,
          enrollment: true,
          payments: {
            orderBy: { createdAt: 'desc' },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },
        },
      });
    }

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration record not found.' },
        { status: 404 }
      );
    }

    // Ownership check
    const isOwner = registration.userId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. You are not authorized to access this registration.' },
        { status: 403 }
      );
    }

    const latestPayment = registration.payments[0] || null;
    const enrollment = registration.enrollment;

    return NextResponse.json({
      registrationId: registration.id,
      status: registration.status,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
      isEnrolled: registration.status === 'ENROLLED' && !!enrollment,
      concert: {
        id: registration.concert.id,
        title: registration.concert.title,
        venue: registration.concert.venue,
        eventDate: registration.concert.eventDate,
        feePaisa: registration.concert.feePaisa,
        amountPKR: registration.concert.feePaisa / 100,
        currency: registration.concert.currency,
        status: registration.concert.status,
      },
      customer: {
        id: registration.user.id,
        fullName: registration.user.fullName,
        email: registration.user.email,
        phone: registration.user.phone,
      },
      enrollment: enrollment
        ? {
            id: enrollment.id,
            ticketCode: enrollment.ticketCode,
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
          }
        : null,
      latestPayment: latestPayment
        ? {
            id: latestPayment.id,
            internalReference: latestPayment.internalReference,
            providerReference: latestPayment.providerReference,
            provider: latestPayment.provider,
            amountPaisa: latestPayment.amountPaisa,
            amountPKR: latestPayment.amountPaisa / 100,
            currency: latestPayment.currency,
            status: latestPayment.status,
            createdAt: latestPayment.createdAt,
            verifiedAt: latestPayment.verifiedAt,
            checkoutUrl: latestPayment.checkoutUrl,
          }
        : null,
      paymentsCount: registration.payments.length,
    });
  } catch (error: any) {
    console.error('Registration fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve registration status.' },
      { status: 500 }
    );
  }
}
