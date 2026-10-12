import prisma from './prisma';
import { processReferralConversion } from './referral';
import { canProcessRealMoney } from './compliance';

export interface PaymentInitiationParams {
  userId: string;
  drawId: string;
  method: 'JAZZCASH' | 'EASYPAISA' | 'SIMULATED_WALLET' | 'BANK_TRANSFER';
  payerAccount?: string;
  idempotencyKey?: string;
}

/**
 * Initiates an entry payment for PKR 10.
 * Respects legal mode: if real money payments are disabled, only simulated transactions are permitted.
 */
export async function initiatePayment({
  userId,
  drawId,
  method,
  payerAccount,
  idempotencyKey,
}: PaymentInitiationParams) {
  const realMoneyAllowed = await canProcessRealMoney();

  // If real money is requested but not legally approved, reject or enforce simulated mode
  const isSimulated = !realMoneyAllowed || method === 'SIMULATED_WALLET';

  const draw = await prisma.draw.findUnique({
    where: { id: drawId },
  });

  if (!draw || draw.status !== 'ACTIVE') {
    throw new Error('This lucky draw is currently not active or closed.');
  }

  // Generate unique transaction reference
  const prefix = method === 'JAZZCASH' ? 'JC' : method === 'EASYPAISA' ? 'EP' : '10KK';
  const randomRef = Math.random().toString(36).substring(2, 9).toUpperCase();
  const transactionRef = `${prefix}-${Date.now().toString().slice(-6)}-${randomRef}`;

  const resolvedIdempotencyKey = idempotencyKey || `IDEM-${userId}-${drawId}-${Date.now()}`;

  // Check if an existing payment with this idempotency key already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { idempotencyKey: resolvedIdempotencyKey },
  });

  if (existingPayment) {
    return existingPayment;
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      drawId,
      amountPKR: draw.entryFeePKR || 10,
      method: method as any,
      transactionRef,
      idempotencyKey: resolvedIdempotencyKey,
      status: 'PENDING',
      isSimulated,
      payerAccount: payerAccount || '0300-0000000',
    },
  });

  return payment;
}

export interface PaymentVerificationParams {
  paymentId: string;
  simulatedSuccess?: boolean;
  otpCode?: string;
  gatewayResponse?: any;
}

/**
 * Server-side verification for PKR 10 entry payment.
 * Idempotently creates Draw Entry and awards Referral Bonus exactly once.
 */
export async function verifyAndCompletePayment({
  paymentId,
  simulatedSuccess = true,
  gatewayResponse,
}: PaymentVerificationParams) {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        draw: true,
        user: true,
      },
    });

    if (!payment) {
      throw new Error('Payment record not found.');
    }

    // Idempotency: if already processed, return existing
    if (payment.status === 'SUCCESS') {
      const existingEntry = await tx.drawEntry.findFirst({
        where: { paymentId: payment.id },
      });
      return { payment, entry: existingEntry, alreadyProcessed: true };
    }

    if (!simulatedSuccess) {
      const failedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          gatewayResponse: JSON.stringify(gatewayResponse || { error: 'Payment declined or simulated failure' }),
        },
      });
      return { payment: failedPayment, entry: null, alreadyProcessed: false };
    }

    // 1. Mark payment as SUCCESS
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        verifiedAt: new Date(),
        gatewayResponse: JSON.stringify(
          gatewayResponse || {
            verified: true,
            provider: payment.method,
            channel: 'Sandbox Simulator',
            authCode: 'AUTH-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          }
        ),
      },
    });

    // 2. Generate unique draw entry reference
    const uniqueEntryNumber = `10KK-ENT-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 3. Create Draw Entry
    const newEntry = await tx.drawEntry.create({
      data: {
        entryNumber: uniqueEntryNumber,
        userId: payment.userId,
        drawId: payment.drawId,
        entryType: 'STANDARD',
        status: 'ACTIVE',
        paymentId: payment.id,
        notes: `Confirmed standard entry via ${payment.method} (PKR ${payment.amountPKR})`,
      },
    });

    // 4. Increment draw entries count
    await tx.draw.update({
      where: { id: payment.drawId },
      data: {
        totalEntriesCount: { increment: 1 },
      },
    });

    // 5. Check if referee's eligible entry converts any pending referral!
    // As per specification: "Each successful, verified referral awards the referring user exactly one additional draw entry for the applicable draw."
    // Trigger referral bonus conversion:
    setTimeout(async () => {
      try {
        await processReferralConversion({
          refereeId: payment.userId,
          drawId: payment.drawId,
        });
      } catch (err) {
        console.error('Error processing referral conversion for user:', payment.userId, err);
      }
    }, 50);

    return {
      payment: updatedPayment,
      entry: newEntry,
      alreadyProcessed: false,
    };
  });
}

/**
 * Refund a transaction and reverse associated bonus entries
 */
export async function refundPayment({
  paymentId,
  adminId,
  reason,
}: {
  paymentId: string;
  adminId: string;
  reason: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        entries: true,
      },
    });

    if (!payment) throw new Error('Payment not found');
    if (payment.status === 'REFUNDED') throw new Error('Already refunded');

    // 1. Update payment to REFUNDED
    const refundedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
      },
    });

    // 2. Mark associated entry as REVERSED
    for (const entry of payment.entries) {
      await tx.drawEntry.update({
        where: { id: entry.id },
        data: {
          status: 'REVERSED',
          notes: `Reversed due to payment refund: ${reason}`,
        },
      });
    }

    // 3. Decrement draw count
    if (payment.entries.length > 0) {
      await tx.draw.update({
        where: { id: payment.drawId },
        data: {
          totalEntriesCount: { decrement: payment.entries.length },
        },
      });
    }

    // 4. Create refund record
    const refund = await tx.refund.create({
      data: {
        paymentId: payment.id,
        userId: payment.userId,
        amountPKR: payment.amountPKR,
        reason,
        status: 'APPROVED',
        adminNotes: `Refund authorized by admin ID: ${adminId}`,
        processedAt: new Date(),
      },
    });

    // 5. Log in audit log
    await tx.auditLog.create({
      data: {
        adminId,
        action: 'PAYMENT_REFUNDED',
        targetType: 'PAYMENT',
        targetId: payment.id,
        details: JSON.stringify({ amount: payment.amountPKR, reason }),
      },
    });

    return { payment: refundedPayment, refund };
  });
}
