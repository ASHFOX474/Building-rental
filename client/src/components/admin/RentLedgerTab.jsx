import { useState } from 'react';
import { useBuilding } from '../../context/BuildingContext.jsx';
import { isUnitAvailable } from '../floormap/UnitStatusElements.jsx';
import PaymentModal from './PaymentModal.jsx';
import ExpenseModal from './ExpenseModal.jsx';
import {
  formatTaka,
  toBanglaDigits,
  formatYearMonthBn,
  shiftYearMonth,
  formatIsoDateBn,
  formatPhoneBn,
} from '../../lib/bangla.js';

function formatSignedTaka(amount) {
  const num = Number(amount) || 0;
  if (num < 0) {
    return `− ${formatTaka(Math.abs(num))}`;
  }
  return formatTaka(num);
}

const METHOD_LABELS_BN = {
  Cash: '💵 নগদ ক্যাশ',
  bKash: '📱 বিকাশ / নগদ',
  Bank: '🏦 ব্যাংক',
};

/**
 * Determine a tenant unit's payment state for the selected month:
 *   'ON_TIME' | 'LATE' | 'PARTIAL' | 'UNPAID'
 */
function getUnitPaymentState(unit, record) {
  const expected = Number(unit.rent) || 12000;
  const paid = Math.min(expected, Number(record?.paidAmount) || 0);
  const due = Math.max(0, expected - paid);

  if (!record || paid <= 0) {
    return { state: 'UNPAID', expected, paid: 0, due: expected };
  }
  if (paid < expected) {
    return { state: 'PARTIAL', expected, paid, due };
  }
  return {
    state: record.paidOnTime !== false ? 'ON_TIME' : 'LATE',
    expected,
    paid: expected,
    due: 0,
  };
}

/**
 * Tab 1: "📖 ভাড়ার খাতা" (Monthly Rent & Income Ledger)
 */
