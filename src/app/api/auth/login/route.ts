import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  verifyPassword,
  generateToken,
  normalizePakistaniPhone,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loginIdentifier, password } = body;

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Please enter your mobile number or email and your password.' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePakistaniPhone(loginIdentifier);

    // Find by phone or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { email: loginIdentifier.toLowerCase().trim() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please verify your phone/email and password.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please verify your phone/email and password.' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        referralCode: user.referralCode,
        role: user.role,
        isVerified: user.isVerified,
      },
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
