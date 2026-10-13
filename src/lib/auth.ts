import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || '10kakhail-super-secure-production-ready-jwt-secret-key-pk-2027';

export interface TokenPayload {
  userId: string;
  phone?: string | null;
  email?: string | null;
  role: string;
  fullName: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Flexible phone number normalization:
 * Automatically cleans formatting and handles +92, 0092, 92, leading 0, or 10-digit formats.
 */
export function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('0092')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('+92')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('92') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  } else if (/^3[0-9]{9}$/.test(cleaned)) {
    // Automatically detect Pakistani 10-digit mobile number without leading 0 (e.g. 3001234567)
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

export const normalizePakistaniPhone = normalizePhone;

/**
 * Validates any real phone number:
 * Accepts any real phone number (7 to 15 digits according to standard E.164 telecommunications range).
 */
export function isValidPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  const digitsOnly = normalized.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

export const isValidPakistaniPhone = isValidPhone;

/**
 * Validates email addresses
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Generates an attractive, clean referral code: e.g. 10K-HAMZA82 or 10K-9X82Z
 */
export function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'USER';
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `10K-${cleanName}${randomChars}`;
}

export async function getSessionUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        referralCode: true,
        role: true,
        isVerified: true,
        phoneVerified: true,
        emailVerified: true,
        verificationMethod: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}
