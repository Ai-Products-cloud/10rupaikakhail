const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 10kakhail database...');

  // 1. Compliance & Legal Settings
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

  // 2. Create Admin Account
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '03001234567' },
    update: {},
    create: {
      fullName: 'Chief Administrator',
      phone: '03001234567',
      email: 'admin@10kakhail.pk',
      passwordHash: adminPasswordHash,
      referralCode: '10K-ADMIN786',
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('Admin created:', admin.email);

  // 3. Create Grand Draw 2027
  const drawEndDate = new Date('2027-03-23T23:59:59Z');
  const draw = await prisma.draw.upsert({
    where: { slug: 'mega-draw-2027' },
    update: {},
    create: {
      title: 'Grand Pakistan Mega Draw 2027',
      slug: 'mega-draw-2027',
      description:
        'Official 2027 Mega Draw for Pakistan. Win a brand-new Honda CD 70 2027 Model, iPhone 17 Pro Max, or Android Smartphone for just PKR 10.',
      entryFeePKR: 10,
      endDate: drawEndDate,
      status: 'ACTIVE',
      winnerSelectionMethod: 'RANKING',
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
  console.log('Draw created:', draw.title);

  // 4. Create Demo Participants
  const demoUsers = [
    {
      fullName: 'Hamza Khan',
      phone: '03019876543',
      email: 'hamza@example.pk',
      code: '10K-HAMZA82',
    },
    {
      fullName: 'Ali Raza',
      phone: '03215554321',
      email: 'ali@example.pk',
      code: '10K-ALIR99',
    },
    {
      fullName: 'Fatima Zahra',
      phone: '03337778899',
      email: 'fatima@example.pk',
      code: '10K-FATIM7',
    },
    {
      fullName: 'Bilal Ahmed',
      phone: '03451122334',
      email: 'bilal@example.pk',
      code: '10K-BILAL1',
    },
    {
      fullName: 'Usman Tariq',
      phone: '03124455667',
      email: 'usman@example.pk',
      code: '10K-USMAN5',
    },
  ];

  const defaultUserPassword = await bcrypt.hash('UserPassword123!', 10);
  const createdUsers = [];

  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: {
        fullName: u.fullName,
        phone: u.phone,
        email: u.email,
        passwordHash: defaultUserPassword,
        referralCode: u.code,
        role: 'USER',
        isVerified: true,
      },
    });
    createdUsers.push(user);
  }

  // 5. Create Entries & Referrals for Top Participants
  // Hamza Khan (#1 with 7 referrals)
  // Ali Raza (#2 with 5 referrals)
  // Fatima Zahra (#3 with 3 referrals)
  const hamza = createdUsers[0];
  const ali = createdUsers[1];
  const fatima = createdUsers[2];

  // Helper to add simulated entry
  async function addEntry(userId, entryType = 'STANDARD', referralId = null) {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const entryNumber = `10KK-ENT-${Date.now().toString().slice(-4)}-${randomHex}`;
    return await prisma.drawEntry.create({
      data: {
        entryNumber,
        userId,
        drawId: draw.id,
        entryType,
        status: 'ACTIVE',
        referralId,
      },
    });
  }

  // Base entries
  for (const u of createdUsers) {
    const exists = await prisma.drawEntry.findFirst({
      where: { userId: u.id, drawId: draw.id },
    });
    if (!exists) {
      await addEntry(u.id, 'STANDARD');
      await prisma.payment.create({
        data: {
          transactionRef: `JC-SIM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          idempotencyKey: `IDEM-SEED-${u.id}`,
          userId: u.id,
          drawId: draw.id,
          amountPKR: 10,
          method: 'SIMULATED_WALLET',
          status: 'SUCCESS',
          isSimulated: true,
          payerAccount: u.phone,
          verifiedAt: new Date(),
        },
      });
    }
  }

  // Generate verified referrals for Hamza (7 verified), Ali (5 verified), Fatima (3 verified)
  async function createVerifiedReferralChain(referrer, count, baseTimestampMinutesAgo) {
    for (let i = 1; i <= count; i++) {
      const refereePhone = `0399${referrer.phone.slice(-3)}${String(i).padStart(4, '0')}`;
      const referee = await prisma.user.upsert({
        where: { phone: refereePhone },
        update: {},
        create: {
          fullName: `Ref Participant ${i}`,
          phone: refereePhone,
          passwordHash: defaultUserPassword,
          referralCode: `10K-REF${referrer.id.slice(0, 3)}${i}`,
          isVerified: true,
          referredById: referrer.id,
        },
      });

      const refTime = new Date(Date.now() - (baseTimestampMinutesAgo - i * 5) * 60 * 1000);

      const existingRef = await prisma.referral.findUnique({
        where: { refereeId: referee.id },
      });

      if (!existingRef) {
        // Create bonus entry for referrer
        const bonusEntry = await prisma.drawEntry.create({
          data: {
            entryNumber: `10KK-BONUS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            userId: referrer.id,
            drawId: draw.id,
            entryType: 'REFERRAL_BONUS',
            status: 'ACTIVE',
            createdAt: refTime,
          },
        });

        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: referee.id,
            drawId: draw.id,
            status: 'VERIFIED',
            bonusEntryAwarded: true,
            bonusEntryId: bonusEntry.id,
            verifiedAt: refTime,
            createdAt: refTime,
          },
        });
      }
    }
  }

  await createVerifiedReferralChain(hamza, 7, 300);
  await createVerifiedReferralChain(ali, 5, 200);
  await createVerifiedReferralChain(fatima, 3, 100);

  // Update total draw entries count
  const totalEntries = await prisma.drawEntry.count({
    where: { drawId: draw.id, status: 'ACTIVE' },
  });
  await prisma.draw.update({
    where: { id: draw.id },
    data: { totalEntriesCount: totalEntries },
  });

  console.log('Database seeded successfully with verified demo participants & leaderboard standings!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
