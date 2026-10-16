/**
 * Client & Server safe Pakistani phone number validation and normalization.
 * According to Pakistan Telecommunication Authority (PTA) numbering plan:
 * Standard 11-digit mobile numbers starting with 03xx:
 * - Jazz/Mobilink: 0300-0309, 0320-0325
 * - Zong: 0310-0318
 * - Ufone: 0330-0337
 * - Telenor: 0340-0349
 * - SCO: 0355
 * Format: 03[0-5]XXXXXXXX (11 digits)
 */

export function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('0092')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('+92')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('92') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  } else if (/^3[0-9]{9}$/.test(cleaned)) {
    // 10-digit mobile number without leading 0 (e.g. 3001234567)
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

export const normalizePakistaniPhone = normalizePhone;

export function isValidPakistaniPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  return /^03[0-5][0-9]{8}$/.test(normalized);
}

export function isValidPhone(phone?: string | null): boolean {
  return isValidPakistaniPhone(phone);
}
