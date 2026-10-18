import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken, normalizePakistaniPhone } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { fullName, email, phone, password, setupKey } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Admin password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Please provide either an email or mobile number for the admin account.' },
        { status: 400 }
      );
    }

    // Check existing admins count
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    // If an admin already exists, require the system secret setup key
    if (adminCount > 0) {
      const validKey =
        process.env.ADMIN_SETUP_KEY ||
        process.env.JWT_SECRET ||
        '10kakhail-admin-setup-2027';

      if (!setupKey || setupKey !== validKey) {
        return NextResponse.json(
          {
            error:
              'An administrator already exists. A valid Master Setup Key is required to create additional admins.',
          },
          { status: 403 }
        );
      }
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? normalizePakistaniPhone(phone) || phone.replace(/\D/g, '') : null;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    const passwordHash = await bcrypt.hash(password, 10);
    let adminUser;

    if (existingUser) {
      // Upgrade existing account to ADMIN with the new password
      adminUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          fullName: fullName?.trim() || existingUser.fullName || 'Platform Administrator',
          role: 'ADMIN',
          passwordHash,
          isVerified: true,
          phoneVerified: cleanPhone ? true : existingUser.phoneVerified,
          emailVerified: cleanEmail ? true : existingUser.emailVerified,
        },
      });
    } else {
      // Create fresh ADMIN user
      const referralCode = `10K-ADMIN${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      adminUser = await prisma.user.create({
        data: {
          fullName: fullName?.trim() || 'Platform Administrator',
          email: cleanEmail,
          phone: cleanPhone || `0300${Date.now().toString().slice(-7)}`,
          passwordHash,
          role: 'ADMIN',
          referralCode,
          isVerified: true,
          phoneVerified: true,
          emailVerified: !!cleanEmail,
        },
      });
    }

    // Issue JWT token
    const token = generateToken({
      userId: adminUser.id,
      phone: adminUser.phone,
      email: adminUser.email,
      role: 'ADMIN',
      fullName: adminUser.fullName,
    });

    const response = NextResponse.json({
      message: 'Administrator account created successfully!',
      user: {
        id: adminUser.id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminUser.role,
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
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during admin setup.' },
      { status: 500 }
    );
  }
}
