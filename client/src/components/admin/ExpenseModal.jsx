import { useState } from 'react';
import {
  formatTaka,
  formatYearMonthBn,
  toBanglaDigits,
  toAsciiDigits,
} from '../../lib/bangla.js';

function parseAmountStr(val) {
  const digits = toAsciiDigits(val).replace(/\D/g, '');
  return Math.max(0, Number(digits) || 0);
}

/**
 * Elderly-friendly "💸 মাসের খরচ পরিবর্তন করুন" Modal (centered on desktop, bottom sheet on mobile).
 */
export default function ExpenseModal({
  monthKey,
  initialExpense,
  defaultExpenses,
  onSave,
  onClose,
}) {
  const defCaretaker = Number(defaultExpenses?.caretaker_cost ?? 12200);
  const defElectricity = Number(defaultExpenses?.electricity_bill ?? 3000);
  const defGas = Number(defaultExpenses?.gas_bill ?? 5400);

  const [caretakerStr, setCaretakerStr] = useState(
    String(initialExpense?.caretaker_cost ?? defCaretaker)
  );
  const [electricityStr, setElectricityStr] = useState(
    String(initialExpense?.electricity_bill ?? defElectricity)
  );
  const [gasStr, setGasStr] = useState(
    String(initialExpense?.gas_bill ?? defGas)
  );
  const [miscStr, setMiscStr] = useState(
    String(initialExpense?.misc_cost ?? 0)
  );
  const [miscNote, setMiscNote] = useState(initialExpense?.misc_note || '');
  const [updateDefaults, setUpdateDefaults] = useState(false);
  const [userTouchedDefaults, setUserTouchedDefaults] = useState(false);

  const caretakerNum = parseAmountStr(caretakerStr);
  const electricityNum = parseAmountStr(electricityStr);
  const gasNum = parseAmountStr(gasStr);
  const miscNum = parseAmountStr(miscStr);
  const totalPreview = caretakerNum + electricityNum + gasNum + miscNum;

  const handleFixedBillChange = (field, rawVal) => {
    const cleanDigits = toAsciiDigits(rawVal).replace(/\D/g, '');
    if (field === 'caretaker') setCaretakerStr(cleanDigits);
    if (field === 'electricity') setElectricityStr(cleanDigits);
    if (field === 'gas') setGasStr(cleanDigits);

    const nextCaretaker = field === 'caretaker' ? Number(cleanDigits) || 0 : caretakerNum;
    const nextElectricity = field === 'electricity' ? Number(cleanDigits) || 0 : electricityNum;
    const nextGas = field === 'gas' ? Number(cleanDigits) || 0 : gasNum;

    const changedFromDefaults =
      nextCaretaker !== defCaretaker ||
      nextElectricity !== defElectricity ||
      nextGas !== defGas;

    if (!userTouchedDefaults) {
      setUpdateDefaults(changedFromDefaults);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(
      monthKey,
      {
        caretaker_cost: caretakerNum,
        electricity_bill: electricityNum,
        gas_bill: gasNum,
        misc_cost: miscNum,
        misc_note: miscNote.trim(),
      },
      updateDefaults
    );
    onClose();
  };

  return (
    <div
      className="adm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-modal-title"
      onClick={onClose}
    >
      <div
        className="adm-puthi-card adm-modal adm-expense-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-modal__sheet-handle" aria-hidden="true" />

        <div className="adm-modal__header">
          <div>
            <span className="adm-modal__floor-tag">
              📅 {formatYearMonthBn(monthKey)} — ভবনের মাসিক খরচ
            </span>
            <h2 id="expense-modal-title" className="adm-modal__title">
              💸 এই মাসের খরচ পরিবর্তন করুন
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

        <form onSubmit={handleSubmit} className="adm-modal__form">
          <div className="adm-expense-form-grid">
            {/* 1. কেয়ারটেকারের খরচ */}
            <div className="adm-expense-field">
              <label htmlFor="exp-caretaker" className="adm-expense-field__label">
                👷 কেয়ারটেকারের খরচ (৳)
              </label>
              <input
                id="exp-caretaker"
                type="text"
                inputMode="numeric"
                value={toBanglaDigits(caretakerStr)}
                onChange={(e) => handleFixedBillChange('caretaker', e.target.value)}
                className="adm-expense-input"
                placeholder="১২২০০"
              />
            </div>

            {/* 2. আমাদের কারেন্ট বিল */}
            <div className="adm-expense-field">
              <label htmlFor="exp-electricity" className="adm-expense-field__label">
                ⚡ আমাদের কারেন্ট বিল (৳)
              </label>
              <input
                id="exp-electricity"
                type="text"
                inputMode="numeric"
                value={toBanglaDigits(electricityStr)}
                onChange={(e) => handleFixedBillChange('electricity', e.target.value)}
                className="adm-expense-input"
                placeholder="৩০০০"
              />
            </div>

            {/* 3. গ্যাস বিল */}
            <div className="adm-expense-field">
              <label htmlFor="exp-gas" className="adm-expense-field__label">
                🔥 গ্যাস বিল (৳)
              </label>
              <input
                id="exp-gas"
                type="text"
                inputMode="numeric"
                value={toBanglaDigits(gasStr)}
                onChange={(e) => handleFixedBillChange('gas', e.target.value)}
                className="adm-expense-input"
                placeholder="৫৪০০"
              />
            </div>

            {/* 4. আনুষঙ্গিক খরচ */}
            <div className="adm-expense-field">
              <label htmlFor="exp-misc" className="adm-expense-field__label">
                🛠️ আনুষঙ্গিক খরচ (৳)
              </label>
              <input
                id="exp-misc"
                type="text"
                inputMode="numeric"
                value={toBanglaDigits(miscStr)}
                onChange={(e) =>
                  setMiscStr(toAsciiDigits(e.target.value).replace(/\D/g, ''))
                }
                className="adm-expense-input"
                placeholder="০"
              />
            </div>
          </div>

          {/* Optional 1-line Misc Expense Note */}
          <div className="adm-expense-field">
            <label htmlFor="exp-misc-note" className="adm-expense-field__label">
              📝 আনুষঙ্গিক খরচের বিবরণ (ঐচ্ছিক, যেমন: মটর মেরামত)
            </label>
            <input
              id="exp-misc-note"
              type="text"
              value={miscNote}
              onChange={(e) => setMiscNote(e.target.value)}
              className="adm-expense-note-input"
              placeholder="যেমন: পানির মটর মেরামত বা সিঁড়ির লাইট পরিবর্তন"
            />
          </div>

          {/* Live Auto-Calculated Total Preview */}
          <div className="adm-expense-total-preview" aria-live="polite">
            <span className="adm-expense-total-preview__lbl">এই মাসের মোট খরচ:</span>
            <strong className="adm-expense-total-preview__amt">
              {formatTaka(totalPreview)}
            </strong>
          </div>

          {/* Carry-forward Recurring Defaults Checkbox */}
          <label className="adm-expense-default-check">
            <input
              type="checkbox"
              checked={updateDefaults}
              onChange={(e) => {
                setUserTouchedDefaults(true);
                setUpdateDefaults(e.target.checked);
              }}
            />
            <span>
              ✅ কেয়ারটেকার, কারেন্ট ও গ্যাস বিলের নতুন হিসাব পরবর্তী মাসগুলোর জন্যও স্থায়ীভাবে সেভ রাখুন
            </span>
          </label>

          {/* Giant Leaf Green Save Button */}
          <button type="submit" className="adm-save-btn">
            💾 খরচের হিসাব সেভ করুন
          </button>
        </form>
      </div>
    </div>
  );
}
