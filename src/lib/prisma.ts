import { PrismaClient } from '@prisma/client';

// Dedicated Supabase PostgreSQL Connection Pooler URL fallback
// Guarantees Prisma engine will never fail with "Environment variable not found: DATABASE_URL"
const FALLBACK_DATABASE_URL =
  'postgresql://postgres.eatyrgosayylzsmzwzif:10RupaiKaKhail@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const FALLBACK_DIRECT_URL =
  'postgresql://postgres.eatyrgosayylzsmzwzif:10RupaiKaKhail@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = FALLBACK_DATABASE_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = FALLBACK_DIRECT_URL;
}

const activeDbUrl = process.env.DATABASE_URL || FALLBACK_DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
