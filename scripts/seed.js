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
              title: 'Honda CD 70 2027 Model',
              tagline: 'First Prize • Brand New 2027 Pakistani Motorcycle',
              description:
                'The pride of Pakistan with 2027 aerodynamic graphics, 4-stroke OHC engine, and crystal chrome finish.',
              estimatedValue: 'PKR 185,000',
              model3dType: 'cd70',
              imageUrl: 'https://ahsanautos.pk/images/products/cd70-black-2027.webp',
              eligibilityRules: 'Pakistani CNIC holder. 18+ years old.',
            },
            {
              rank: 2,
              title: 'iPhone 17 Pro Max',
              tagline: 'Second Prize • Desert Titanium Flagship',
              description:
                'Titanium grade 5 chassis with ProMotion 120Hz display and periscope telephoto optical zoom system.',
              estimatedValue: 'PKR 495,000',
              model3dType: 'iphone17',
              imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
              eligibilityRules: 'PTA-approved brand-new factory sealed unit.',
            },
            {
              rank: 3,
              title: 'Android Flagship Smartphone',
              tagline: 'Third Prize • High-Performance AMOLED Flagship',
              description:
                '120Hz Curved AMOLED display, 108MP Quad camera array, 5000mAh battery with 67W Turbo Fast Charging.',
              estimatedValue: 'PKR 145,000',
              model3dType: 'android',
              imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
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
          'Official 2027 Mega Draw for Pakistan. Win a brand-new Honda CD 70 2027 Model, iPhone 17 Pro Max, or Android Smartphone for just PKR 10.',
        entryFeePKR: 10,
        endDate: drawEndDate,
        status: 'ACTIVE',
        winnerSelectionMethod: 'RANKING',
        totalEntriesCount: 0,
        prizes: {
          create: [
            {
              rank: 1,
              title: 'Honda CD 70 2027 Model',
              tagline: 'First Prize • Brand New 2027 Pakistani Motorcycle',
              description:
                'The pride of Pakistan with 2027 aerodynamic graphics, 4-stroke OHC engine, and crystal chrome finish.',
              estimatedValue: 'PKR 185,000',
              model3dType: 'cd70',
              imageUrl: 'https://ahsanautos.pk/images/products/cd70-black-2027.webp',
              eligibilityRules: 'Pakistani CNIC holder. 18+ years old.',
            },
            {
              rank: 2,
              title: 'iPhone 17 Pro Max',
              tagline: 'Second Prize • Desert Titanium Flagship',
              description:
                'Titanium grade 5 chassis with ProMotion 120Hz display and periscope telephoto optical zoom system.',
              estimatedValue: 'PKR 495,000',
              model3dType: 'iphone17',
              imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
              eligibilityRules: 'PTA-approved brand-new factory sealed unit.',
            },
            {
              rank: 3,
              title: 'Android Flagship Smartphone',
              tagline: 'Third Prize • High-Performance AMOLED Flagship',
              description:
                '120Hz Curved AMOLED display, 108MP Quad camera array, 5000mAh battery with 67W Turbo Fast Charging.',
              estimatedValue: 'PKR 145,000',
              model3dType: 'android',
              imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
              eligibilityRules: 'PTA-approved with 1-Year Local Official Warranty.',
            },
          ],
        },
      },
    });
  }

  console.log('Live draw prepared:', draw.title, 'Total entries: 0');
  console.log('Database reset to clean state with ONLY Administrator account.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
