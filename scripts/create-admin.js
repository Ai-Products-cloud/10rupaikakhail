#!/usr/bin/env node

/**
 * Secure Manual Admin Creation Script
 * 
 * Usage:
 *   node scripts/create-admin.js --email=admin@yourdomain.com --password=YourPassword123! --phone=03001234567 --name="Admin Name"
 * 
 * Or via environment variables:
 *   ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=... node scripts/create-admin.js
 * 
 * This ensures credentials are NEVER committed to GitHub repository.
 */

// Load environment variables if available
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch {
  // Ignore if .env doesn't exist or is already loaded
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

function getArg(flag) {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  if (arg) return arg.split('=')[1];
  return null;
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n=========================================');
  console.log('   10kakhail Secure Admin Account Setup  ');
  console.log('=========================================\n');

  let email = getArg('email') || process.env.ADMIN_EMAIL;
  let password = getArg('password') || process.env.ADMIN_PASSWORD;
  let phone = getArg('phone') || process.env.ADMIN_PHONE;
  let fullName = getArg('name') || process.env.ADMIN_NAME || 'Platform Administrator';

  const isInteractive = !email && !phone && !password;

  if (isInteractive) {
    email = await ask('Enter Admin Email: ');
    phone = await ask('Enter Admin Phone Number (or press Enter to skip): ');
    password = await ask('Enter Strong Admin Password (min 6 chars): ');
  } else {
    if (!email && !phone) {
      email = await ask('Enter Admin Email: ');
    }
    if (!password) {
      password = await ask('Enter Admin Password: ');
    }
  }

  if (!password || password.length < 6) {
    console.error('Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  const cleanPhone = phone ? phone.replace(/[\s\-\(\)\.]/g, '') : null;
  const cleanEmail = email ? email.trim().toLowerCase() : null;

  console.log('\nHashing admin password securely with bcrypt...');
  const passwordHash = await bcrypt.hash(password, 10);
  const referralCode = `10K-ADMIN${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Find existing admin by phone or email
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        { role: 'ADMIN' },
      ],
    },
  });

  let adminUser;
  if (existing) {
    adminUser = await prisma.user.update({
      where: { id: existing.id },
      data: {
        fullName: fullName || existing.fullName,
        email: cleanEmail || existing.email,
        phone: cleanPhone || existing.phone,
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
        phoneVerified: !!cleanPhone,
        emailVerified: !!cleanEmail,
      },
    });
    console.log(`\nExisting Admin updated successfully! ID: ${adminUser.id}`);
  } else {
    adminUser = await prisma.user.create({
      data: {
        fullName,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        referralCode,
        role: 'ADMIN',
        isVerified: true,
        phoneVerified: !!cleanPhone,
        emailVerified: !!cleanEmail,
        verificationMethod: cleanEmail ? 'EMAIL' : 'PHONE',
      },
    });
    console.log(`\nNew Admin created successfully! ID: ${adminUser.id}`);
  }

  console.log('-----------------------------------------');
  console.log('Login Email/Phone: ', adminUser.email || adminUser.phone);
  console.log('Role:              ', adminUser.role);
  console.log('Referral Code:     ', adminUser.referralCode);
  console.log('Verified:          ', adminUser.isVerified);
  console.log('-----------------------------------------');
  console.log('Notice: Credentials are saved securely to your active database.');
  console.log('No secrets were written to git or any tracked file.\n');
}

main()
  .catch((e) => {
    console.error('Setup error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
