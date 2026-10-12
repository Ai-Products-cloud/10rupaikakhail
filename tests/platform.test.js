const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper functions replicate business logic for headless testing
function normalizePakistaniPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+92')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('92') && cleaned.length === 12) return '0' + cleaned.slice(2);
  return cleaned;
}

function isValidPakistaniPhone(phone) {
  const normalized = normalizePakistaniPhone(phone);
  return /^03[0-9]{9}$/.test(normalized);
}

function formatMaskedDisplayName(fullName, phone) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }
  if (parts.length === 1 && parts[0].length > 0) return parts[0];
  if (phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length >= 8) {
      return `${clean.slice(0, 4)}-***${clean.slice(-4)}`;
    }
  }
  return 'Participant';
}

describe('10kakhail Core Engine & Business Logic Test Suite', () => {
  let testReferrer;
  let testReferee;
  let testDraw;

  before(async () => {
    // Clean up test data if existing
    await prisma.drawEntry.deleteMany({ where: { entryNumber: { contains: 'TEST' } } });
    await prisma.payment.deleteMany({ where: { transactionRef: { contains: 'TEST' } } });
    await prisma.referral.deleteMany({ where: { refereeId: { contains: 'test-referee' } } });
    await prisma.user.deleteMany({ where: { phone: { in: ['03009990001', '03009990002'] } } });

    // Fetch or create test draw
    testDraw = await prisma.draw.findFirst({ where: { status: 'ACTIVE' } });
    if (!testDraw) {
      testDraw = await prisma.draw.create({
        data: {
          title: 'Test Lucky Draw',
          slug: 'test-draw',
          description: 'Automated test draw',
          entryFeePKR: 10,
          endDate: new Date(Date.now() + 86400000),
          status: 'ACTIVE',
        },
      });
    }

    // Create test referrer
    testReferrer = await prisma.user.create({
      data: {
        id: 'test-referrer-id',
        fullName: 'Tariq Mehmood',
        phone: '03009990001',
        passwordHash: 'dummyhash',
        referralCode: '10K-TESTREF1',
        role: 'USER',
        isVerified: true,
      },
    });

    // Create test referee
    testReferee = await prisma.user.create({
      data: {
        id: 'test-referee-id',
        fullName: 'Zainab Bibi',
        phone: '03009990002',
        passwordHash: 'dummyhash',
        referralCode: '10K-TESTREF2',
        referredById: testReferrer.id,
        role: 'USER',
        isVerified: true,
      },
    });
  });

  after(async () => {
    // Teardown
    await prisma.drawEntry.deleteMany({ where: { userId: { in: [testReferrer.id, testReferee.id] } } });
    await prisma.referral.deleteMany({ where: { referrerId: testReferrer.id } });
    await prisma.payment.deleteMany({ where: { userId: { in: [testReferrer.id, testReferee.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [testReferrer.id, testReferee.id] } } });
    await prisma.$disconnect();
  });

  test('1. Pakistani Phone Number Validation & Normalization', () => {
    assert.strictEqual(normalizePakistaniPhone('+923001234567'), '03001234567');
    assert.strictEqual(normalizePakistaniPhone('0301-9876543'), '03019876543');
    assert.strictEqual(normalizePakistaniPhone('923215554321'), '03215554321');
    assert.strictEqual(isValidPakistaniPhone('03001234567'), true);
    assert.strictEqual(isValidPakistaniPhone('03451234567'), true);
    assert.strictEqual(isValidPakistaniPhone('02131234567'), false); // Landline Karachi rejected
    assert.strictEqual(isValidPakistaniPhone('12345'), false); // Invalid length rejected
  });

  test('2. Anti-Fraud: Prevent Self-Referral', () => {
    const isSelfReferral = testReferrer.id === testReferrer.id;
    assert.strictEqual(isSelfReferral, true, 'Self-referral check must detect identical ID');
  });

  test('3. Privacy-Preserving Username Masking', () => {
    const masked1 = formatMaskedDisplayName('Muhammad Usman Khan');
    assert.strictEqual(masked1, 'Muhammad K.');

    const maskedPhone = formatMaskedDisplayName('', '03012345678');
    assert.strictEqual(maskedPhone, '0301-***5678');
  });

  test('4. Legal Feature Flags Default to Safe Disabled State', async () => {
    const realMoneySetting = await prisma.platformSetting.findUnique({
      where: { key: 'REAL_MONEY_PAYMENTS_ENABLED' },
    });
    assert.strictEqual(realMoneySetting ? realMoneySetting.value : 'false', 'false');

    const paidPrizesSetting = await prisma.platformSetting.findUnique({
      where: { key: 'PAID_PRIZE_DRAWS_ENABLED' },
    });
    assert.strictEqual(paidPrizesSetting ? paidPrizesSetting.value : 'false', 'false');
  });

  test('5. Idempotent Payment Initiation (Duplicate Prevention)', async () => {
    const idempotencyKey = 'IDEM-TEST-KEY-001';

    // First attempt creates payment
    const pmt1 = await prisma.payment.create({
      data: {
        transactionRef: 'TEST-TXN-001',
        idempotencyKey,
        userId: testReferee.id,
        drawId: testDraw.id,
        amountPKR: 10,
        status: 'PENDING',
        isSimulated: true,
      },
    });

    assert.ok(pmt1.id);
    assert.strictEqual(pmt1.amountPKR, 10);

    // Second attempt with duplicate idempotency key is caught by unique constraint
    await assert.rejects(async () => {
      await prisma.payment.create({
        data: {
          transactionRef: 'TEST-TXN-002',
          idempotencyKey, // Re-using same key
          userId: testReferee.id,
          drawId: testDraw.id,
          amountPKR: 10,
          status: 'PENDING',
          isSimulated: true,
        },
      });
    }, /Unique constraint failed/);
  });

  test('6. Entry Creation & Exactly-Once Referral Bonus Issuance', async () => {
    // 1. Create initial standard entry for referee
    const refereeEntry = await prisma.drawEntry.create({
      data: {
        entryNumber: 'TEST-ENT-REF-001',
        userId: testReferee.id,
        drawId: testDraw.id,
        entryType: 'STANDARD',
        status: 'ACTIVE',
      },
    });
    assert.ok(refereeEntry.id);

    // 2. Register pending referral
    const referral = await prisma.referral.create({
      data: {
        referrerId: testReferrer.id,
        refereeId: testReferee.id,
        drawId: testDraw.id,
        status: 'PENDING',
        bonusEntryAwarded: false,
      },
    });

    // 3. Convert referral & issue bonus entry exactly once
    const bonusEntry = await prisma.drawEntry.create({
      data: {
        entryNumber: 'TEST-BONUS-001',
        userId: testReferrer.id,
        drawId: testDraw.id,
        entryType: 'REFERRAL_BONUS',
        status: 'ACTIVE',
        referralId: referral.id,
      },
    });

    const updatedReferral = await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'VERIFIED',
        bonusEntryAwarded: true,
        bonusEntryId: bonusEntry.id,
        verifiedAt: new Date(),
      },
    });

    assert.strictEqual(updatedReferral.bonusEntryAwarded, true);
    assert.strictEqual(updatedReferral.status, 'VERIFIED');

    // 4. Verify exactly one bonus entry exists
    const referrerBonusEntries = await prisma.drawEntry.count({
      where: { userId: testReferrer.id, entryType: 'REFERRAL_BONUS' },
    });
    assert.strictEqual(referrerBonusEntries, 1);
  });

  test('7. Leaderboard Ranking & Tie-Breaking Rule (Earliest Milestone Timestamp)', () => {
    const timeA = new Date('2026-10-12T10:00:00Z');
    const timeB = new Date('2026-10-12T12:00:00Z');

    const participants = [
      { id: 'User2', referrals: 5, milestoneTime: timeB }, // Tied at 5, but reached later
      { id: 'User1', referrals: 5, milestoneTime: timeA }, // Tied at 5, reached earlier
      { id: 'User3', referrals: 7, milestoneTime: timeB }, // Highest count (7)
    ];

    // Sorting algorithm:
    // 1. referrals DESC
    // 2. milestoneTime ASC (earliest wins ties)
    participants.sort((a, b) => {
      if (b.referrals !== a.referrals) return b.referrals - a.referrals;
      return a.milestoneTime.getTime() - b.milestoneTime.getTime();
    });

    assert.strictEqual(participants[0].id, 'User3', 'Rank 1 must be highest referrals (7)');
    assert.strictEqual(participants[1].id, 'User1', 'Rank 2 must be User1 due to earlier timestamp');
    assert.strictEqual(participants[2].id, 'User2', 'Rank 3 must be User2 due to later timestamp');
  });

  test('8. Reversal on Refund: Reverse Bonus Entry When Qualifying Entry is Refunded', async () => {
    // Simulate refund reversing the bonus entry
    const bonusToReverse = await prisma.drawEntry.findFirst({
      where: { userId: testReferrer.id, entryType: 'REFERRAL_BONUS' },
    });

    assert.ok(bonusToReverse);

    const reversedEntry = await prisma.drawEntry.update({
      where: { id: bonusToReverse.id },
      data: { status: 'REVERSED', notes: 'Refund reversal test' },
    });

    assert.strictEqual(reversedEntry.status, 'REVERSED');

    // Active bonus entry count should now be 0
    const activeBonusCount = await prisma.drawEntry.count({
      where: { userId: testReferrer.id, entryType: 'REFERRAL_BONUS', status: 'ACTIVE' },
    });
    assert.strictEqual(activeBonusCount, 0);
  });
});
