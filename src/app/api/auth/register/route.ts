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
      verificationMethod = 'PHONE',
    } = body;

    // 1. Validation
    if (!fullName || !password) {
      return NextResponse.json(
        { error: 'Please provide your full legal name and password.' },
        { status: 400 }
      );
    }

    const trimmedPhone = phone ? phone.trim() : '';
    const trimmedEmail = email ? email.trim().toLowerCase() : '';

    if (!trimmedPhone && !trimmedEmail) {
      return NextResponse.json(
        { error: 'Please provide either a Pakistani mobile number or an email address to register.' },
        { status: 400 }
      );
    }

    if (verificationMethod === 'PHONE' && !trimmedPhone) {
      return NextResponse.json(
        { error: 'Please provide a valid Pakistani mobile number to verify via SMS OTP.' },
        { status: 400 }
      );
    }

    if (verificationMethod === 'EMAIL' && !trimmedEmail) {
      return NextResponse.json(
        { error: 'Please provide an email address to verify via Email.' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions to register.' },
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

    let normalizedPhone: string | null = null;
    if (trimmedPhone) {
      if (!isValidPakistaniPhone(trimmedPhone)) {
        return NextResponse.json(
          { error: 'Please enter a valid mobile number.' },
          { status: 400 }
        );
      }
      normalizedPhone = normalizePakistaniPhone(trimmedPhone);
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address (e.g. name@example.com).' },
        { status: 400 }
      );
    }

    // 2. Check existing user by phone or email
    const orConditions = [];
    if (normalizedPhone) orConditions.push({ phone: normalizedPhone });
    if (trimmedEmail) orConditions.push({ email: trimmedEmail });

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this mobile number or email already exists. Please log in.' },
        { status: 409 }
      );
    }

    // 3. Hash password & generate unique referral code
    const passwordHash = await hashPassword(password);
    let referralCode = generateReferralCode(fullName);

    // Ensure referral code uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.user.findUnique({ where: { referralCode } });
      if (!exists) break;
      referralCode = generateReferralCode(fullName);
      attempts++;
    }

    const isPhoneVerified = verificationMethod === 'PHONE';
    const isEmailVerified = verificationMethod === 'EMAIL';

    // 4. Create user
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        phone: normalizedPhone,
        email: trimmedEmail || null,
        passwordHash,
        referralCode,
        isVerified: true,
        verificationMethod,
        phoneVerified: isPhoneVerified,
        emailVerified: isEmailVerified,
        role: 'USER',
      },
    });

    // 5. Attach referral if referred by an existing user
    if (refCode) {
      await attachReferral({
        refereeId: newUser.id,
        referralCode: refCode,
      });
    }

    // 6. Generate session JWT
    const token = generateToken({
      userId: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
    });

    const response = NextResponse.json({
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
        referralCode: newUser.referralCode,
        role: newUser.role,
        isVerified: newUser.isVerified,
        phoneVerified: newUser.phoneVerified,
        emailVerified: newUser.emailVerified,
        verificationMethod: newUser.verificationMethod,
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
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
