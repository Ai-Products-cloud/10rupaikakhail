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

export {
  normalizePhone,
  normalizePakistaniPhone,
  isValidPakistaniPhone,
  isValidPhone,
} from './phoneValidation';

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

export async function getSessionUser(request?: Request) {
  try {
    let token: string | undefined;

    if (request) {
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      try {
        const cookieStore = cookies();
        token = cookieStore.get('token')?.value;
      } catch {
        // cookies() may throw if called outside Next.js request context
      }
    }

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