export default function RentLedgerTab({ onSwitchToToLetTab }) {
  const {
    floors,
    paymentsByMonth,
    recordRentPayment,
    clearRentPayment,
    expensesByMonth,
    defaultExpenses,
    saveMonthlyExpense,
  } = useBuilding();

  // Current selected month ('YYYY-MM')
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  // Active filter: 'all' | 'due' | 'paid' | 'vacant'
  const [activeFilter, setActiveFilter] = useState('all');
  // Modal state: { unit, floorNameBn, existingRecord, mode } | null
  const [modalTarget, setModalTarget] = useState(null);
  // Monthly expense editor modal state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  // Brief confirmation toast when expense is saved
  const [ledgerToast, setLedgerToast] = useState('');

  const showLedgerToast = (msg) => {
    setLedgerToast(msg);
    setTimeout(() => {
      setLedgerToast((cur) => (cur === msg ? '' : cur));
    }, 3500);
  };

  const monthRecords = paymentsByMonth[selectedMonth] || {};

  // Floors ordered from highest floor down to 1st floor (includes hidden floors in Admin)
  const orderedFloors = floors
    .slice()
    .sort((a, b) => b.floorNumber - a.floorNumber);

  // Flatten all units with their floor info and computed payment state
  const allUnitEntries = orderedFloors.flatMap((floor) =>
    floor.units.map((unit) => {
      const isOwner = unit.status === 'owner';
      const isVacant = isUnitAvailable(unit);
      const isOccupiedTenant = !isOwner && !isVacant;
      const record = monthRecords[unit.id] || null;
      const paymentInfo = isOccupiedTenant
        ? getUnitPaymentState(unit, record)
        : null;

      return {
        floor,
        unit,
        isOwner,
        isVacant,
        isOccupiedTenant,
        record,
        paymentInfo,
      };
    })
  );

  // Financial Summary Calculations across all occupied tenant units
  const occupiedEntries = allUnitEntries.filter((e) => e.isOccupiedTenant);
  const totalExpected = occupiedEntries.reduce(
    (sum, e) => sum + e.paymentInfo.expected,
    0
  );
  const totalCollected = occupiedEntries.reduce(
    (sum, e) => sum + e.paymentInfo.paid,
    0
  );
  const totalDue = occupiedEntries.reduce(
    (sum, e) => sum + e.paymentInfo.due,
    0
  );

  // Monthly Expenses & Net Income Calculations (smart carry-forward from defaultExpenses)
  const savedMonthExpense = expensesByMonth[selectedMonth] || null;
  const activeExpense = {
    caretaker_cost: savedMonthExpense
      ? Number(savedMonthExpense.caretaker_cost)
      : Number(defaultExpenses?.caretaker_cost ?? 12200),
    electricity_bill: savedMonthExpense
      ? Number(savedMonthExpense.electricity_bill)
      : Number(defaultExpenses?.electricity_bill ?? 3000),
    gas_bill: savedMonthExpense
      ? Number(savedMonthExpense.gas_bill)
      : Number(defaultExpenses?.gas_bill ?? 5400),
    misc_cost: savedMonthExpense ? Number(savedMonthExpense.misc_cost || 0) : 0,
    misc_note: savedMonthExpense ? String(savedMonthExpense.misc_note || '') : '',
  };
  const totalExpenses =
    activeExpense.caretaker_cost +
    activeExpense.electricity_bill +
    activeExpense.gas_bill +
    activeExpense.misc_cost;
  const netInHand = totalCollected - totalExpenses;
  const expectedNetIncome = totalExpected - totalExpenses;

  const handleSaveExpense = (mKey, expData, updateDefs) => {
    saveMonthlyExpense(mKey, expData, updateDefs);
    showLedgerToast(
      updateDefs
        ? `✅ ${formatYearMonthBn(mKey)}-এর খরচ সেভ হয়েছে এবং পরবর্তী মাসগুলোর জন্য স্থায়ী বিল আপডেট করা হয়েছে!`
        : `✅ ${formatYearMonthBn(mKey)}-এর খরচের হিসাব সফলভাবে সেভ হয়েছে!`
    );
  };

  const fullyPaidCount = occupiedEntries.filter(
    (e) => e.paymentInfo.state === 'ON_TIME' || e.paymentInfo.state === 'LATE'
  ).length;
  const dueUnitCount = occupiedEntries.filter(
    (e) => e.paymentInfo.state === 'UNPAID' || e.paymentInfo.state === 'PARTIAL'
  ).length;
  const vacantUnitCount = allUnitEntries.filter((e) => e.isVacant).length;

  // Filter helper for each unit entry
  const matchesFilter = (entry) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'vacant') return entry.isVacant;
    if (activeFilter === 'due') {
      return (
        entry.isOccupiedTenant &&
        (entry.paymentInfo.state === 'UNPAID' ||
          entry.paymentInfo.state === 'PARTIAL')
      );
    }
    if (activeFilter === 'paid') {
      return (
        entry.isOccupiedTenant &&
        (entry.paymentInfo.state === 'ON_TIME' ||
          entry.paymentInfo.state === 'LATE')
      );
    }
    return true;
  };

  return (
    <div className="adm-ledger">
      {/* =====================================================================
          A. MONTH / YEAR SWITCHER BAR
         ===================================================================== */}
      <section className="adm-month-bar" aria-label="মাসের হিসাব নির্বাচন">
        <button
          type="button"
          className="adm-month-bar__btn"
          onClick={() => setSelectedMonth((m) => shiftYearMonth(m, -1))}
        >
          ⬅️ আগের মাস
        </button>

        <div className="adm-month-bar__current">
          <span className="adm-month-bar__label">মাসের ভাড়ার খাতা</span>
          <h2 className="adm-month-bar__title">
            📅 {formatYearMonthBn(selectedMonth)}
          </h2>
        </div>

        <button
          type="button"
          className="adm-month-bar__btn"
          onClick={() => setSelectedMonth((m) => shiftYearMonth(m, 1))}
        >
          পরের মাস ➡️
        </button>
      </section>

      {/* =====================================================================
          B. TOP FINANCIAL SUMMARY BOARD ("এই মাসের হিসাব বোর্ড")
         ===================================================================== */}
      <section className="adm-summary-board" aria-label="এই মাসের আয়ের সারসংক্ষেপ">
        {/* 1. মোট পাওয়ার কথা */}
        <article className="adm-summary-card adm-summary-card--expected">
          <span className="adm-summary-card__heading">মোট পাওয়ার কথা</span>
          <p className="adm-summary-card__amount">{formatTaka(totalExpected)}</p>
          <span className="adm-summary-card__sub">
            {toBanglaDigits(occupiedEntries.length)}টি ভাড়াটিয়া ফ্ল্যাট থেকে
          </span>
        </article>

        {/* 2. এই পর্যন্ত জমা হয়েছে */}
        <article className="adm-summary-card adm-summary-card--collected">
          <span className="adm-summary-card__heading">এই পর্যন্ত জমা হয়েছে</span>
          <p className="adm-summary-card__amount">
            🟢 {formatTaka(totalCollected)}
          </p>
          <span className="adm-summary-card__sub">
            {toBanglaDigits(fullyPaidCount)}টি ফ্ল্যাট সম্পূর্ণ পরিশোধ করেছে
          </span>
        </article>

        {/* 3. এখনো বাকি আছে */}
        <article className="adm-summary-card adm-summary-card--due">
          <span className="adm-summary-card__heading">এখনো বাকি আছে</span>
          <p className="adm-summary-card__amount">
            🔴 {formatTaka(totalDue)}
          </p>
          <span className="adm-summary-card__sub">
            {toBanglaDigits(dueUnitCount)}টি ফ্ল্যাটের ভাড়া বাকি আছে
          </span>
        </article>
      </section>

      {ledgerToast && (
        <div className="adm-toast" role="status" aria-live="polite">
          <span>{ledgerToast}</span>
          <button
            type="button"
            className="adm-toast__close"
            onClick={() => setLedgerToast('')}
            aria-label="বন্ধ করুন"
          >
            ✕
          </button>
        </div>
      )}

      {/* =====================================================================
          B2. MONTHLY EXPENSES & NET INCOME ("💸 এই মাসের খরচ ও নিট হিসাব")
         ===================================================================== */}
      <section
        className="adm-expense-card"
        aria-label="এই মাসের খরচ ও নিট হিসাব"
      >
        {/* A. Header */}
        <div className="adm-expense-card__header">
          <div className="adm-expense-card__title-wrap">
            <h3 className="adm-expense-card__title">
              💸 এই মাসের খরচ ও নিট হিসাব
            </h3>
            <span className="adm-expense-card__month-pill">
              📅 {formatYearMonthBn(selectedMonth)}
            </span>
          </div>

          <button
            type="button"
            className="adm-expense-edit-btn"
            onClick={() => setExpenseModalOpen(true)}
          >
            ✏️ খরচ পরিবর্তন করুন
          </button>
        </div>

        {/* B. 4 Expense Breakdown Boxes */}
        <div className="adm-expense-grid">
          <div className="adm-expense-box">
            <span className="adm-expense-box__label">👷 কেয়ারটেকারের খরচ</span>
            <p className="adm-expense-box__amount">
              {formatTaka(activeExpense.caretaker_cost)}
            </p>
          </div>

          <div className="adm-expense-box">
            <span className="adm-expense-box__label">⚡ আমাদের কারেন্ট বিল</span>
            <p className="adm-expense-box__amount">
              {formatTaka(activeExpense.electricity_bill)}
            </p>
          </div>

          <div className="adm-expense-box">
            <span className="adm-expense-box__label">🔥 গ্যাস বিল</span>
            <p className="adm-expense-box__amount">
              {formatTaka(activeExpense.gas_bill)}
            </p>
          </div>

          <div className="adm-expense-box adm-expense-box--misc">
            <span className="adm-expense-box__label">🛠️ আনুষঙ্গিক খরচ</span>
            <p className="adm-expense-box__amount">
              {formatTaka(activeExpense.misc_cost)}
            </p>
            {activeExpense.misc_note && (
              <span className="adm-expense-box__note">
                📝 {activeExpense.misc_note}
              </span>
            )}
          </div>
        </div>

        {/* C. Net Income Summary Strip */}
        <div className="adm-net-strip">
          <div className="adm-net-strip__row">
            <div className="adm-net-strip__item">
              <span className="adm-net-strip__lbl">মোট ভাড়া জমা:</span>
              <strong className="adm-net-strip__val adm-net-strip__val--income">
                {formatTaka(totalCollected)}
              </strong>
            </div>

            <div className="adm-net-strip__item">
              <span className="adm-net-strip__lbl">➖ মোট খরচ:</span>
              <strong className="adm-net-strip__val adm-net-strip__val--expense">
                {formatTaka(totalExpenses)}
              </strong>
            </div>

            <div
              className={`adm-net-strip__item adm-net-strip__item--net ${
                netInHand >= 0
                  ? 'adm-net-strip__item--positive'
                  : 'adm-net-strip__item--negative'
              }`}
            >
              <span className="adm-net-strip__lbl">
                🟰 খরচ বাদে হাতে থাকল (নিট):
              </span>
              <strong className="adm-net-strip__net-amount">
                {formatSignedTaka(netInHand)}
              </strong>
            </div>
          </div>

          <p className="adm-net-strip__helper">
            (সব ভাড়া উঠলে সম্ভাব্য নিট আয়:{' '}
            <strong>{formatSignedTaka(expectedNetIncome)}</strong>)
          </p>
        </div>
      </section>

      {/* =====================================================================
          C. 1-CLICK FILTER BUTTONS (সহজ ফিল্টার)
         ===================================================================== */}
      <nav className="adm-filters" aria-label="ফ্ল্যাট ফিল্টার">
        <button
          type="button"
          className={`adm-filter-pill ${
            activeFilter === 'all' ? 'adm-filter-pill--active' : ''
          }`}
          onClick={() => setActiveFilter('all')}
        >
          সব ফ্ল্যাট ({toBanglaDigits(allUnitEntries.length)}টি)
        </button>

        <button
          type="button"
          className={`adm-filter-pill adm-filter-pill--due ${
            activeFilter === 'due' ? 'adm-filter-pill--active-due' : ''
          }`}
          onClick={() => setActiveFilter('due')}
        >
          🔴 যাদের ভাড়া বাকি আছে ({toBanglaDigits(dueUnitCount)}টি)
        </button>

        <button
          type="button"
          className={`adm-filter-pill adm-filter-pill--paid ${
            activeFilter === 'paid' ? 'adm-filter-pill--active-paid' : ''
          }`}
          onClick={() => setActiveFilter('paid')}
        >
          🟢 যারা পরিশোধ করেছেন ({toBanglaDigits(fullyPaidCount)}টি)
        </button>

        <button
          type="button"
          className={`adm-filter-pill adm-filter-pill--vacant ${
            activeFilter === 'vacant' ? 'adm-filter-pill--active-vacant' : ''
          }`}
          onClick={() => setActiveFilter('vacant')}
        >
          🏠 খালি / টু-লেট ফ্ল্যাট ({toBanglaDigits(vacantUnitCount)}টি)
        </button>
      </nav>

      {/* =====================================================================
          D. FLOOR-BY-FLOOR RENT LEDGER CARDS
         ===================================================================== */}
      <div className="adm-floor-groups">
        {orderedFloors.map((floor) => {
          const visibleEntries = allUnitEntries.filter(
            (e) => e.floor.id === floor.id && matchesFilter(e)
          );
          if (visibleEntries.length === 0) return null;

          return (
            <section
              key={floor.id}
              className="adm-floor-section"
              aria-label={floor.nameBn}
            >
              <div className="adm-floor-section__header">
                <span className="adm-floor-section__badge">
                  {floor.nameBn} (ফ্লোর {floor.id})
                </span>
              </div>

              <div className="adm-unit-list">
                {visibleEntries.map((entry) => {
                  const { unit, isOwner, isVacant, record, paymentInfo } = entry;

                  // 1. OWNER UNIT CARD (B1)
                  if (isOwner) {
                    return (
                      <article
                        key={unit.id}
                        className="adm-ledger-card adm-ledger-card--owner"
                      >
                        <div className="adm-ledger-card__owner-row">
                          <span className="adm-unit-tag adm-unit-tag--owner">
                            ইউনিট {unit.id} ({floor.nameBn})
                          </span>
                          <p className="adm-ledger-card__owner-title">
                            🏠 ইউনিট {unit.id} ({floor.nameBn}) — বাড়িওয়ালা (মালিকের নিজস্ব বাসভবন)
                          </p>
                        </div>
                      </article>
                    );
                  }

                  // 2. VACANT / TO-LET UNIT CARD (E1, D3)
                  if (isVacant) {
                    return (
                      <article
                        key={unit.id}
                        className="adm-ledger-card adm-ledger-card--vacant"
                      >
                        <div className="adm-ledger-card__left">
                          <div className="adm-ledger-card__top-tags">
                            <span className="adm-unit-tag adm-unit-tag--vacant">
                              ইউনিট {unit.id} ({floor.nameBn})
                            </span>
                            <span className="adm-vacant-chip">
                              📢 বর্তমানে খালি (ভাড়া হবে)
                            </span>
                          </div>
                          <p className="adm-ledger-card__vacant-title">
                            📢 ইউনিট {unit.id} ({floor.nameBn}) — বর্তমানে খালি (ভাড়া হবে)
                          </p>
                          <p className="adm-ledger-card__rent-line">
                            নির্ধারিত মাসিক ভাড়া: <strong>{formatTaka(unit.rent || 12000)}/মাস</strong>
                          </p>
                        </div>

                        <div className="adm-ledger-card__right">
                          <button
                            type="button"
                            className="adm-tolet-jump-btn"
                            onClick={() => onSwitchToToLetTab(unit.id)}
                          >
                            🏠 টু-লেট ও ছবি ট্যাবে যান ➔
                          </button>
                        </div>
                      </article>
                    );
                  }

                  // 3. OCCUPIED TENANT UNIT CARD (4 Payment States)
                  const { state, expected, paid, due } = paymentInfo;
                  const methodBn =
                    METHOD_LABELS_BN[record?.method] || '💵 নগদ ক্যাশ';
                  const dateBn = formatIsoDateBn(record?.paymentDate);
                  const phoneFormattedBn = formatPhoneBn(unit.renterPhone);

                  return (
                    <article
                      key={unit.id}
                      className={`adm-ledger-card adm-ledger-card--${state.toLowerCase()}`}
                    >
                      {/* Left Side: Unit, Tenant Name, Phone + Call Button, Monthly Rent */}
                      <div className="adm-ledger-card__left">
                        <div className="adm-ledger-card__top-tags">
                          <span className="adm-unit-tag">
                            ইউনিট {unit.id} ({floor.nameBn})
                          </span>
                        </div>

                        <h3 className="adm-ledger-card__tenant">
                          ভাড়াটিয়া: <strong>{unit.renterNameBn || 'ভাড়াটিয়া'}</strong>
                        </h3>

                        {unit.renterPhone && (
                          <div className="adm-ledger-card__phone-row">
                            <span className="adm-ledger-card__phone-num">
                              📞 {phoneFormattedBn}
                            </span>
                            <a
                              href={`tel:${unit.renterPhone}`}
                              className="adm-call-inline-btn"
                            >
                              📞 কল করুন
                            </a>
                          </div>
                        )}

                        <p className="adm-ledger-card__rent-line">
                          মাসিক ভাড়া: <strong>{formatTaka(expected)}</strong>{' '}
                          <span className="adm-ledger-card__rule-note">
                            (নিয়ম: মাসের ১০ তারিখের মধ্যে দেওয়ার কথা)
                          </span>
                        </p>
                      </div>

                      {/* Right Side: 4 Clear Visual Payment States */}
                      <div className="adm-ledger-card__right">
                        {/* STATE 1: PAID ON TIME (🟢 সময়মতো পরিশোধিত) */}
                        {state === 'ON_TIME' && (
                          <div className="adm-state-box adm-state-box--ontime">
                            <p className="adm-state-box__main">
                              ✅ পরিশোধিত ({formatTaka(paid)})
                            </p>
                            <p className="adm-state-box__meta">
                              📅 {dateBn} • {methodBn} • সময়মতো দিয়েছেন
                            </p>
                            {record?.note && (
                              <p className="adm-state-box__note">📝 {record.note}</p>
                            )}
                            <button
                              type="button"
                              className="adm-edit-btn"
                              onClick={() =>
                                setModalTarget({
                                  unit,
                                  floorNameBn: floor.nameBn,
                                  existingRecord: record,
                                  mode: 'edit',
                                })
                              }
                            >
                              ✏️ পরিবর্তন / বাতিল
                            </button>
                          </div>
                        )}

                        {/* STATE 2: PAID LATE (🟡 দেরিতে পরিশোধিত) */}
                        {state === 'LATE' && (
                          <div className="adm-state-box adm-state-box--late">
                            <p className="adm-state-box__main">
                              ✅ পরিশোধিত ({formatTaka(paid)}) — দেরিতে
                            </p>
                            <p className="adm-state-box__meta">
                              📅 {dateBn} • {methodBn} • ১০ তারিখের পরে দিয়েছেন
                            </p>
                            {record?.note && (
                              <p className="adm-state-box__note">📝 {record.note}</p>
                            )}
                            <button
                              type="button"
                              className="adm-edit-btn"
                              onClick={() =>
                                setModalTarget({
                                  unit,
                                  floorNameBn: floor.nameBn,
                                  existingRecord: record,
                                  mode: 'edit',
                                })
                              }
                            >
                              ✏️ পরিবর্তন / বাতিল
                            </button>
                          </div>
                        )}

                        {/* STATE 3: PARTIAL PAYMENT (🟠 আংশিক পরিশোধ / বকেয়া আছে) */}
                        {state === 'PARTIAL' && (
                          <div className="adm-state-box adm-state-box--partial">
                            <p className="adm-state-box__main">
                              🟠 আংশিক জমা: {formatTaka(paid)} |{' '}
                              <span className="adm-state-box__due-highlight">
                                🔴 এখনো বাকি: {formatTaka(due)}
                              </span>
                            </p>
                            <p className="adm-state-box__meta">
                              প্রথম কিস্তি: {dateBn} ({methodBn})
                            </p>
                            {record?.note && (
                              <p className="adm-state-box__note">📝 {record.note}</p>
                            )}
                            <div className="adm-state-box__actions">
                              <button
                                type="button"
                                className="adm-collect-rest-btn"
                                onClick={() =>
                                  setModalTarget({
                                    unit,
                                    floorNameBn: floor.nameBn,
                                    existingRecord: record,
                                    mode: 'collect-rest',
                                  })
                                }
                              >
                                ➕ বাকি {formatTaka(due)} জমা নিন
                              </button>
                              <button
                                type="button"
                                className="adm-edit-btn"
                                onClick={() =>
                                  setModalTarget({
                                    unit,
                                    floorNameBn: floor.nameBn,
                                    existingRecord: record,
                                    mode: 'edit',
                                  })
                                }
                              >
                                ✏️ পরিবর্তন / বাতিল
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STATE 4: UNPAID (🔴 এখনো ভাড়া দেয়নি) */}
                        {state === 'UNPAID' && (
                          <div className="adm-state-box adm-state-box--unpaid">
                            <p className="adm-state-box__unpaid-badge">
                              🔴 এখনো ভাড়া দেয়নি (বাকি: {formatTaka(expected)})
                            </p>
                            <button
                              type="button"
                              className="adm-receive-rent-btn"
                              onClick={() =>
                                setModalTarget({
                                  unit,
                                  floorNameBn: floor.nameBn,
                                  existingRecord: null,
                                  mode: 'new',
                                })
                              }
                            >
                              ✅ ভাড়া পেয়েছি — এখানে চাপুন
                            </button>
                          </div>
                        )}
                      </div>

                      {unit.renterPhone && (
                        <a
                          href={`tel:${unit.renterPhone}`}
                          className="adm-mobile-call-btn"
                        >
                          📞 কল করুন ({phoneFormattedBn})
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* =====================================================================
          E. PAYMENT ENTRY / EDIT MODAL
         ===================================================================== */}
      {modalTarget && (
        <PaymentModal
          unit={modalTarget.unit}
          floorNameBn={modalTarget.floorNameBn}
          monthKey={selectedMonth}
          existingRecord={modalTarget.existingRecord}
          mode={modalTarget.mode}
          onSave={recordRentPayment}
          onClear={clearRentPayment}
          onClose={() => setModalTarget(null)}
        />
      )}

      {/* =====================================================================
          F. MONTHLY EXPENSE EDIT MODAL ("খরচ পরিবর্তন করুন")
         ===================================================================== */}
      {expenseModalOpen && (
        <ExpenseModal
          monthKey={selectedMonth}
          initialExpense={activeExpense}
          defaultExpenses={defaultExpenses}
          onSave={handleSaveExpense}
          onClose={() => setExpenseModalOpen(false)}
        />
      )}
    </div>
  );
}
