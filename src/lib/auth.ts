import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || '10kakhail-super-secure-production-ready-jwt-secret-key-pk-2027';

export interface TokenPayload {
  userId: string;
  phone: string;
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
 * Normalizes Pakistani phone numbers to standard format 03XXXXXXXXX
 */
export function normalizePakistaniPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+92')) {
    return '0' + cleaned.slice(3);
  }
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return '0' + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Validates Pakistani mobile numbers (0300 to 0349 series, 11 digits)
 */
export function isValidPakistaniPhone(phone: string): boolean {
  const normalized = normalizePakistaniPhone(phone);
  return /^03[0-9]{9}$/.test(normalized);
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
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}
