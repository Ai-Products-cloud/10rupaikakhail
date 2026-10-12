import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  hashPassword,
  generateToken,
  isValidPakistaniPhone,
  normalizePakistaniPhone,
  generateReferralCode,
} from '@/lib/auth';
import { attachReferral } from '@/lib/referral';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, password, confirmPassword, termsAccepted, refCode } = body;

    // 1. Validation
    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { error: 'Please provide full name, mobile number, and password.' },
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

    if (!isValidPakistaniPhone(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid Pakistani mobile number (e.g., 0300-1234567 or 03211234567).' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePakistaniPhone(phone);

    // 2. Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: normalizedPhone }, ...(email ? [{ email }] : [])],
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

    // 4. Create user
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        phone: normalizedPhone,
        email: email?.trim() || null,
        passwordHash,
        referralCode,
        isVerified: true, // Demo accounts auto-verified
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
