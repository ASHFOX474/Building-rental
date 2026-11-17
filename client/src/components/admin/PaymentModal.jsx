import { useState } from 'react';
import { formatTaka, toBanglaDigits, toAsciiDigits } from '../../lib/bangla.js';

const PAYMENT_METHODS = [
  { id: 'Cash', icon: '💵', labelBn: 'নগদ ক্যাশ (Cash)' },
  { id: 'bKash', icon: '📱', labelBn: 'বিকাশ / নগদ (bKash/Nagad)' },
  { id: 'Bank', icon: '🏦', labelBn: 'ব্যাংক (Bank)' },
];

/** Helper to check if an ISO date 'YYYY-MM-DD' is on or before the 10th of the month. */
function isDateOnOrBefore10th(isoDate) {
  if (!isoDate) return true;
  const parts = String(isoDate).split('-').map(Number);
  const day = parts[2] || 1;
  return day <= 10;
}

/**
 * Elderly-friendly "ভাড়া জমা নিন" (Payment Entry / Edit Modal).
 */
export default function PaymentModal({
  unit,
  floorNameBn,
  monthKey,
  existingRecord,
  mode = 'new', // 'new' | 'collect-rest' | 'edit'
  onSave,
  onClear,
  onClose,
}) {
  const expectedRent = Number(unit.rent) || 12000;
  const defaultToday = `${monthKey}-10`;

  // Initial state derived from existing record or sensible defaults
  const initialMethod = existingRecord?.method || 'Cash';
  const initialIsPartial =
    mode === 'edit' &&
    existingRecord &&
    existingRecord.paidAmount < expectedRent;

  const [method, setMethod] = useState(initialMethod);
  const [paymentType, setPaymentType] = useState(initialIsPartial ? 'partial' : 'full');
  const [partialAmountStr, setPartialAmountStr] = useState(
    existingRecord && existingRecord.paidAmount < expectedRent
      ? String(existingRecord.paidAmount)
      : String(Math.round(expectedRent * 0.65 / 500) * 500)
  );
  const [paymentDate, setPaymentDate] = useState(
    existingRecord?.paymentDate || defaultToday
  );
  const [paidOnTime, setPaidOnTime] = useState(
    existingRecord?.paidOnTime !== undefined
      ? existingRecord.paidOnTime
      : isDateOnOrBefore10th(existingRecord?.paymentDate || defaultToday)
  );
  const [note, setNote] = useState(existingRecord?.note || '');
  const [confirmClear, setConfirmClear] = useState(false);

  const numericPartial = Math.max(
    0,
    Math.min(expectedRent, Number(toAsciiDigits(partialAmountStr).replace(/\D/g, '')) || 0)
  );
  const finalPaidAmount = paymentType === 'full' ? expectedRent : numericPartial;
  const remainingDue = Math.max(0, expectedRent - finalPaidAmount);

  // Preset partial chips tailored to the unit's monthly rent
  const presetAmounts =
    expectedRent >= 14000
      ? [5000, 8000, 10000, 12000]
      : expectedRent >= 11000
      ? [5000, 7000, 8000, 10000]
      : [4000, 5000, 6000, 8000];

  const handleDateChange = (newDate) => {
    setPaymentDate(newDate);
    setPaidOnTime(isDateOnOrBefore10th(newDate));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (finalPaidAmount <= 0) return;
    onSave(monthKey, unit.id, {
      paidAmount: finalPaidAmount,
      paymentDate,
      method,
      paidOnTime,
      note: note.trim(),
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    onClear(monthKey, unit.id);
    onClose();
  };

  const previouslyPaid = existingRecord?.paidAmount || 0;
  const previousDue = Math.max(0, expectedRent - previouslyPaid);

  return (
    <div
      className="adm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      onClick={onClose}
    >
      <div
        className="adm-puthi-card adm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-modal__header">
          <div>
            <span className="adm-modal__floor-tag">
              ইউনিট {unit.id} ({floorNameBn}) • মাসিক ভাড়া: {formatTaka(expectedRent)}
            </span>
            <h2 id="payment-modal-title" className="adm-modal__title">
              ইউনিট {unit.id} ({unit.renterNameBn || 'ভাড়াটিয়া'}) — ভাড়া জমা নিন
            </h2>
          </div>

          <button
            type="button"
            className="adm-modal__close"
            onClick={onClose}
            aria-label="বন্ধ করুন"
          >
            ✕ বন্ধ
          </button>
        </div>

        {mode === 'collect-rest' && previouslyPaid > 0 && (
          <div className="adm-modal__rest-banner">
            পূর্বে জমা হয়েছে: <strong>{formatTaka(previouslyPaid)}</strong> | এখনো বাকি ছিল:{' '}
            <strong>{formatTaka(previousDue)}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="adm-modal__form">
          {/* প্রশ্ন ১: কীভাবে টাকা দিয়েছেন? */}
          <fieldset className="adm-fieldset">
            <legend className="adm-fieldset__legend">
              ১. কীভাবে টাকা দিয়েছেন?
            </legend>
            <div className="adm-method-grid">
              {PAYMENT_METHODS.map((m) => {
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`adm-method-card ${
                      active ? 'adm-method-card--active' : ''
                    }`}
                    onClick={() => setMethod(m.id)}
                    aria-pressed={active}
                  >
                    <span className="adm-method-card__icon" aria-hidden="true">
                      {m.icon}
                    </span>
                    <span className="adm-method-card__label">{m.labelBn}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* প্রশ্ন ২: কত টাকা দিয়েছেন? */}
          <fieldset className="adm-fieldset">
            <legend className="adm-fieldset__legend">
              ২. কত টাকা দিয়েছেন?
            </legend>
            <div className="adm-amount-radios">
              <button
                type="button"
                className={`adm-radio-card ${
                  paymentType === 'full' ? 'adm-radio-card--active-green' : ''
                }`}
                onClick={() => setPaymentType('full')}
                aria-pressed={paymentType === 'full'}
              >
                <span className="adm-radio-card__check">
                  {paymentType === 'full' ? '🔘' : '⚪'}
                </span>
                <span>
                  {mode === 'collect-rest' && previouslyPaid > 0
                    ? `✅ বাকি ${formatTaka(previousDue)} সহ পুরো ভাড়া পরিশোধ (${formatTaka(
                        expectedRent
                      )})`
                    : `✅ পুরো টাকা দিয়েছেন (${formatTaka(expectedRent)})`}
                </span>
              </button>

              <button
                type="button"
                className={`adm-radio-card ${
                  paymentType === 'partial' ? 'adm-radio-card--active-amber' : ''
                }`}
                onClick={() => setPaymentType('partial')}
                aria-pressed={paymentType === 'partial'}
              >
                <span className="adm-radio-card__check">
                  {paymentType === 'partial' ? '🔘' : '⚪'}
                </span>
                <span>🟠 আংশিক টাকা দিয়েছেন (কিছু টাকা বাকি থাকবে)</span>
              </button>
            </div>

            {paymentType === 'partial' && (
              <div className="adm-partial-box">
                <label htmlFor="partial-amount-input" className="adm-partial-box__label">
                  জমা দেওয়া মোট টাকার পরিমাণ (৳):
                </label>
                <input
                  id="partial-amount-input"
                  type="text"
                  inputMode="numeric"
                  value={toBanglaDigits(partialAmountStr)}
                  onChange={(e) =>
                    setPartialAmountStr(toAsciiDigits(e.target.value).replace(/\D/g, ''))
                  }
                  className="adm-partial-box__input"
                  placeholder="যেমন: ৮০০০"
                />

                <div className="adm-partial-presets">
                  <span className="adm-partial-presets__lbl">দ্রুত বেছে নিন:</span>
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`adm-preset-chip ${
                        numericPartial === amt ? 'adm-preset-chip--active' : ''
                      }`}
                      onClick={() => setPartialAmountStr(String(amt))}
                    >
                      {formatTaka(amt)}
                    </button>
                  ))}
                </div>

                <p className="adm-partial-box__due">
                  🔴 বাকি থাকবে: <strong>{formatTaka(remainingDue)}</strong>
                </p>
              </div>
            )}
          </fieldset>

          {/* প্রশ্ন ৩: কোন তারিখে দিয়েছেন? */}
          <fieldset className="adm-fieldset">
            <legend className="adm-fieldset__legend">
              ৩. কোন তারিখে দিয়েছেন?
            </legend>

            <div className="adm-date-row">
              <label htmlFor="payment-date-input" className="adm-date-row__label">
                📅 তারিখ:
              </label>
              <input
                id="payment-date-input"
                type="date"
                value={paymentDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="adm-date-row__input"
              />
            </div>

            <div className="adm-punctuality-grid">
              <button
                type="button"
                className={`adm-punctuality-btn ${
                  paidOnTime ? 'adm-punctuality-btn--ontime' : ''
                }`}
                onClick={() => setPaidOnTime(true)}
                aria-pressed={paidOnTime}
              >
                ✅ সময়মতো (১০ তারিখের মধ্যে)
              </button>
              <button
                type="button"
                className={`adm-punctuality-btn ${
                  !paidOnTime ? 'adm-punctuality-btn--late' : ''
                }`}
                onClick={() => setPaidOnTime(false)}
                aria-pressed={!paidOnTime}
              >
                ⏰ দেরিতে (১০ তারিখের পরে)
              </button>
            </div>

            <div className="adm-note-row">
              <label htmlFor="payment-note-input" className="adm-note-row__label">
                📝 নোট (ঐচ্ছিক):
              </label>
              <input
                id="payment-note-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="যেমন: পরের সপ্তাহে বাকিটা দেবে"
                className="adm-note-row__input"
              />
            </div>
          </fieldset>

          {/* Primary Save Button */}
          <button type="submit" className="adm-save-btn">
            💾 হিসাব খাতায় সেভ করুন
          </button>

          {/* Optional Reset / Undo Payment if editing an existing payment */}
          {existingRecord && (
            <div className="adm-modal__reset-zone">
              {!confirmClear ? (
                <button
                  type="button"
                  className="adm-reset-trigger-btn"
                  onClick={() => setConfirmClear(true)}
                >
                  🗑️ ভুলবশত জমা হয়ে থাকলে পেমেন্ট মুছে &ldquo;ভাড়া বাকি&rdquo; করুন
                </button>
              ) : (
                <div className="adm-reset-confirm">
                  <span>আপনি কি নিশ্চিত এই ফ্ল্যাটের জমার হিসাব মুছে ফেলতে চান?</span>
                  <div className="adm-reset-confirm__btns">
                    <button
                      type="button"
                      className="adm-reset-confirm__yes"
                      onClick={handleConfirmDelete}
                    >
                      হ্যাঁ, মুছে ফেলুন
                    </button>
                    <button
                      type="button"
                      className="adm-reset-confirm__no"
                      onClick={() => setConfirmClear(false)}
                    >
                      না, থাকুক
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
