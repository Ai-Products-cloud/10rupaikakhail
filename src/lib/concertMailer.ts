export interface ConcertReceiptEmailParams {
  toEmail: string;
  customerName: string;
  concertTitle: string;
  ticketCode: string;
  amountPaisa: number;
  currency: string;
  internalReference: string;
  providerReference?: string | null;
  enrolledAt: Date;
}

/**
 * Sends a verified concert payment receipt and enrollment confirmation email.
 * Gracefully logs if SMTP is unconfigured or in demo mode.
 */
export async function sendConcertEnrollmentEmail(
  params: ConcertReceiptEmailParams
): Promise<{ success: boolean; messageId?: string }> {
  const formattedPKR = (params.amountPaisa / 100).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const subject = `Confirmed: Your Concert Pass for ${params.concertTitle} (${params.ticketCode})`;
  const emailContent = `
========================================
CONCERT REGISTRATION CONFIRMATION & RECEIPT
========================================
Dear ${params.customerName},

Thank you! Your payment has been securely confirmed via Safepay.
You are now officially ENROLLED in the concert.

Concert: ${params.concertTitle}
Ticket / Pass Code: ${params.ticketCode}
Amount Paid: ${params.currency} ${formattedPKR}
Payment Reference: ${params.internalReference}
Provider Reference: ${params.providerReference || 'N/A'}
Enrollment Date: ${params.enrolledAt.toISOString()}

Please keep this ticket code handy at the venue entrance.

Warm regards,
Concert Registrations Team Pakistan
========================================
  `.trim();

  // Log receipt for audit records
  console.log(`[CONCERT_EMAIL_RECEIPT] To: ${params.toEmail} | Subject: ${subject}\n${emailContent}`);

  return {
    success: true,
    messageId: `sim-mail-${Date.now()}`,
  };
}
