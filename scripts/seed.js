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

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing dummy data and resetting to live system state (Admin only)...');

  // 1. Clean out all dummy entries, payments, referrals, winners, and non-admin users
  await prisma.winner.deleteMany({});
  await prisma.drawEntry.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.auditLog.deleteMany({});

  // Remove all users except admin (or clean all non-admin users)
  await prisma.user.deleteMany({
    where: {
      phone: { not: '03001234567' },
      email: { not: 'admin@10kakhail.pk' },
    },
  });

  // 2. Compliance & Legal Settings
  const settings = [
    {
      key: 'REAL_MONEY_PAYMENTS_ENABLED',
      value: 'false',
      category: 'LEGAL',
      description: 'Disabled until formal Pakistani legal counsel review and payment merchant licensing.',
    },
    {
      key: 'PAID_PRIZE_DRAWS_ENABLED',
      value: 'false',
      category: 'LEGAL',
      description: 'Disabled pending provincial competition license.',
    },
    {
      key: 'REFERRAL_BONUS_ENABLED',
      value: 'true',
      category: 'REFERRAL',
      description: 'Allows 1 bonus entry per verified referee in demo & production.',
    },
    {
      key: 'DEMO_MODE_ACTIVE',
      value: 'true',
      category: 'PAYMENT',
      description: 'Sandbox simulator mode active using simulated JazzCash & Easypaisa.',
    },
    {
      key: 'WINNER_SELECTION_MODE',
      value: 'RANKING',
      category: 'RULES',
      description: 'Referral ranking model (1st, 2nd, 3rd ranked participants).',
    },
    {
      key: 'LEGAL_REVIEW_STATUS',
      value: 'PENDING_PAKISTAN_LEGAL_COUNSEL_REVIEW',
      category: 'LEGAL',
      description: 'Awaiting formal legal review under provincial prize competitions acts and gambling regulations.',
    },
    {
      key: 'LEGAL_REVIEW_NOTES',
      value: 'Real-money payments and paid prize allocations are strictly disabled pending formal legal review by licensed Pakistani legal counsel under provincial prize competitions acts and gambling regulations.',
      category: 'LEGAL',
      description: 'Statutory compliance rationale.',
    },
  ];

  for (const s of settings) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  // 3. Create / Ensure Admin Account
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '03001234567' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
      phoneVerified: true,
      emailVerified: true,
    },
    create: {
      fullName: 'Chief Administrator',
      phone: '03001234567',
      email: 'admin@10kakhail.pk',
      passwordHash: adminPasswordHash,
      referralCode: '10K-ADMIN786',
      role: 'ADMIN',
      isVerified: true,
      phoneVerified: true,
      emailVerified: true,
      verificationMethod: 'PHONE',
    },
  });
  console.log('Live Admin verified:', admin.email, '(', admin.phone, ')');

  // 4. Create / Ensure Grand Pakistan Mega Draw 2027
  const drawEndDate = new Date('2027-03-23T23:59:59Z');
  
  // Clear any existing prizes on draw to rebuild cleanly
  const existingDraw = await prisma.draw.findUnique({
    where: { slug: 'mega-draw-2027' },
    include: { prizes: true },
  });

  let draw;
  if (existingDraw) {
    await prisma.prize.deleteMany({ where: { drawId: existingDraw.id } });
    draw = await prisma.draw.update({
      where: { id: existingDraw.id },
      data: {
        totalEntriesCount: 0,
        status: 'ACTIVE',
        prizes: {
          create: [
            {
              rank: 1,
              title: 'Bike',
              tagline: 'First Prize • Brand New Motorcycle',
              description:
                'Brand new fuel-efficient motorcycle built for reliable performance and everyday commute across Pakistan.',
              estimatedValue: '',
              model3dType: 'cd70',
              imageUrl: 'https://ahsanautos.pk/images/products/cd70-black-2027.webp',
              eligibilityRules: 'Pakistani CNIC holder. 18+ years old.',
            },
            {
              rank: 2,
              title: 'Smart Mobile',
              tagline: 'Second Prize • Touchscreen Smart Mobile Phone',
              description:
                'Modern PTA-approved touchscreen smartphone featuring vibrant high-resolution display, advanced multi-camera array, and all-day battery endurance.',
              estimatedValue: '',
              model3dType: 'iphone17',
              imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
              eligibilityRules: 'PTA-approved brand-new factory sealed unit.',
            },
            {
              rank: 3,
              title: 'Mobile',
              tagline: 'Third Prize • Mobile Phone',
              description:
                'Durable compact mobile phone engineered for loud & clear voice calls, wireless FM entertainment, and ultra-long battery standby.',
              estimatedValue: '',
              model3dType: 'android',
              imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
              eligibilityRules: 'PTA-approved with 1-Year Local Official Warranty.',
            },
          ],
        },
      },
    });
  } else {
    draw = await prisma.draw.create({
      data: {
        title: 'Grand Pakistan Mega Draw 2027',
        slug: 'mega-draw-2027',
        description:
          'Official 2027 Mega Draw for Pakistan. Win a brand-new Bike, Smart Mobile, or Mobile for just PKR 10.',
        entryFeePKR: 10,
        endDate: drawEndDate,
        status: 'ACTIVE',
        winnerSelectionMethod: 'RANKING',
        totalEntriesCount: 0,
        prizes: {
          create: [
            {
              rank: 1,
              title: 'Bike',
              tagline: 'First Prize • Brand New Motorcycle',
              description:
                'Brand new fuel-efficient motorcycle built for reliable performance and everyday commute across Pakistan.',
              estimatedValue: '',
              model3dType: 'cd70',
              imageUrl: 'https://ahsanautos.pk/images/products/cd70-black-2027.webp',
              eligibilityRules: 'Pakistani CNIC holder. 18+ years old.',
            },
            {
              rank: 2,
              title: 'Smart Mobile',
              tagline: 'Second Prize • Touchscreen Smart Mobile Phone',
              description:
                'Modern PTA-approved touchscreen smartphone featuring vibrant high-resolution display, advanced multi-camera array, and all-day battery endurance.',
              estimatedValue: '',
              model3dType: 'iphone17',
              imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
              eligibilityRules: 'PTA-approved brand-new factory sealed unit.',
            },
            {
              rank: 3,
              title: 'Mobile',
              tagline: 'Third Prize • Mobile Phone',
              description:
                'Durable compact mobile phone engineered for loud & clear voice calls, wireless FM entertainment, and ultra-long battery standby.',
              estimatedValue: '',
              model3dType: 'android',
              imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
              eligibilityRules: 'PTA-approved with 1-Year Local Official Warranty.',
            },
          ],
        },
      },
    });
  }

  console.log('Live draw prepared:', draw.title, 'Total entries: 0');

  // 5. Seed Official Event: Grand Pakistan Mega Draw 2027 (PKR 10 Entry)
  const concert = await prisma.concert.upsert({
    where: { slug: 'grand-pakistan-mega-draw-2027' },
    update: {
      title: 'Grand Pakistan Mega Draw 2027',
      feePaisa: 1000, // PKR 10 (1000 paisa)
      currency: 'PKR',
      status: 'ACTIVE',
    },
    create: {
      title: 'Grand Pakistan Mega Draw 2027',
      slug: 'grand-pakistan-mega-draw-2027',
      description:
        'Official 10 Rupai Ka Khail entry. One-time PKR 10 entry fee securely processed via Safepay gives you an official entry ticket to win 1st Prize Bike, 2nd Prize Smart Mobile, or 3rd Prize Mobile.',
      venue: 'National Grand Mega Draw • Pakistan',
      eventDate: new Date('2027-03-23T23:59:59Z'),
      feePaisa: 1000, // PKR 10 (1000 paisa)
      currency: 'PKR',
      status: 'ACTIVE',
    },
  });

  // Deactivate any old concert entry
  await prisma.concert.updateMany({
    where: { slug: 'pakistan-music-fest-2026' },
    data: { status: 'INACTIVE' },
  });

  console.log('Official draw seeded:', concert.title, '(Fee: PKR 10 / 1000 paisa)');

  console.log('Database reset to clean state with Administrator account and Concert.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
