// Helpers for rendering numbers, money and months in Bangla on the public UI.

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Convert any ASCII digits in a value to Bangla numerals. */
export function toBanglaDigits(value) {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[d]);
}

/**
 * Format a taka amount with South-Asian grouping in Bangla numerals.
 * 10500 -> "৳ ১০,৫০০", 105000 -> "৳ ১,০৫,০০০"
 */
export function formatTaka(amount) {
  // Non-breaking space so "৳" never wraps away from the amount in narrow cells.
  return `৳\u00A0${toBanglaDigits(Number(amount).toLocaleString('en-IN'))}`;
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

export function monthBn(monthKey) {
  return BANGLA_MONTHS[String(monthKey).toLowerCase()] ?? monthKey;
}
