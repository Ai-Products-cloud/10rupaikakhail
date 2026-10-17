import { NextResponse } from 'next/server';
import { getSessionUser, hashPassword, isValidPakistaniPhone, normalizePakistaniPhone } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const adminUser = await getSessionUser(request);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    // Fetch live admin record
    const admin = await prisma.user.findUnique({
      where: { id: adminUser.id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        referralCode: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin record not found.' }, { status: 404 });
    }

    // Determine domain URL
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (host?.includes('localhost') ? 'http' : 'https');

    let domainUrl = host ? `${proto}://${host}` : '';
    if (!domainUrl && process.env.NEXT_PUBLIC_APP_URL) {
      domainUrl = process.env.NEXT_PUBLIC_APP_URL;
    }
    if (!domainUrl) {
      domainUrl = 'https://10rupaikakhail.vercel.app';
    }

    // Count direct referrals brought in by this admin
    const directReferees = await prisma.user.findMany({
      where: { referredById: admin.id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        referralCode: true,
        createdAt: true,
        _count: {
          select: {
            entries: true,
            payments: true,
            referralsMade: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalDirectReferees = await prisma.user.count({
      where: { referredById: admin.id },
    });

    // Fetch pioneer / ambassador accounts created by admin
    const pioneers = await prisma.user.findMany({
      where: {
        referredById: admin.id,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        referralCode: true,
        createdAt: true,
        _count: {
          select: {
            referralsMade: true,
          },
        },
      },
      take: 20,
    });

    return NextResponse.json({
      rootReferral: {
        adminId: admin.id,
        fullName: admin.fullName,
        phone: admin.phone,
        email: admin.email,
        referralCode: admin.referralCode,
        referralLink: `${domainUrl}/register?ref=${admin.referralCode}`,
        phoneReferralLink: admin.phone ? `${domainUrl}/register?ref=${admin.phone}` : null,
        totalDirectReferees,
        referees: directReferees,
      },
      pioneers: pioneers.map((p) => ({
        ...p,
        referralLink: `${domainUrl}/register?ref=${p.referralCode}`,
        phoneReferralLink: p.phone ? `${domainUrl}/register?ref=${p.phone}` : null,
      })),
      domainUrl,
    });
  } catch (error: any) {
    console.error('Admin referrals fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve referral settings.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await getSessionUser(request);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    // Resolve base domain
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (host?.includes('localhost') ? 'http' : 'https');
    let domainUrl = host ? `${proto}://${host}` : '';
    if (!domainUrl && process.env.NEXT_PUBLIC_APP_URL) {
      domainUrl = process.env.NEXT_PUBLIC_APP_URL;
    }
    if (!domainUrl) domainUrl = 'https://10rupaikakhail.vercel.app';

    // ACTION 1: UPDATE ROOT REFERRAL CODE
    if (action === 'UPDATE_ROOT_CODE') {
      const { newReferralCode, newPhone } = body;

      if (!newReferralCode || typeof newReferralCode !== 'string' || newReferralCode.trim().length < 3) {
        return NextResponse.json(
          { error: 'Referral code must be at least 3 characters long.' },
          { status: 400 }
        );
      }

      const cleanCode = newReferralCode.trim().toUpperCase().replace(/[^A-Z0-9\-_]/g, '');

      // Check if another user already has this referral code
      const existingCode = await prisma.user.findFirst({
        where: {
          referralCode: cleanCode,
          id: { not: adminUser.id },
        },
      });

      if (existingCode) {
        return NextResponse.json(
          { error: `Referral code "${cleanCode}" is already taken by another user. Please choose another.` },
          { status: 409 }
        );
      }

      const updateData: any = {
        referralCode: cleanCode,
      };

      if (newPhone) {
        if (!isValidPakistaniPhone(newPhone)) {
          return NextResponse.json(
            { error: 'Invalid Pakistani mobile number for admin referral.' },
            { status: 400 }
          );
        }
        const normPhone = normalizePakistaniPhone(newPhone);
        const existingPhone = await prisma.user.findFirst({
          where: {
            phone: normPhone,
            id: { not: adminUser.id },
          },
        });
        if (existingPhone) {
          return NextResponse.json(
            { error: `Phone number "${normPhone}" is already associated with another account.` },
            { status: 409 }
          );
        }
        updateData.phone = normPhone;
      }

      const updated = await prisma.user.update({
        where: { id: adminUser.id },
        data: updateData,
      });

      // Update platform setting if present
      await prisma.platformSetting.upsert({
        where: { key: 'PRIMARY_REFERRAL_CODE' },
        create: {
          key: 'PRIMARY_REFERRAL_CODE',
          value: cleanCode,
          category: 'REFERRAL',
          description: 'Official primary root referral code for platform onboarding.',
        },
        update: {
          value: cleanCode,
        },
      });

      // Create Audit Log
      await prisma.auditLog.create({
        data: {
          adminId: adminUser.id,
          action: 'ROOT_REFERRAL_UPDATED',
          targetType: 'SETTING',
          targetId: cleanCode,
          details: JSON.stringify({
            previousCode: adminUser.referralCode,
            newCode: cleanCode,
            phone: updateData.phone || adminUser.phone,
          }),
        },
      });

      return NextResponse.json({
        message: 'Primary root referral code updated successfully.',
        rootReferral: {
          referralCode: updated.referralCode,
          phone: updated.phone,
          referralLink: `${domainUrl}/register?ref=${updated.referralCode}`,
          phoneReferralLink: updated.phone ? `${domainUrl}/register?ref=${updated.phone}` : null,
        },
      });
    }

    // ACTION 2: CREATE PIONEER / STARTER AMBASSADOR ACCOUNT
    if (action === 'CREATE_PIONEER_REFERRER') {
      const { fullName, phone, customCode, password } = body;

      if (!fullName || !fullName.trim()) {
        return NextResponse.json({ error: 'Ambassador full legal name is required.' }, { status: 400 });
      }

      if (!phone || !isValidPakistaniPhone(phone)) {
        return NextResponse.json(
          { error: 'Valid Pakistani mobile number (03xx...) is required.' },
          { status: 400 }
        );
      }

      const normalizedPhone = normalizePakistaniPhone(phone);
      const existingUser = await prisma.user.findFirst({
        where: { phone: normalizedPhone },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: `A participant with mobile number "${normalizedPhone}" already exists.` },
          { status: 409 }
        );
      }

      // Generate or clean referral code
      let referralCode = customCode
        ? customCode.trim().toUpperCase().replace(/[^A-Z0-9\-_]/g, '')
        : `10K-${fullName.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'VIP'}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Check code uniqueness
      const codeExists = await prisma.user.findFirst({ where: { referralCode } });
      if (codeExists) {
        return NextResponse.json(
          { error: `Referral code "${referralCode}" is already in use. Please choose another.` },
          { status: 409 }
        );
      }

      const rawPassword = password || 'PioneerUser123!';
      const passwordHash = await hashPassword(rawPassword);

      // Create pioneer user linked to admin as root
      const pioneerUser = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          phone: normalizedPhone,
          passwordHash,
          referralCode,
          referredById: adminUser.id,
          role: 'USER',
          isVerified: true,
          phoneVerified: true,
        },
      });

      // Create referral relationship
      await prisma.referral.create({
        data: {
          referrerId: adminUser.id,
          refereeId: pioneerUser.id,
          status: 'VERIFIED',
          verifiedAt: new Date(),
        },
      });

      // Record audit log
      await prisma.auditLog.create({
        data: {
          adminId: adminUser.id,
          action: 'PIONEER_AMBASSADOR_CREATED',
          targetType: 'USER',
          targetId: pioneerUser.id,
          details: JSON.stringify({
            fullName: pioneerUser.fullName,
            phone: pioneerUser.phone,
            referralCode: pioneerUser.referralCode,
          }),
        },
      });

      return NextResponse.json({
        message: 'Pioneer ambassador account created successfully.',
        pioneer: {
          id: pioneerUser.id,
          fullName: pioneerUser.fullName,
          phone: pioneerUser.phone,
          referralCode: pioneerUser.referralCode,
          referralLink: `${domainUrl}/register?ref=${pioneerUser.referralCode}`,
          phoneReferralLink: `${domainUrl}/register?ref=${pioneerUser.phone}`,
          temporaryPassword: rawPassword,
        },
      });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Admin referral creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process referral request.' },
      { status: 500 }
    );
  }
}
