// Helpers for rendering numbers, money, phone numbers and dates in Bangla.

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Convert any ASCII digits in a value to Bangla numerals. */
export function toBanglaDigits(value) {
  return String(value ?? '').replace(/[0-9]/g, (d) => BN_DIGITS[d]);
}

/** Convert any Bangla digits in a string back to ASCII digits (for number inputs/PIN). */
export function toAsciiDigits(value) {
  return String(value ?? '').replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/**
 * Format a taka amount with South-Asian grouping in Bangla numerals.
 * 12000 -> "৳ ১২,০০০", 105000 -> "৳ ১,০৫,০০০"
 */
export function formatTaka(amount) {
  const num = Number(amount) || 0;
  return `৳\u00A0${toBanglaDigits(num.toLocaleString('en-IN'))}`;
}

export const BANGLA_MONTHS = {
  january: 'জানুয়ারি',
  february: 'ফেব্রুয়ারি',
  march: 'মার্চ',
  april: 'এপ্রিল',
  may: 'মে',
  june: 'জুন',
  july: 'জুলাই',
  august: 'আগস্ট',
  september: 'সেপ্টেম্বর',
  october: 'অক্টোবর',
  november: 'নভেম্বর',
  december: 'ডিসেম্বর',
};

export const BANGLA_MONTH_NAMES_BY_INDEX = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export function monthBn(monthKey) {
  return BANGLA_MONTHS[String(monthKey).toLowerCase()] ?? monthKey;
}

/** Format "YYYY-MM" -> "নভেম্বর ২০২৬" */
export function formatYearMonthBn(yearMonth) {
  const [y, m] = String(yearMonth || '2026-11').split('-').map(Number);
  const monthName = BANGLA_MONTH_NAMES_BY_INDEX[(m || 11) - 1] || 'নভেম্বর';
  return `${monthName} ${toBanglaDigits(y || 2026)}`;
}

/** Shift a "YYYY-MM" string by deltaMonths (-1 for prev, +1 for next). */
export function shiftYearMonth(yearMonth, deltaMonths) {
  const [y, m] = String(yearMonth || '2026-11').split('-').map(Number);
  const date = new Date(y, (m - 1) + deltaMonths, 1);
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextY}-${nextM}`;
}

/** Format an ISO date "YYYY-MM-DD" -> "৬ নভেম্বর ২০২৬" */
export function formatIsoDateBn(isoDate) {
  if (!isoDate) return '';
  const parts = String(isoDate).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return toBanglaDigits(isoDate);
  const [y, m, d] = parts;
  const monthName = BANGLA_MONTH_NAMES_BY_INDEX[(m || 1) - 1] || '';
  return `${toBanglaDigits(d)} ${monthName} ${toBanglaDigits(y)}`;
}

/** Format an 11-digit Bangladeshi mobile number in Bangla digits: "01817445566" -> "০১৮১৭-৪৪৫৫৬৬" */
export function formatPhoneBn(phone) {
  const clean = String(phone || '').replace(/\D/g, '');
  if (clean.length === 11) {
    return toBanglaDigits(`${clean.slice(0, 5)}-${clean.slice(5)}`);
  }
  return toBanglaDigits(phone || '');
}
