import { useState, useEffect, useRef, useCallback } from 'react';
import { monthBn } from '../../lib/bangla.js';

/** True when a unit is marked To-Let / Available in central building data. */
export function isUnitAvailable(unit) {
  if (!unit) return false;
  return unit.status === 'available' || unit.is_to_let === true;
}

/**
 * Custom hook that manages both Desktop Hover and Mobile Touch/Tap popups
 * for occupied units (auto-dismissing after 2.5s on touch/tap).
 */
export function useOccupiedPopup() {
  const [hoveredId, setHoveredId] = useState(null);
  const [tappedId, setTappedId] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerTapPopup = useCallback(
    (unitId, e) => {
      if (e) e.stopPropagation();
      clearTimer();
      setTappedId(unitId);
      timerRef.current = setTimeout(() => {
        setTappedId(null);
      }, 2500);
    },
    [clearTimer]
  );

  const dismissPopup = useCallback(() => {
    clearTimer();
    setTappedId(null);
    setHoveredId(null);
  }, [clearTimer]);

  useEffect(() => {
    const handleOutsideClick = () => {
      if (tappedId) {
        clearTimer();
        setTappedId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      clearTimer();
    };
  }, [tappedId, clearTimer]);

  const activePopupUnitId = tappedId || hoveredId;

  return {
    activePopupUnitId,
    setHoveredId,
    triggerTapPopup,
    dismissPopup,
  };
}

/**
 * SVG badge for an AVAILABLE unit: "🟢 ভাড়া হবে ([Month] হতে)"
 * Placed prominently inside the unit near the Drawing & Dining room or unit tag.
 */
export function AvailableStatusBadgeSvg({
  x,
  y,
  availableFrom,
  compact = false,
}) {
  const monthText = availableFrom ? ` (${monthBn(availableFrom)} হতে)` : '';
  const label = `ভাড়া হবে${monthText}`;
  const width = compact ? 116 : availableFrom ? 156 : 104;
  const height = compact ? 22 : 26;
  const fontSize = compact ? 10.5 : 12;

  return (
    <g className="bp-tolet-badge" transform={`translate(${x}, ${y})`}>
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={height / 2}
        fill="#E8F5E9"
        stroke="#2D6A4F"
        strokeWidth="1.8"
      />
      {/* Pulsing green availability dot */}
      <circle
        cx={-width / 2 + 13}
        cy="0"
        r={compact ? '4' : '4.5'}
        fill="#2D6A4F"
        className="bp-tolet-badge__dot"
      />
      <text
        x="6"
        y="4"
        textAnchor="middle"
        fill="#1B4332"
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="var(--font-heading)"
      >
        {label}
      </text>
    </g>
  );
}

/**
 * SVG content inside a unit's Drawing & Dining Room:
 * - If AVAILABLE: renders the prominent "🎥 ছবি এবং ভিডিও দেখুন ➔" CTA button.
 * - If OCCUPIED : hides the media button for tenant privacy and renders a calm
 *                 static "🔒 ভাড়া হয়ে গেছে" badge instead.
 */
export function RoomStatusActionSvg({
  x,
  y,
  isAvailable,
  accentColor = '#C85A32',
  hoverColor = '#B34B25',
  isBtnHovered = false,
  onMouseEnterBtn,
  onMouseLeaveBtn,
  onOpenMedia,
  compact = false,
}) {
  if (isAvailable) {
    const w = compact ? 124 : 206;
    const h = compact ? 34 : 42;
    const rx = compact ? 9 : 11;
    const fontSize = compact ? 11 : 14.5;
    const text = compact ? '🎥 ছবি ও ভিডিও ➔' : '🎥 ছবি এবং ভিডিও দেখুন ➔';

    return (
      <g
        className="bp-room-cta"
        transform={`translate(${x}, ${y})`}
        onClick={onOpenMedia}
        onMouseEnter={onMouseEnterBtn}
        onMouseLeave={onMouseLeaveBtn}
      >
        <rect x={-w / 2 + 2} y={-h / 2 + 3} width={w} height={h} rx={rx} fill="#1F2421" />
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={rx}
          fill={isBtnHovered ? hoverColor : accentColor}
          stroke="#1F2421"
          strokeWidth={compact ? '1.8' : '2'}
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize={fontSize}
          fontWeight="700"
          fontFamily="var(--font-heading)"
        >
          {text}
        </text>
      </g>
    );
  }

  // OCCUPIED STATE: Calm static tag "🔒 ভাড়া হয়ে গেছে" (No media button)
  const w = compact ? 114 : 148;
  const h = compact ? 26 : 32;
  const fontSize = compact ? 11 : 13;

  return (
    <g className="bp-occupied-tag" transform={`translate(${x}, ${y})`}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill="#E6E1D6"
        stroke="#8C857B"
        strokeWidth="1.5"
      />
      <text
        x="0"
        y="4.5"
        textAnchor="middle"
        fill="#5C5852"
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="var(--font-heading)"
      >
        🔒 ভাড়া হয়ে গেছে
      </text>
    </g>
  );
}

/**
 * Floating Hover/Tap Popover displayed over an OCCUPIED tenant unit when the
 * visitor hovers (desktop) or taps (mobile/tablet) on that unit.
 */
export function OccupiedUnitPopover({ activeUnit, position }) {
  if (!activeUnit || !position) return null;

  return (
    <div
      className="occupied-popover"
      style={{ left: position.left, top: position.top }}
      role="status"
      aria-live="polite"
    >
      <div className="occupied-popover__card">
        <span className="occupied-popover__unit-chip">ইউনিট {activeUnit}</span>
        <p className="occupied-popover__title">
          🔒 এই ইউনিটটি বর্তমানে ভাড়া হয়ে গেছে
        </p>
        <p className="occupied-popover__sub">
          ছবি ও ভিডিও শুধুমাত্র খালি ফ্ল্যাটের জন্য উন্মুক্ত
        </p>
      </div>
    </div>
  );
}
