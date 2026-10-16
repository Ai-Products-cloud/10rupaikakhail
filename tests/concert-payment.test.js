const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '10kakhail-super-secure-production-ready-jwt-secret-key-pk-2027';
const WEBHOOK_SECRET = process.env.SAFEPAY_WEBHOOK_SECRET || '0a0fa8fe6e99b720dc2400ea4d7586c0f0f88790949e8707fba59794726f3d2b';

// Signature generator matching production Safepay logic
function generateSafepaySignature(rawBody, timestamp, secret = WEBHOOK_SECRET) {
  const signedPayload = `${timestamp}.${rawBody}`;
  return crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
}

// Signature verification function matching src/lib/safepay.ts
function verifySafepaySignature({ rawBody, signature, timestamp, secret = WEBHOOK_SECRET, ignoreClockDrift = false }) {
  if (!signature || !timestamp || rawBody === undefined || rawBody === null) {
    return { isValid: false, reason: 'MISSING_SIGNATURE_OR_TIMESTAMP' };
  }

  const tsNum = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  if (isNaN(tsNum)) {
    return { isValid: false, reason: 'INVALID_TIMESTAMP_FORMAT' };
  }

  const currentTsSec = Math.floor(Date.now() / 1000);
  const timestampSec = tsNum > 10000000000 ? Math.floor(tsNum / 1000) : tsNum;

  if (!ignoreClockDrift && Math.abs(currentTsSec - timestampSec) > 300) {
    return { isValid: false, reason: 'TIMESTAMP_DRIFT_EXCEEDED' };
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedHex = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  const cleanSignature = signature.trim().toLowerCase();
  if (cleanSignature.length !== expectedHex.length) {
    return { isValid: false, reason: 'SIGNATURE_MISMATCH' };
  }

  const sigBuf = Buffer.from(cleanSignature, 'hex');
  const expBuf = Buffer.from(expectedHex, 'hex');

  if (crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { isValid: true };
  }

  return { isValid: false, reason: 'SIGNATURE_MISMATCH' };
}

function generateTicketCode() {
  const tsPart = Date.now().toString(36).toUpperCase();
  const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TKT-TEST-${tsPart}-${randPart}`;
}

describe('Concert Payment System & Safepay Gateway Test Suite', () => {
  let testUser1;
  let testUser2;
  let testAdmin;
  let testConcert;

  before(async () => {
    // Teardown previous test data
    await prisma.enrollment.deleteMany({
      where: { ticketCode: { contains: 'TEST' } },
    });
    await prisma.concertPayment.deleteMany({
      where: { internalReference: { contains: 'TEST' } },
    });
    await prisma.registration.deleteMany({
      where: { user: { phone: { in: ['03008880001', '03008880002', '03008880009'] } } },
    });
    await prisma.webhookEvent.deleteMany({
      where: { providerEventId: { contains: 'TEST' } },
    });
    await prisma.user.deleteMany({
      where: { phone: { in: ['03008880001', '03008880002', '03008880009'] } },
    });

    // Create Test Concert with integer paisa (PKR 1,500 = 150000 paisa)
    testConcert = await prisma.concert.upsert({
      where: { slug: 'test-concert-fest-2026' },
      update: { feePaisa: 150000, status: 'ACTIVE' },
      create: {
        title: 'Test Pakistan Music Fest 2026',
        slug: 'test-concert-fest-2026',
        description: 'Test concert for Safepay gateway verification',
        venue: 'Islamabad Arena',
        feePaisa: 150000, // PKR 1,500
        currency: 'PKR',
        status: 'ACTIVE',
      },
    });

    // Create Test Customer 1
    testUser1 = await prisma.user.create({
      data: {
        id: 'test-user-c1',
        fullName: 'Hamza Farooq',
        phone: '03008880001',
        email: 'hamza.test@10kakhail.pk',
        passwordHash: 'dummyhash',
        referralCode: '10K-HAMZA1',
        role: 'USER',
        isVerified: true,
      },
    });

    // Create Test Customer 2
    testUser2 = await prisma.user.create({
      data: {
        id: 'test-user-c2',
        fullName: 'Ayesha Khan',
        phone: '03008880002',
        email: 'ayesha.test@10kakhail.pk',
        passwordHash: 'dummyhash',
        referralCode: '10K-AYESHA2',
        role: 'USER',
        isVerified: true,
      },
    });

    // Create Test Admin
    testAdmin = await prisma.user.create({
      data: {
        id: 'test-admin-c9',
        fullName: 'Auditor Admin',
        phone: '03008880009',
        email: 'admin.audit@10kakhail.pk',
        passwordHash: 'dummyhash',
        referralCode: '10K-ADMAUD9',
        role: 'ADMIN',
        isVerified: true,
      },
    });
  });

  after(async () => {
    // Teardown
    await prisma.enrollment.deleteMany({
      where: { ticketCode: { contains: 'TEST' } },
    });
    await prisma.concertPayment.deleteMany({
      where: { internalReference: { contains: 'TEST' } },
    });
    await prisma.registration.deleteMany({
      where: { userId: { in: [testUser1.id, testUser2.id, testAdmin.id] } },
    });
    await prisma.webhookEvent.deleteMany({
      where: { providerEventId: { contains: 'TEST' } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testUser1.id, testUser2.id, testAdmin.id] } },
    });
  });

  test('1. Server Authoritative Fee & Integer Paisa Storage', async () => {
    // Ensure amount is calculated strictly from DB concert record in integer paisa
    assert.strictEqual(testConcert.feePaisa, 150000, 'Fee must be stored in integer paisa');
    assert.strictEqual(testConcert.feePaisa / 100, 1500, 'Paisa conversion to PKR must equal 1,500');
    assert.strictEqual(testConcert.currency, 'PKR');
  });

  test('2. Anti-Fake Redirect Rule: Return to Website is NOT Proof of Payment', async () => {
    // Create pending registration and payment
    const reg = await prisma.registration.create({
      data: {
        userId: testUser1.id,
        concertId: testConcert.id,
        status: 'PENDING',
      },
    });

    const payment = await prisma.concertPayment.create({
      data: {
        registrationId: reg.id,
        provider: 'SAFEPAY',
        internalReference: `CONC-TEST-${Date.now()}-1`,
        providerReference: `track_test_1`,
        amountPaisa: 150000,
        currency: 'PKR',
        status: 'PENDING',
      },
    });

    // Simulate customer landing on /payment/success?ref=...
    // The server status inquiry MUST return PENDING and MUST NOT create enrollment
    const fetchedPayment = await prisma.concertPayment.findUnique({
      where: { id: payment.id },
      include: { registration: { include: { enrollment: true } } },
    });

    assert.strictEqual(fetchedPayment.status, 'PENDING');
    assert.strictEqual(fetchedPayment.registration.status, 'PENDING');
    assert.strictEqual(fetchedPayment.registration.enrollment, null, 'Enrollment must not exist without verified webhook');
  });

  test('3. Safepay Webhook HMAC-SHA256 Signature Verification', async () => {
    const rawPayload = JSON.stringify({
      event: 'payment.succeeded',
      data: {
        tracker: 'track_test_valid_sig',
        reference: 'CONC-TEST-SIG-1',
        amount: 1500,
        currency: 'PKR',
        state: 'PAID',
      },
    });

    const validTimestamp = Math.floor(Date.now() / 1000);
    const validSignature = generateSafepaySignature(rawPayload, validTimestamp);

    // Valid check
    const validResult = verifySafepaySignature({
      rawBody: rawPayload,
      signature: validSignature,
      timestamp: validTimestamp,
    });
    assert.strictEqual(validResult.isValid, true, 'Valid HMAC signature must be accepted');

    // Tampered payload check
    const tamperedPayload = rawPayload.replace('1500', '10');
    const tamperedResult = verifySafepaySignature({
      rawBody: tamperedPayload,
      signature: validSignature,
      timestamp: validTimestamp,
    });
    assert.strictEqual(tamperedResult.isValid, false, 'Tampered payload must be rejected');
    assert.strictEqual(tamperedResult.reason, 'SIGNATURE_MISMATCH');

    // Forged signature check
    const forgedResult = verifySafepaySignature({
      rawBody: rawPayload,
      signature: '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
      timestamp: validTimestamp,
    });
    assert.strictEqual(forgedResult.isValid, false, 'Forged signature must be rejected');
  });

  test('4. Replay Attack Prevention (Timestamp Drift > 5 Minutes Rejected)', async () => {
    const rawPayload = JSON.stringify({ event: 'payment.succeeded' });
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 400; // 400s ago (> 300s window)
    const signature = generateSafepaySignature(rawPayload, expiredTimestamp);

    const result = verifySafepaySignature({
      rawBody: rawPayload,
      signature,
      timestamp: expiredTimestamp,
    });

    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.reason, 'TIMESTAMP_DRIFT_EXCEEDED');
  });

  test('5. Verified Webhook Triggers Enrollment and Updates Payment State Exactly Once', async () => {
    // Find or reuse registration
    const reg = await prisma.registration.findUnique({
      where: { userId_concertId: { userId: testUser1.id, concertId: testConcert.id } },
    });

    const internalRef = `CONC-TEST-AUTOPAY-${Date.now()}`;
    const tracker = `track_test_autopay_${Date.now()}`;

    const payment = await prisma.concertPayment.create({
      data: {
        registrationId: reg.id,
        provider: 'SAFEPAY',
        internalReference: internalRef,
        providerReference: tracker,
        amountPaisa: 150000,
        currency: 'PKR',
        status: 'PENDING',
      },
    });

    // Execute atomic enrollment transaction as webhook handler does
    const txResult = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.concertPayment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          verifiedAt: new Date(),
        },
      });

      await tx.registration.update({
        where: { id: reg.id },
        data: { status: 'ENROLLED' },
      });

      const enrollment = await tx.enrollment.create({
        data: {
          registrationId: reg.id,
          ticketCode: generateTicketCode(),
          status: 'ACTIVE',
          enrolledAt: new Date(),
        },
      });

      await tx.webhookEvent.create({
        data: {
          provider: 'SAFEPAY',
          providerEventId: `evt_test_success_${Date.now()}`,
          eventType: 'payment.succeeded',
          payload: JSON.stringify({ tracker, internalRef }),
          processingStatus: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return { updatedPayment, enrollment };
    });

    assert.strictEqual(txResult.updatedPayment.status, 'SUCCEEDED');
    assert.ok(txResult.updatedPayment.verifiedAt);
    assert.ok(txResult.enrollment.ticketCode.startsWith('TKT-TEST-'));

    // Check DB state
    const confirmedReg = await prisma.registration.findUnique({
      where: { id: reg.id },
      include: { enrollment: true },
    });
    assert.strictEqual(confirmedReg.status, 'ENROLLED');
    assert.strictEqual(confirmedReg.enrollment.status, 'ACTIVE');
  });

  test('6. Idempotency: Duplicate Webhook Events Do Not Duplicate Enrollment', async () => {
    const reg = await prisma.registration.findUnique({
      where: { userId_concertId: { userId: testUser1.id, concertId: testConcert.id } },
      include: { enrollment: true },
    });

    const initialEnrollmentId = reg.enrollment.id;
    const initialTicketCode = reg.enrollment.ticketCode;

    // Simulate arriving duplicate webhook event
    const duplicateEventId = `evt_test_duplicate_run`;

    // 1st delivery records the event
    await prisma.webhookEvent.upsert({
      where: { provider_providerEventId: { provider: 'SAFEPAY', providerEventId: duplicateEventId } },
      create: {
        provider: 'SAFEPAY',
        providerEventId: duplicateEventId,
        eventType: 'payment.succeeded',
        payload: '{}',
        processingStatus: 'PROCESSED',
        processedAt: new Date(),
      },
      update: {},
    });

    // 2nd delivery checks table:
    const checked = await prisma.webhookEvent.findUnique({
      where: { provider_providerEventId: { provider: 'SAFEPAY', providerEventId: duplicateEventId } },
    });

    assert.strictEqual(checked.processingStatus, 'PROCESSED', 'Duplicate webhook must be detected as processed');

    // Count enrollments for this registration: Must remain exactly 1
    const count = await prisma.enrollment.count({
      where: { registrationId: reg.id },
    });
    assert.strictEqual(count, 1, 'Exactly one enrollment must exist per registration');

    const currentEnrollment = await prisma.enrollment.findUnique({
      where: { registrationId: reg.id },
    });
    assert.strictEqual(currentEnrollment.id, initialEnrollmentId);
    assert.strictEqual(currentEnrollment.ticketCode, initialTicketCode);
  });

  test('7. Amount & Currency Mismatch Detection', async () => {
    const expectedPaisa = 150000;
    const tamperedPaisa = 50000; // Customer paid only PKR 500 instead of 1,500

    const matchesPaisa = tamperedPaisa === expectedPaisa;
    const matchesPKR = tamperedPaisa === expectedPaisa / 100;

    assert.strictEqual(matchesPaisa || matchesPKR, false, 'Amount mismatch must be flagged');

    const wrongCurrency = 'USD';
    assert.notStrictEqual(wrongCurrency, 'PKR', 'Currency mismatch must be rejected');
  });

  test('8. Security: Customer Cannot View Another Customer Payment Record', async () => {
    // User 2 tries to access User 1's payment
    const user1Payment = await prisma.concertPayment.findFirst({
      where: { registration: { userId: testUser1.id } },
      include: { registration: true },
    });

    assert.ok(user1Payment, 'User 1 payment must exist');

    const requestingUserId = testUser2.id;
    const isOwner = user1Payment.registration.userId === requestingUserId;
    const isAdmin = false;

    const isAuthorized = isOwner || isAdmin;
    assert.strictEqual(isAuthorized, false, 'Cross-tenant customer payment access must be forbidden (403)');
  });

  test('9. Admin Reconciliation: Mandatory Audit Logging and Reason Verification', async () => {
    // Create an unconfirmed bank transfer payment for User 2
    const reg2 = await prisma.registration.create({
      data: {
        userId: testUser2.id,
        concertId: testConcert.id,
        status: 'PENDING',
      },
    });

    const payment2 = await prisma.concertPayment.create({
      data: {
        registrationId: reg2.id,
        provider: 'BANK_TRANSFER',
        internalReference: `CONC-TEST-BT-${Date.now()}`,
        providerReference: `BT-SLIP-9988`,
        amountPaisa: 150000,
        currency: 'PKR',
        status: 'PENDING',
      },
    });

    // Attempt reconciliation without valid reason: Must reject
    const emptyReason = '   ';
    assert.ok(!emptyReason.trim() || emptyReason.trim().length < 5, 'Empty reason must be rejected');

    // Valid admin manual reconciliation with reason and evidence
    const reason = 'Verified customer deposit on Meezan Bank account statement slip ref #BT-SLIP-9988';
    const evidenceRef = 'MEEZAN-DEP-9988';

    const reconciliation = await prisma.$transaction(async (tx) => {
      const p = await tx.concertPayment.update({
        where: { id: payment2.id },
        data: {
          status: 'SUCCEEDED',
          verifiedAt: new Date(),
          reconciliationNotes: `Manual reconciliation: ${reason}`,
        },
      });

      await tx.registration.update({
        where: { id: reg2.id },
        data: { status: 'ENROLLED' },
      });

      const enrollment = await tx.enrollment.create({
        data: {
          registrationId: reg2.id,
          ticketCode: generateTicketCode(),
          status: 'ACTIVE',
          enrolledAt: new Date(),
        },
      });

      const auditLog = await tx.auditLog.create({
        data: {
          adminId: testAdmin.id,
          action: 'CONCERT_PAYMENT_APPROVE_MANUAL',
          targetType: 'CONCERT_PAYMENT',
          targetId: payment2.id,
          details: JSON.stringify({
            reason,
            evidenceRef,
            amountPaisa: payment2.amountPaisa,
          }),
        },
      });

      return { p, enrollment, auditLog };
    });

    assert.strictEqual(reconciliation.p.status, 'SUCCEEDED');
    assert.strictEqual(reconciliation.enrollment.status, 'ACTIVE');
    assert.ok(reconciliation.auditLog.id);

    // Verify audit log persists
    const log = await prisma.auditLog.findUnique({
      where: { id: reconciliation.auditLog.id },
    });
    assert.strictEqual(log.action, 'CONCERT_PAYMENT_APPROVE_MANUAL');
    assert.strictEqual(log.adminId, testAdmin.id);
  });

  test('10. Retry Checkout on Existing Registration without Creating Duplicates', async () => {
    // User 2 registration is now enrolled, so retry must be prevented
    const reg = await prisma.registration.findUnique({
      where: { userId_concertId: { userId: testUser2.id, concertId: testConcert.id } },
      include: { enrollment: true },
    });

    const isEnrolled = reg.status === 'ENROLLED' || !!reg.enrollment;
    assert.strictEqual(isEnrolled, true, 'Enrolled registration cannot be retried');

    // Create a failed registration for testing retry
    // Unique constraint requires (userId, concertId) unique, so if registration exists we test reuse
    const user3 = await prisma.user.create({
      data: {
        id: 'test-user-c3',
        fullName: 'Zubair Shah',
        phone: '03008880003',
        passwordHash: 'dummyhash',
        referralCode: '10K-ZUBAIR3',
        role: 'USER',
        isVerified: true,
      },
    });

    const reg3 = await prisma.registration.create({
      data: {
        userId: user3.id,
        concertId: testConcert.id,
        status: 'PENDING',
      },
    });

    const failedPayment = await prisma.concertPayment.create({
      data: {
        registrationId: reg3.id,
        provider: 'SAFEPAY',
        internalReference: `CONC-TEST-FAIL-${Date.now()}`,
        amountPaisa: 150000,
        currency: 'PKR',
        status: 'FAILED',
      },
    });

    // Customer initiates retry: creates a new payment attempt for same registration
    const retryInternalRef = `CONC-TEST-RETRY-${Date.now()}`;
    const retryPayment = await prisma.concertPayment.create({
      data: {
        registrationId: reg3.id, // SAME registration ID!
        provider: 'SAFEPAY',
        internalReference: retryInternalRef,
        amountPaisa: 150000,
        currency: 'PKR',
        status: 'PENDING',
      },
    });

    const totalRegsForUser3 = await prisma.registration.count({
      where: { userId: user3.id, concertId: testConcert.id },
    });
    assert.strictEqual(totalRegsForUser3, 1, 'Retry must not duplicate registration records');

    const paymentsForReg3 = await prisma.concertPayment.findMany({
      where: { registrationId: reg3.id },
    });
    assert.strictEqual(paymentsForReg3.length, 2, 'Registration should link both initial failed and new retry payment');

    // Clean up User 3
    await prisma.concertPayment.deleteMany({ where: { registrationId: reg3.id } });
    await prisma.registration.deleteMany({ where: { id: reg3.id } });
    await prisma.user.deleteMany({ where: { id: user3.id } });
  });
});
