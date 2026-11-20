import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuilding } from '../../context/BuildingContext.jsx';
import { toAsciiDigits } from '../../lib/bangla.js';

/**
 * Elderly-friendly flexible PIN / Password Login Screen for /admin.
 * Supports any-length numeric or alphanumeric PIN/password stored in Neon PostgreSQL.
 */
export default function AdminPinLogin({ onUnlock }) {
  const { adminPin, dbStatus, refreshFromDb } = useBuilding();
  const [inputVal, setInputVal] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [checking, setChecking] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entered = inputVal.trim();
    if (!entered) {
      setErrorMsg('❌ অনুগ্রহ করে আপনার গোপন পিন বা পাসওয়ার্ড লিখুন।');
      setShakeKey((k) => k + 1);
      return;
    }

    setErrorMsg('');
    let storedPin = (adminPin || '1234').trim();

    // If initial Neon hydration is still in flight, wait for fresh settings before comparing
    if (dbStatus?.loading) {
      setChecking(true);
      try {
        const fresh = await refreshFromDb();
        if (fresh?.settings?.adminPin) {
          storedPin = String(fresh.settings.adminPin).trim();
        }
      } catch {
        // Fallback to current in-memory value
      } finally {
        setChecking(false);
      }
    }

    const matches =
      entered === storedPin ||
      toAsciiDigits(entered) === toAsciiDigits(storedPin);

    if (matches) {
      onUnlock(rememberDevice);
    } else {
      setErrorMsg('❌ পিন বা পাসওয়ার্ড সঠিক নয়! অনুগ্রহ করে আবার চেষ্টা করুন।');
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <div className="adm-login-page">
      <div className="adm-login-topbar">
        <Link to="/" className="adm-back-btn">
          ⬅️ মূল ওয়েবসাইটে ফিরে যান
        </Link>
      </div>

      <section
        key={shakeKey}
        className={`adm-puthi-card adm-pin-card ${errorMsg ? 'adm-pin-card--shake' : ''}`}
        aria-label="বাড়িওয়ালা লগইন"
      >
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />

        <h1 className="adm-pin-card__title">🔒 বাড়িওয়ালা অ্যাডমিন প্যানেল</h1>
        <p className="adm-pin-card__subtitle">
          ভেতরে প্রবেশ করতে আপনার গোপন পিন বা পাসওয়ার্ড লিখুন
        </p>

        <form onSubmit={handleSubmit} className="adm-pass-form" noValidate>
          <div className="adm-pass-input-wrap">
            <input
              id="admin-login-secret"
              type={showSecret ? 'text' : 'password'}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="গোপন পিন বা পাসওয়ার্ড"
              autoComplete="current-password"
              autoFocus
              aria-label="গোপন পিন বা পাসওয়ার্ড"
              className="adm-pass-input"
            />
            <button
              type="button"
              className="adm-pass-toggle-btn"
              onClick={() => setShowSecret((v) => !v)}
              aria-label={showSecret ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              aria-pressed={showSecret}
              title={showSecret ? 'লুকান' : 'দেখুন'}
            >
              {showSecret ? '🙈' : '👁️'}
            </button>
          </div>

          {errorMsg && (
            <p className="adm-pin-error" role="alert">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="adm-pass-submit-btn"
            disabled={checking}
          >
            {checking ? '⏳ যাচাই করা হচ্ছে...' : '🔓 প্রবেশ করুন'}
          </button>

          <label className="adm-remember-row">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
            />
            <span>এই ডিভাইসে লগইন মনে রাখুন</span>
          </label>
        </form>

        <p className="adm-pin-hint">
          শুধুমাত্র ভবন মালিক ও পরিবারের সদস্যদের ব্যবহারের জন্য
        </p>
      </section>
    </div>
  );
}
