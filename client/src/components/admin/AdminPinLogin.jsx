import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useBuilding } from '../../context/BuildingContext.jsx';
import { toBanglaDigits, toAsciiDigits } from '../../lib/bangla.js';

/**
 * Elderly-friendly ATM / bKash-style 4-Digit PIN Login Screen for /admin.
 * Supports both giant on-screen Bangla touch buttons and physical keyboard input.
 */
export default function AdminPinLogin({ onUnlock }) {
  const { adminPin } = useBuilding();
  const activePin = adminPin || '1234';
  const [pin, setPin] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDigit = useCallback(
    (asciiDigit) => {
      setErrorMsg('');
      setPin((prev) => {
        if (prev.length >= 4) return prev;
        const next = prev + asciiDigit;
        if (next.length === 4) {
          if (next === activePin) {
            setTimeout(() => onUnlock(rememberDevice), 120);
          } else {
            setTimeout(() => {
              setErrorMsg(`❌ পিন সঠিক নয়! সঠিক পিন চাপুন।`);
              setPin('');
            }, 220);
          }
        }
        return next;
      });
    },
    [onUnlock, rememberDevice, activePin]
  );

  const handleBackspace = useCallback(() => {
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setErrorMsg('');
    setPin('');
  }, []);

  // Support physical keyboard digits (0-9, ০-৯) and Backspace
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
        return;
      }
      const ascii = toAsciiDigits(e.key);
      if (/^[0-9]$/.test(ascii)) {
        e.preventDefault();
        handleDigit(ascii);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDigit, handleBackspace, handleClear]);

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <div className="adm-login-page">
      <div className="adm-login-topbar">
        <Link to="/" className="adm-back-btn">
          ⬅️ মূল ওয়েবসাইটে ফিরে যান
        </Link>
      </div>

      <section
        className={`adm-puthi-card adm-pin-card ${errorMsg ? 'adm-pin-card--shake' : ''}`}
        aria-label="বাড়িওয়ালা পিন লগইন"
      >
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />

        <h1 className="adm-pin-card__title">🔒 বাড়িওয়ালা অ্যাডমিন প্যানেল</h1>
        <p className="adm-pin-card__subtitle">
          ভেতরে প্রবেশ করতে ৪ সংখ্যার গোপন পিন চাপুন
        </p>

        {/* 4 Large PIN Indicator Boxes */}
        <div
          className="adm-pin-boxes"
          role="status"
          aria-label={`৪ সংখ্যার পিন: ${toBanglaDigits(pin.length)}টি সংখ্যা দেওয়া হয়েছে`}
        >
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`adm-pin-box ${filled ? 'adm-pin-box--filled' : ''}`}
              >
                {filled ? '●' : '○'}
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <p className="adm-pin-error" role="alert">
            {errorMsg}
          </p>
        )}

        {/* Giant 3x4 Touch Keypad */}
        <div className="adm-keypad" role="group" aria-label="পিন নম্বর কিপ্যাড">
          {keypadRows.flat().map((d) => (
            <button
              key={d}
              type="button"
              className="adm-key-btn"
              onClick={() => handleDigit(d)}
            >
              {toBanglaDigits(d)}
            </button>
          ))}

          <button
            type="button"
            className="adm-key-btn adm-key-btn--action"
            onClick={handleBackspace}
          >
            ⌫ মুছুন
          </button>

          <button
            type="button"
            className="adm-key-btn"
            onClick={() => handleDigit('0')}
          >
            ০
          </button>

          <button
            type="button"
            className="adm-key-btn adm-key-btn--action"
            onClick={handleClear}
          >
            ✖ সব মুছুন
          </button>
        </div>

        {/* Remember Device Checkbox + Helper Note */}
        <label className="adm-remember-row">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
          />
          <span>এই ডিভাইসে লগইন মনে রাখুন</span>
        </label>

        <p className="adm-pin-hint">বর্তমান পিন: {toBanglaDigits(activePin)}</p>
      </section>
    </div>
  );
}
