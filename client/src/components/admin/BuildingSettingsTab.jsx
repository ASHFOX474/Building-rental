import { useState } from 'react';
import { useBuilding, getBanglaFloorOrdinal } from '../../context/BuildingContext.jsx';
import { isUnitAvailable } from '../floormap/UnitStatusElements.jsx';
import {
  formatTaka,
  toBanglaDigits,
  toAsciiDigits,
  formatPhoneBn,
} from '../../lib/bangla.js';

/**
 * Modal for editing a tenant unit's details (or the Owner unit B1's display label).
 */
function UnitEditModal({ unit, floorNameBn, onSave, onClose }) {
  const isOwner = unit.status === 'owner';

  const [ownerLabelBn, setOwnerLabelBn] = useState(
    unit.ownerLabelBn || 'ইউনিট B1 — বাড়িওয়ালা'
  );
  const [ownerSubtextBn, setOwnerSubtextBn] = useState(
    unit.ownerSubtextBn || '(মালিকের নিজস্ব বাসভবন)'
  );

  const [renterNameBn, setRenterNameBn] = useState(unit.renterNameBn || '');
  const [renterPhone, setRenterPhone] = useState(unit.renterPhone || '');
  const [rent, setRent] = useState(Number(unit.rent) || 12000);
  const [isVacant, setIsVacant] = useState(isUnitAvailable(unit));

  const handleStepRent = (delta) => {
    setRent((prev) => Math.max(1000, (Number(prev) || 12000) + delta));
  };

  const handleRentChange = (val) => {
    const ascii = toAsciiDigits(val).replace(/\D/g, '');
    setRent(Number(ascii) || 0);
  };

  // 1-Tap Move-Out Reset: clears tenant name & phone, marks unit as Available (To-Let)
  const handleMoveOutReset = () => {
    const updated = {
      status: 'available',
      is_to_let: true,
      renterNameBn: '',
      renterPhone: '',
      rent: Number(rent) || 12000,
      availableFrom: unit.availableFrom || 'january',
      availableFromFullBn: unit.availableFromFullBn || 'জানুয়ারি ২০২৭',
    };
    onSave(unit.id, updated, `🚪 ইউনিট ${unit.id} খালি (টু-লেট) হিসেবে সেট করা হয়েছে!`);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isOwner) {
      onSave(
        unit.id,
        {
          ownerLabelBn: ownerLabelBn.trim() || 'ইউনিট B1 — বাড়িওয়ালা',
          ownerSubtextBn: ownerSubtextBn.trim() || '(মালিকের নিজস্ব বাসভবন)',
        },
        `✅ ইউনিট ${unit.id}-এর ডিসপ্লে লেবেল আপডেট হয়েছে!`
      );
      onClose();
      return;
    }

    const cleanPhone = toAsciiDigits(renterPhone).replace(/\D/g, '');
    onSave(
      unit.id,
      {
        renterNameBn: isVacant ? '' : renterNameBn.trim(),
        renterPhone: isVacant ? '' : cleanPhone,
        rent: Math.max(500, Number(rent) || 12000),
        status: isVacant ? 'available' : 'occupied',
        is_to_let: isVacant,
        availableFrom: unit.availableFrom || 'january',
        availableFromFullBn: unit.availableFromFullBn || 'জানুয়ারি ২০২৭',
      },
      `✅ ইউনিট ${unit.id} (${floorNameBn})-এর তথ্য সফলভাবে সেভ হয়েছে!`
    );
    onClose();
  };

  return (
    <div
      className="adm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unit-edit-modal-title"
      onClick={onClose}
    >
      <div
        className="adm-puthi-card adm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-modal__header">
          <div>
            <span className="adm-modal__floor-tag">
              ইউনিট {unit.id} • {floorNameBn}
            </span>
            <h2 id="unit-edit-modal-title" className="adm-modal__title">
              ✏️ ইউনিট {unit.id}-এর তথ্য আপডেট করুন
            </h2>
          </div>

          <button
            type="button"
            className="adm-modal__close"
            onClick={onClose}
          >
            ✕ বন্ধ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="adm-modal__form">
          {isOwner ? (
            <fieldset className="adm-fieldset">
              <legend className="adm-fieldset__legend">
                🏠 বাড়িওয়ালা ইউনিটের ডিসপ্লে নাম
              </legend>
              <div className="adm-note-row" style={{ marginBottom: 14 }}>
                <label className="adm-note-row__label">প্রধান শিরোনাম:</label>
                <input
                  type="text"
                  value={ownerLabelBn}
                  onChange={(e) => setOwnerLabelBn(e.target.value)}
                  className="adm-note-row__input"
                />
              </div>
              <div className="adm-note-row">
                <label className="adm-note-row__label">সাব-টেক্সট:</label>
                <input
                  type="text"
                  value={ownerSubtextBn}
                  onChange={(e) => setOwnerSubtextBn(e.target.value)}
                  className="adm-note-row__input"
                />
              </div>
            </fieldset>
          ) : (
            <>
              {/* Quick 1-Tap Move-Out Button */}
              <div className="adm-moveout-box">
                <p className="adm-moveout-box__hint">
                  ভাড়াটিয়া কি বাসা ছেড়ে চলে গেছেন? নিচের বাটনে চাপলে পুরনো নাম মুছে ফ্ল্যাটটি সাথে সাথে <strong>টু-লেট (ভাড়া হবে)</strong> হয়ে যাবে:
                </p>
                <button
                  type="button"
                  className="adm-moveout-btn"
                  onClick={handleMoveOutReset}
                >
                  🚪 ভাড়াটিয়া বাসা ছেড়ে দিয়েছেন — ফ্ল্যাট খালি করুন
                </button>
              </div>

              {/* ৪. ফ্ল্যাটটি কি এখন খালি (টু-লেট)? */}
              <fieldset className="adm-fieldset">
                <legend className="adm-fieldset__legend">
                  ১. ফ্ল্যাটটির বর্তমান অবস্থা কী?
                </legend>
                <div className="adm-punctuality-grid">
                  <button
                    type="button"
                    className={`adm-punctuality-btn ${
                      !isVacant ? 'adm-punctuality-btn--ontime' : ''
                    }`}
                    onClick={() => setIsVacant(false)}
                    aria-pressed={!isVacant}
                  >
                    ⚪ ভাড়াটিয়া আছেন
                  </button>
                  <button
                    type="button"
                    className={`adm-punctuality-btn ${
                      isVacant ? 'adm-punctuality-btn--ontime' : ''
                    }`}
                    onClick={() => setIsVacant(true)}
                    aria-pressed={isVacant}
                  >
                    🟢 খালি / ভাড়া হবে (টু-লেট)
                  </button>
                </div>
              </fieldset>

              {/* ১ ও ২. ভাড়াটিয়ার নাম ও মোবাইল নম্বর */}
              {!isVacant && (
                <fieldset className="adm-fieldset">
                  <legend className="adm-fieldset__legend">
                    ২. ভাড়াটিয়ার নাম ও মোবাইল নম্বর
                  </legend>
                  <div className="adm-note-row" style={{ marginBottom: 14 }}>
                    <label
                      htmlFor="edit-renter-name"
                      className="adm-note-row__label"
                    >
                      👤 ভাড়াটিয়ার নাম (বাংলায় বা ইংরেজিতে):
                    </label>
                    <input
                      id="edit-renter-name"
                      type="text"
                      value={renterNameBn}
                      onChange={(e) => setRenterNameBn(e.target.value)}
                      placeholder="যেমন: জনাব মো. রফিকুল ইসলাম"
                      className="adm-note-row__input"
                    />
                  </div>

                  <div className="adm-note-row">
                    <label
                      htmlFor="edit-renter-phone"
                      className="adm-note-row__label"
                    >
                      📞 ভাড়াটিয়ার মোবাইল নম্বর:
                    </label>
                    <input
                      id="edit-renter-phone"
                      type="tel"
                      value={toBanglaDigits(renterPhone)}
                      onChange={(e) =>
                        setRenterPhone(
                          toAsciiDigits(e.target.value).replace(/\D/g, '')
                        )
                      }
                      placeholder="যেমন: ০১৮১৭৪৪৫৫৬৬"
                      className="adm-note-row__input"
                    />
                  </div>
                </fieldset>
              )}

              {/* ৩. মাসিক ভাড়া (৳) */}
              <fieldset className="adm-fieldset">
                <legend className="adm-fieldset__legend">
                  ৩. নির্ধারিত মাসিক ভাড়া (৳): {formatTaka(rent)}
                </legend>
                <div className="adm-rent-stepper">
                  <button
                    type="button"
                    className="adm-step-btn adm-step-btn--minus"
                    onClick={() => handleStepRent(-500)}
                  >
                    ➖ ৫০০
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={toBanglaDigits(rent)}
                    onChange={(e) => handleRentChange(e.target.value)}
                    className="adm-rent-stepper__input"
                  />

                  <button
                    type="button"
                    className="adm-step-btn adm-step-btn--plus"
                    onClick={() => handleStepRent(500)}
                  >
                    ➕ ৫০০
                  </button>
                </div>
              </fieldset>
            </>
          )}

          <button type="submit" className="adm-save-btn">
            💾 পরিবর্তন সেভ করুন
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Tab 3: "🏢 ৩. ভবন ও ভাড়াটিয়া সেটিংস"
 * Complete Tenant & Flat Info Manager, Dynamic Story/Floor Visibility Controller,
 * and Contact / PIN / Backup Settings.
 */
export default function BuildingSettingsTab({ onSwitchToToLetTab }) {
  const {
    building,
    updateContactInfo,
    floors,
    paymentsByMonth,
    updateUnit,
    toggleFloorVisibility,
    addNextStory,
    removeFloor,
    adminPin,
    setAdminPin,
    restoreBackupData,
    resetToDefaults,
  } = useBuilding();

  const [toastMsg, setToastMsg] = useState('');
  const [editingTarget, setEditingTarget] = useState(null); // { unit, floorNameBn }
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [confirmRemoveFloorId, setConfirmRemoveFloorId] = useState(null);
  const [confirmResetDemo, setConfirmResetDemo] = useState(false);

  // Section 3 local form states
  const [primaryPhone, setPrimaryPhone] = useState(
    building.contact.phone || '01817526285'
  );
  const [secondaryPhone, setSecondaryPhone] = useState(
    building.contact.phoneSecondary || '01815023898'
  );
  const [whatsappNum, setWhatsappNum] = useState(
    building.contact.whatsapp || '8801815023898'
  );
  const [newPinInput, setNewPinInput] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? '' : cur));
    }, 4000);
  };

  // Floors ordered from highest floor down to 1st floor
  const orderedFloors = floors
    .slice()
    .sort((a, b) => b.floorNumber - a.floorNumber);

  const maxFloorNum = orderedFloors[0]?.floorNumber || 5;
  const nextFloorNum = maxFloorNum + 1;
  const nextFloorLetter = String.fromCharCode(64 + nextFloorNum); // 6 -> 'F'
  const nextFloorNameBn = getBanglaFloorOrdinal(nextFloorNum);

  const handleSaveUnitEdit = (unitId, changes, successMessage) => {
    updateUnit(unitId, changes);
    if (successMessage) showToast(successMessage);
  };

  const handleConfirmAddStory = () => {
    addNextStory();
    setShowAddStoryModal(false);
    showToast(
      `🏢 ভবনে "${nextFloorNameBn} - ফ্লোর ${nextFloorLetter}" (ইউনিট ${nextFloorLetter}1, ${nextFloorLetter}2, ${nextFloorLetter}3) সফলভাবে যোগ হয়েছে!`
    );
  };

  const handleConfirmRemoveFloor = (floor) => {
    removeFloor(floor.id);
    setConfirmRemoveFloorId(null);
    showToast(`🗑️ "${floor.nameBn} - ফ্লোর ${floor.id}" মুছে ফেলা হয়েছে।`);
  };

  const handleSaveContactNumbers = (e) => {
    e.preventDefault();
    const cleanPrimary = toAsciiDigits(primaryPhone).replace(/\D/g, '');
    const cleanSecondary = toAsciiDigits(secondaryPhone).replace(/\D/g, '');
    const cleanWa = toAsciiDigits(whatsappNum).replace(/\D/g, '');

    updateContactInfo({
      phone: cleanPrimary || '01817526285',
      phoneSecondary: cleanSecondary,
      whatsapp: cleanWa || '8801815023898',
    });
    showToast('✅ পাবলিক ওয়েবসাইটের যোগাযোগের নম্বর সফলভাবে আপডেট হয়েছে!');
  };

  const handleSaveNewPin = (e) => {
    e.preventDefault();
    const asciiPin = toAsciiDigits(newPinInput).replace(/\D/g, '');
    if (asciiPin.length !== 4) {
      showToast('❌ গোপন পিন অবশ্যই ৪ সংখ্যার হতে হবে (যেমন: ১২৩৪)।');
      return;
    }
    setAdminPin(asciiPin);
    setNewPinInput('');
    showToast(
      `🔑 নতুন ৪ সংখ্যার গোপন পিন (${toBanglaDigits(asciiPin)}) সফলভাবে সেভ হয়েছে!`
    );
  };

  const handleDownloadBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      building,
      floors,
      paymentsByMonth,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moni-lodge-backup-2026-11.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 সকল হিসাব ও তথ্যের ব্যাকআপ ফাইল ডাউনলোড হয়েছে!');
  };

  const handleRestoreBackupFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const ok = restoreBackupData(parsed);
        if (ok) {
          showToast('✅ ব্যাকআপ ফাইল থেকে সকল তথ্য সফলভাবে ফিরিয়ে আনা হয়েছে!');
        } else {
          showToast('❌ ফাইলটি সঠিক ব্যাকআপ ফাইল নয়।');
        }
      } catch {
        showToast('❌ ব্যাকআপ ফাইল পড়তে সমস্যা হয়েছে।');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmResetDemo = () => {
    resetToDefaults();
    setConfirmResetDemo(false);
    showToast('🔄 সকল তথ্য প্রাথমিক ডেমো অবস্থায় রিসেট করা হয়েছে!');
  };

  return (
    <div className="adm-settings">
      {/* Live Toast Banner */}
      {toastMsg && (
        <div className="adm-toast" role="status" aria-live="polite">
          <span>{toastMsg}</span>
          <button
            type="button"
            className="adm-toast__close"
            onClick={() => setToastMsg('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* =====================================================================
          SECTION 1: FLOOR-BY-FLOOR TENANT & FLAT INFO MANAGER
         ===================================================================== */}
      <section
        className="adm-puthi-card adm-settings-sec"
        aria-label="ভাড়াটিয়ার তথ্য ও মাসিক ভাড়া পরিবর্তন"
      >
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />
        <h2 className="adm-step-title">
          ১. 👥 ভাড়াটিয়ার তথ্য ও মাসিক ভাড়া পরিবর্তন
        </h2>
        <p className="adm-sub-note">
          নতুন ভাড়াটিয়া উঠলে বা কারো মোবাইল নম্বর ও ভাড়ার পরিমাণ পরিবর্তন হলে এখান থেকে সহজেই আপডেট করুন।
        </p>

        <div className="adm-settings-floors">
          {orderedFloors.map((floor) => (
            <div key={floor.id} className="adm-settings-floor-block">
              <div className="adm-settings-floor-block__header">
                <span className="adm-floor-section__badge">
                  {floor.nameBn} — ফ্লোর {floor.id}
                </span>
                {floor.isVisible === false && (
                  <span className="adm-hidden-floor-chip">
                    🙈 পাবলিক সাইটে লুকানো আছে
                  </span>
                )}
              </div>

              <div className="adm-settings-unit-grid">
                {floor.units.map((unit) => {
                  const isOwner = unit.status === 'owner';
                  const isVacant = isUnitAvailable(unit);

                  if (isOwner) {
                    return (
                      <article
                        key={unit.id}
                        className="adm-settings-unit-card adm-settings-unit-card--owner"
                      >
                        <div className="adm-settings-unit-card__top">
                          <span className="adm-unit-tag adm-unit-tag--owner">
                            ইউনিট {unit.id}
                          </span>
                          <span className="adm-settings-status-pill adm-settings-status-pill--owner">
                            🏠 বাড়িওয়ালা
                          </span>
                        </div>

                        <p className="adm-settings-unit-card__owner-text">
                          🏠 {unit.ownerLabelBn || 'ইউনিট B1 — বাড়িওয়ালা'}{' '}
                          <small>{unit.ownerSubtextBn || '(মালিকের নিজস্ব বাসভবন)'}</small>
                        </p>

                        <button
                          type="button"
                          className="adm-unit-edit-btn adm-unit-edit-btn--secondary"
                          onClick={() =>
                            setEditingTarget({ unit, floorNameBn: floor.nameBn })
                          }
                        >
                          ✏️ লেবেল পরিবর্তন করুন
                        </button>
                      </article>
                    );
                  }

                  return (
                    <article
                      key={unit.id}
                      className={`adm-settings-unit-card ${
                        isVacant ? 'adm-settings-unit-card--vacant' : ''
                      }`}
                    >
                      <div className="adm-settings-unit-card__top">
                        <span
                          className={`adm-unit-tag ${
                            isVacant ? 'adm-unit-tag--vacant' : ''
                          }`}
                        >
                          ইউনিট {unit.id}
                        </span>
                        <span
                          className={`adm-settings-status-pill ${
                            isVacant
                              ? 'adm-settings-status-pill--vacant'
                              : 'adm-settings-status-pill--occupied'
                          }`}
                        >
                          {isVacant ? '🟢 ভাড়া হবে (খালি)' : '⚪ ভাড়াটিয়া আছেন'}
                        </span>
                      </div>

                      <dl className="adm-settings-unit-dl">
                        <div>
                          <dt>ভাড়াটিয়ার নাম:</dt>
                          <dd>
                            {isVacant
                              ? '— (বর্তমানে খালি)'
                              : unit.renterNameBn || 'নাম দেওয়া হয়নি'}
                          </dd>
                        </div>
                        <div>
                          <dt>মোবাইল নম্বর:</dt>
                          <dd>
                            {isVacant
                              ? '—'
                              : unit.renterPhone
                              ? formatPhoneBn(unit.renterPhone)
                              : 'নম্বর দেওয়া হয়নি'}
                          </dd>
                        </div>
                        <div>
                          <dt>নির্ধারিত মাসিক ভাড়া:</dt>
                          <dd className="adm-settings-unit-dl__rent">
                            {formatTaka(unit.rent || 12000)}
                          </dd>
                        </div>
                      </dl>

                      <div className="adm-settings-unit-card__actions">
                        <button
                          type="button"
                          className="adm-unit-edit-btn"
                          onClick={() =>
                            setEditingTarget({ unit, floorNameBn: floor.nameBn })
                          }
                        >
                          ✏️ তথ্য পরিবর্তন করুন
                        </button>
                        {isVacant && onSwitchToToLetTab && (
                          <button
                            type="button"
                            className="adm-unit-edit-btn adm-unit-edit-btn--secondary"
                            onClick={() => onSwitchToToLetTab(unit.id)}
                          >
                            📸 ছবি ও ভিডিও সাজান ➔
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: DYNAMIC BUILDING STORY & FLOOR VISIBILITY MANAGER
         ===================================================================== */}
      <section
        className="adm-puthi-card adm-settings-sec"
        aria-label="ভবনের তলা নিয়ন্ত্রণ — তলা যোগ বা লুকানো"
      >
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />

        <div className="adm-story-sec-header">
          <div>
            <h2 className="adm-step-title">
              ২. 🏢 ভবনের তলা নিয়ন্ত্রণ — তলা যোগ বা লুকানো
            </h2>
            <p className="adm-sub-note">
              ভবিষ্যতে ভবনে নতুন তলা নির্মিত হলে ১-ক্লিকে যোগ করতে পারবেন, অথবা যেকোনো তলা পাবলিক ওয়েবসাইট থেকে লুকিয়ে রাখতে পারবেন।
            </p>
          </div>

          <button
            type="button"
            className="adm-add-story-btn"
            onClick={() => setShowAddStoryModal(true)}
          >
            ➕ ভবনে নতুন তলা যোগ করুন (যেমন: {nextFloorNameBn} - ফ্লোর {nextFloorLetter})
          </button>
        </div>

        {/* Add Story Confirmation Modal */}
        {showAddStoryModal && (
          <div
            className="adm-modal-backdrop"
            role="dialog"
            aria-modal="true"
            onClick={() => setShowAddStoryModal(false)}
          >
            <div
              className="adm-puthi-card adm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="adm-modal__title">
                🏢 নতুন তলা যোগ করুন: {nextFloorNameBn} (ফ্লোর {nextFloorLetter})
              </h3>
              <p style={{ fontSize: 19, margin: '12px 0 20px' }}>
                আপনি কি ভবনের ছাদের নিচে নতুন <strong>{nextFloorNameBn} (ফ্লোর {nextFloorLetter})</strong> যোগ করতে চান? এতে স্বয়ংক্রিয়ভাবে ৩টি ইউনিট (<strong>{nextFloorLetter}1, {nextFloorLetter}2, {nextFloorLetter}3</strong>) এবং ফ্লোর ম্যাপ তৈরি হয়ে যাবে।
              </p>
              <div className="adm-sec-delete-confirm__btns">
                <button
                  type="button"
                  className="adm-save-btn"
                  style={{ width: 'auto', padding: '12px 28px' }}
                  onClick={handleConfirmAddStory}
                >
                  ✅ হ্যাঁ, {nextFloorNameBn} যোগ করুন
                </button>
                <button
                  type="button"
                  className="adm-reset-confirm__no"
                  onClick={() => setShowAddStoryModal(false)}
                >
                  না, বাতিল করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Per-Floor Visibility & Remove Controls */}
        <div className="adm-floor-visibility-list">
          {orderedFloors.map((floor, idx) => {
            const isPubliclyVisible = floor.isVisible !== false;
            const isExtraAddedFloor = floor.floorNumber > 5 && idx === 0;
            const isConfirmingRemove = confirmRemoveFloorId === floor.id;

            return (
              <div key={floor.id} className="adm-floor-vis-row">
                <div className="adm-floor-vis-row__info">
                  <span className="adm-floor-vis-row__title">
                    {floor.nameBn} — ফ্লোর {floor.id}
                  </span>
                  <span className="adm-floor-vis-row__units">
                    ইউনিটসমূহ: {floor.units.map((u) => u.id).join(', ')}
                  </span>
                </div>

                <div className="adm-floor-vis-row__actions">
                  <button
                    type="button"
                    className={`adm-vis-toggle-btn ${
                      isPubliclyVisible
                        ? 'adm-vis-toggle-btn--shown'
                        : 'adm-vis-toggle-btn--hidden'
                    }`}
                    onClick={() => {
                      toggleFloorVisibility(floor.id);
                      showToast(
                        isPubliclyVisible
                          ? `🙈 "${floor.nameBn}" পাবলিক ওয়েবসাইট থেকে লুকানো হয়েছে (অ্যাডমিনে সব হিসাব অক্ষত আছে)।`
                          : `👁️ "${floor.nameBn}" আবার পাবলিক ওয়েবসাইটে দেখানো হচ্ছে!`
                      );
                    }}
                  >
                    {isPubliclyVisible
                      ? '👁️ পাবলিক ওয়েবসাইটে দেখানো হচ্ছে'
                      : '🙈 পাবলিক ওয়েবসাইটে লুকানো আছে'}
                  </button>

                  {isExtraAddedFloor && (
                    <button
                      type="button"
                      className="adm-sec-ctrl-btn adm-sec-ctrl-btn--delete"
                      onClick={() => setConfirmRemoveFloorId(floor.id)}
                    >
                      🗑️ এই তলাটি মুছে ফেলুন
                    </button>
                  )}
                </div>

                {isConfirmingRemove && (
                  <div className="adm-sec-delete-confirm" style={{ width: '100%', marginTop: 10 }}>
                    <p>
                      ⚠️ আপনি কি নিশ্চিত <strong>{floor.nameBn} (ফ্লোর {floor.id})</strong> মুছে ফেলতে চান?
                    </p>
                    <div className="adm-sec-delete-confirm__btns">
                      <button
                        type="button"
                        className="adm-reset-confirm__yes"
                        onClick={() => handleConfirmRemoveFloor(floor)}
                      >
                        হ্যাঁ, মুছে ফেলুন
                      </button>
                      <button
                        type="button"
                        className="adm-reset-confirm__no"
                        onClick={() => setConfirmRemoveFloorId(null)}
                      >
                        না, থাকুক
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: CONTACT NUMBERS, ADMIN PIN & DATA BACKUP
         ===================================================================== */}
      <section
        className="adm-puthi-card adm-settings-sec"
        aria-label="যোগাযোগ নম্বর, গোপন পিন ও হিসাব ব্যাকআপ"
      >
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />
        <h2 className="adm-step-title">
          ৩. ⚙️ যোগাযোগ নম্বর, গোপন পিন ও হিসাব ব্যাকআপ
        </h2>

        <div className="adm-safety-grid">
          {/* ১. পাবলিক ওয়েবসাইটের যোগাযোগের নম্বর */}
          <form onSubmit={handleSaveContactNumbers} className="adm-safety-box">
            <h3 className="adm-safety-box__title">
              📞 বিজ্ঞাপনের ফোন ও হোয়াটসঅ্যাপ নম্বর
            </h3>
            <p className="adm-safety-box__desc">
              এখানে নম্বর পরিবর্তন করলে হোম পেজ এবং ফ্ল্যাটের বিস্তারিত পেজে স্বয়ংক্রিয়ভাবে নতুন নম্বর বসে যাবে।
            </p>

            <div className="adm-note-row">
              <label className="adm-note-row__label">প্রথম মোবাইল নম্বর:</label>
              <input
                type="tel"
                value={toBanglaDigits(primaryPhone)}
                onChange={(e) =>
                  setPrimaryPhone(toAsciiDigits(e.target.value).replace(/\D/g, ''))
                }
                className="adm-note-row__input"
              />
            </div>

            <div className="adm-note-row">
              <label className="adm-note-row__label">দ্বিতীয় মোবাইল নম্বর:</label>
              <input
                type="tel"
                value={toBanglaDigits(secondaryPhone)}
                onChange={(e) =>
                  setSecondaryPhone(toAsciiDigits(e.target.value).replace(/\D/g, ''))
                }
                className="adm-note-row__input"
              />
            </div>

            <div className="adm-note-row">
              <label className="adm-note-row__label">
                হোয়াটসঅ্যাপ নম্বর (880 সহ):
              </label>
              <input
                type="tel"
                value={toBanglaDigits(whatsappNum)}
                onChange={(e) =>
                  setWhatsappNum(toAsciiDigits(e.target.value).replace(/\D/g, ''))
                }
                className="adm-note-row__input"
              />
            </div>

            <button type="submit" className="adm-unit-edit-btn">
              💾 যোগাযোগের নম্বর সেভ করুন
            </button>
          </form>

          {/* ২. গোপন পিন পরিবর্তন ও ৩. হিসাব ব্যাকআপ */}
          <div className="adm-safety-col">
            {/* গোপন পিন পরিবর্তন */}
            <form onSubmit={handleSaveNewPin} className="adm-safety-box">
              <h3 className="adm-safety-box__title">
                🔑 অ্যাডমিন পিন পরিবর্তন করুন
              </h3>
              <p className="adm-safety-box__desc">
                বর্তমান লগইন পিন: <strong>{toBanglaDigits(adminPin)}</strong>। নতুন ৪ সংখ্যার পিন দিতে নিচে লিখুন:
              </p>

              <div className="adm-pin-change-row">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={toBanglaDigits(newPinInput)}
                  onChange={(e) =>
                    setNewPinInput(
                      toAsciiDigits(e.target.value).replace(/\D/g, '').slice(0, 4)
                    )
                  }
                  placeholder="নতুন ৪ সংখ্যার পিন"
                  className="adm-note-row__input"
                />
                <button type="submit" className="adm-unit-edit-btn">
                  🔑 নতুন পিন সেভ করুন
                </button>
              </div>
            </form>

            {/* হিসাব ব্যাকআপ ও রিসেট */}
            <div className="adm-safety-box">
              <h3 className="adm-safety-box__title">
                💾 ভাড়ার খাতার ব্যাকআপ ও রিসেট
              </h3>
              <p className="adm-safety-box__desc">
                ভাড়ার খাতার সকল হিসাব নিরাপদে ফোন বা কম্পিউটারে ডাউনলোড করে রাখুন।
              </p>

              <div className="adm-backup-actions">
                <button
                  type="button"
                  className="adm-backup-btn adm-backup-btn--download"
                  onClick={handleDownloadBackup}
                >
                  📥 সকল হিসাব ও তথ্যের ব্যাকআপ ফাইল নামিয়ে রাখুন (.json)
                </button>

                <label className="adm-backup-btn adm-backup-btn--restore">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleRestoreBackupFile}
                    hidden
                  />
                  📤 ব্যাকআপ ফাইল থেকে তথ্য ফিরিয়ে আনুন (Restore)
                </label>

                {!confirmResetDemo ? (
                  <button
                    type="button"
                    className="adm-backup-btn adm-backup-btn--reset"
                    onClick={() => setConfirmResetDemo(true)}
                  >
                    🔄 ডেমো ডাটা রিসেট করুন
                  </button>
                ) : (
                  <div className="adm-reset-confirm">
                    <span>
                      আপনি কি নিশ্চিত সকল পরিবর্তন মুছে প্রাথমিক ডেমো ডাটায় ফিরে যেতে চান?
                    </span>
                    <div className="adm-reset-confirm__btns">
                      <button
                        type="button"
                        className="adm-reset-confirm__yes"
                        onClick={handleConfirmResetDemo}
                      >
                        হ্যাঁ, রিসেট করুন
                      </button>
                      <button
                        type="button"
                        className="adm-reset-confirm__no"
                        onClick={() => setConfirmResetDemo(false)}
                      >
                        না, থাকুক
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unit Edit Modal */}
      {editingTarget && (
        <UnitEditModal
          unit={editingTarget.unit}
          floorNameBn={editingTarget.floorNameBn}
          onSave={handleSaveUnitEdit}
          onClose={() => setEditingTarget(null)}
        />
      )}
    </div>
  );
}
