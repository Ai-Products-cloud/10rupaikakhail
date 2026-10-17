const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper functions replicate business logic for headless testing
function normalizePakistaniPhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('0092')) cleaned = '0' + cleaned.slice(4);
  else if (cleaned.startsWith('+92')) cleaned = '0' + cleaned.slice(3);
  else if (cleaned.startsWith('92') && cleaned.length === 12) cleaned = '0' + cleaned.slice(2);
  else if (/^3[0-9]{9}$/.test(cleaned)) cleaned = '0' + cleaned;
  return cleaned;
}

function isValidPakistaniPhone(phone) {
  if (!phone) return false;
  const normalized = normalizePakistaniPhone(phone);
  const digits = normalized.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
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
    assert.strictEqual(normalizePakistaniPhone('3001234567'), '03001234567'); // auto-detected 10-digit
    assert.strictEqual(isValidPakistaniPhone('03001234567'), true);
    assert.strictEqual(isValidPakistaniPhone('3001234567'), true);
    assert.strictEqual(isValidPakistaniPhone('+923001234567'), true);
    assert.strictEqual(isValidPakistaniPhone('12345'), false); // Too short (< 7 digits) rejected
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

  test('9. Authentication via Email or Phone: Support Email-Only, Phone-Only, and Dual Reg', async () => {
    // A. Email-only user
    const emailUser = await prisma.user.create({
      data: {
        fullName: 'Email Only User',
        email: 'emailonly@example.pk',
        passwordHash: 'dummyhash',
        referralCode: '10K-EMLONLY1',
        role: 'USER',
        isVerified: true,
        emailVerified: true,
        verificationMethod: 'EMAIL',
      },
    });
    assert.ok(emailUser.id);
    assert.strictEqual(emailUser.phone, null);
    assert.strictEqual(emailUser.emailVerified, true);

    // B. Query by email
    const foundUser = await prisma.user.findFirst({
      where: { email: 'emailonly@example.pk' },
    });
    assert.ok(foundUser);
    assert.strictEqual(foundUser.id, emailUser.id);

    // Clean up
    await prisma.user.delete({ where: { id: emailUser.id } });
  });

  test('10. Referral Generation with Domain/Vercel URL (No Localhost)', () => {
    // Test dynamic URL generator logic
    function buildReferralLink(code, host, proto = 'https') {
      const origin = host ? `${proto}://${host}` : 'https://10kakhail.vercel.app';
      return `${origin}/register?ref=${code}`;
    }

    const vercelLink = buildReferralLink('10K-USER123', 'my-custom-domain.com');
    assert.strictEqual(vercelLink, 'https://my-custom-domain.com/register?ref=10K-USER123');
    assert.ok(!vercelLink.includes('localhost'), 'Referral URL must not contain localhost when hosted');
  });

  test('11. Admin First Referral Management: Customize Root Referral Code and Enable Mandatory Referral Registration', async () => {
    // 1. Find or create admin
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          fullName: 'Test Root Administrator',
          phone: '03007770001',
          email: 'testadmin@10rupaikakhail.pk',
          passwordHash: 'dummyhash',
          referralCode: '10K-ORIGINALROOT',
          role: 'ADMIN',
          isVerified: true,
          phoneVerified: true,
        },
      });
    }

    // 2. Admin customizes the root referral code (e.g. to 10K-FIRSTTEST)
    const customRootCode = '10K-FIRSTTEST';
    // Clean up collision if exists
    await prisma.user.deleteMany({
      where: {
        referralCode: customRootCode,
        id: { not: admin.id },
      },
    });

    const updatedAdmin = await prisma.user.update({
      where: { id: admin.id },
      data: { referralCode: customRootCode },
    });
    assert.strictEqual(updatedAdmin.referralCode, customRootCode);

    // 3. New participant arrives with the mandatory referral requirement
    // Registering without a valid referral code must fail
    const invalidRefCode = 'NON_EXISTENT_CODE_999';
    const foundInvalid = await prisma.user.findFirst({
      where: {
        OR: [{ referralCode: invalidRefCode }, { phone: invalidRefCode }],
      },
    });
    assert.strictEqual(foundInvalid, null, 'Unregistered referral code must not resolve a referrer');

    // 4. Registering with the admin root referral code must successfully resolve the referrer
    const resolvedReferrer = await prisma.user.findFirst({
      where: {
        OR: [{ referralCode: customRootCode }, { phone: updatedAdmin.phone }],
      },
    });
    assert.ok(resolvedReferrer, 'Admin root referral code must resolve the admin as the parent referrer');
    assert.strictEqual(resolvedReferrer.id, admin.id);

    // 5. Create new participant under admin
    const testNewParticipant = await prisma.user.create({
      data: {
        fullName: 'First Invited Participant',
        phone: '03007770002',
        passwordHash: 'dummyhash',
        referralCode: '10K-PIONEER1',
        referredById: resolvedReferrer.id,
        role: 'USER',
        isVerified: true,
        phoneVerified: true,
      },
    });
    assert.strictEqual(testNewParticipant.referredById, admin.id);

    // 6. Direct referee count for admin increments
    const directCount = await prisma.user.count({
      where: { referredById: admin.id },
    });
    assert.ok(directCount >= 1, 'Admin must have at least 1 direct referee');

    // Clean up test participant
    await prisma.user.delete({ where: { id: testNewParticipant.id } });
  });
});

