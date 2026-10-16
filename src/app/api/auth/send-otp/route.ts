import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  isValidPakistaniPhone,
  normalizePakistaniPhone,
  isValidEmail,
} from '@/lib/auth';
import { createAndSaveOtp, sendOtpEmail, sendOtpSms } from '@/lib/messenger';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { target, type, fullName } = body;

    if (!target || !type) {
      return NextResponse.json(
        { error: 'Recipient target and verification type (EMAIL or PHONE) are required.' },
        { status: 400 }
      );
    }

    if (type !== 'EMAIL' && type !== 'PHONE') {
      return NextResponse.json({ error: 'Type must be EMAIL or PHONE' }, { status: 400 });
    }

    let cleanTarget = target.trim();

    if (type === 'EMAIL') {
      cleanTarget = cleanTarget.toLowerCase();
      if (!isValidEmail(cleanTarget)) {
        return NextResponse.json(
          { error: 'Please enter a valid email address (e.g. name@example.com).' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existing = await prisma.user.findFirst({
        where: { email: cleanTarget },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in.' },
          { status: 409 }
        );
      }
    } else {
      // PHONE
      if (!isValidPakistaniPhone(cleanTarget)) {
        return NextResponse.json(
          { error: 'Please enter a valid mobile number.' },
          { status: 400 }
        );
      }
      cleanTarget = normalizePakistaniPhone(cleanTarget);

      // Check if user already exists
      const existing = await prisma.user.findFirst({
        where: { phone: cleanTarget },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this mobile number already exists. Please log in.' },
          { status: 409 }
        );
      }
    }

    // Rate Limiting: 5-second cooldown between requests
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        target: cleanTarget,
        createdAt: {
          gt: new Date(Date.now() - 5 * 1000), // 5 seconds
        },
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: 'Please wait a few seconds before requesting another code.' },
        { status: 429 }
      );
    }

    // Generate and persist code in Supabase
    const otp = await createAndSaveOtp(cleanTarget, type);

    // Send real email or SMS with safety check
    let smsResult: { sent: boolean; provider: string; debugOtp?: string } | undefined;
    if (type === 'EMAIL') {
      const emailResult = await sendOtpEmail(cleanTarget, otp, fullName);
      if (!emailResult.sent) {
        const errorMsg = emailResult.error
          ? `Email delivery failed: ${emailResult.error}`
          : 'Email service is not configured. Please add RESEND_API_KEY or SMTP credentials in your environment.';
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
    } else {
      try {
        smsResult = await sendOtpSms(cleanTarget, otp);
      } catch (dispatchErr: any) {
        console.warn('Dispatch non-blocking error:', dispatchErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanTarget}.`,
      target: cleanTarget,
      type,
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch verification code. Please try again.' },
      { status: 500 }
    );
  }
}
