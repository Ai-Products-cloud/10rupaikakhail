import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  hashPassword,
  generateToken,
  isValidPakistaniPhone,
  normalizePakistaniPhone,
  isValidEmail,
  generateReferralCode,
} from '@/lib/auth';
import { attachReferral } from '@/lib/referral';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      email,
      password,
      confirmPassword,
      termsAccepted,
      refCode,
    } = body;

    // 1. Basic validation
    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { error: 'Please enter your full legal name.' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Please create a secure password.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password and password confirmation do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions to proceed.' },
        { status: 400 }
      );
    }

    // 2. Pakistani Mobile Number Eligibility (PTA standard 11 digits: 0300 to 0359 series)
    const trimmedPhone = phone ? phone.trim() : '';
    if (!trimmedPhone) {
      return NextResponse.json(
        { error: 'Please provide an eligible Pakistani mobile number (e.g. 03001234567).' },
        { status: 400 }
      );
    }

    if (!isValidPakistaniPhone(trimmedPhone)) {
      return NextResponse.json(
        {
          error:
            'Invalid mobile number. Please enter an eligible Pakistani mobile number (11 digits starting with 03xx: Jazz 030x/032x, Zong 031x, Ufone 033x, Telenor 034x, SCO 0355).',
        },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePakistaniPhone(trimmedPhone);

    const trimmedEmail = email ? email.trim().toLowerCase() : '';
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address (e.g. name@example.com).' },
        { status: 400 }
      );
    }

    // 3. Referral code validation (if user has a referral code)
    let referrerUser = null;
    if (refCode && refCode.trim()) {
      const cleanRef = refCode.trim().toUpperCase();
      referrerUser = await prisma.user.findUnique({
        where: { referralCode: cleanRef },
      });

      if (!referrerUser) {
        return NextResponse.json(
          {
            error: `Referral code "${cleanRef}" was not found. Please check your code or leave blank.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Check existing user by phone or email
    const orConditions: any[] = [{ phone: normalizedPhone }];
    if (trimmedEmail) orConditions.push({ email: trimmedEmail });

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this mobile number already exists. Please log in.' },
        { status: 409 }
      );
    }

    // 5. Hash password & generate unique referral code
    const passwordHash = await hashPassword(password);
    let referralCode = generateReferralCode(fullName);

    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.user.findUnique({ where: { referralCode } });
      if (!exists) break;
      referralCode = generateReferralCode(fullName);
      attempts++;
    }

    // 6. Direct registration without confirmation requirement
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        phone: normalizedPhone,
        email: trimmedEmail || null,
        passwordHash,
        referralCode,
        isVerified: true,
        phoneVerified: true,
        emailVerified: !!trimmedEmail,
        verificationMethod: 'PHONE',
        role: 'USER',
      },
    });

    // 7. Attach referral if referrer verified
    if (referrerUser) {
      await attachReferral({
        refereeId: newUser.id,
        referralCode: referrerUser.referralCode,
      });
    }

    // 8. Generate session JWT
    const token = generateToken({
      userId: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
    });

    const response = NextResponse.json({
      message: 'Account registered successfully!',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
        referralCode: newUser.referralCode,
        role: newUser.role,
        isVerified: newUser.isVerified,
        phoneVerified: newUser.phoneVerified,
        referredBy: referrerUser ? referrerUser.fullName : null,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
