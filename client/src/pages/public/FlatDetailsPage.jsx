import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { defaultRoomMediaSections, getDefaultSectionsForUnit } from '../../data/mockBuilding.js';
import { useBuilding } from '../../context/BuildingContext.jsx';
import { isUnitAvailable } from '../../components/floormap/UnitStatusElements.jsx';
import { formatTaka, monthBn, toBanglaDigits, formatPhoneBn } from '../../lib/bangla.js';
import '../../components/flatdetails/flatdetails.css';

/** Resolve a media item's thumbnail URL (Google Drive thumbnail endpoint or fallback preview). */
function getMediaThumbUrl(item) {
  if (item.driveFileId) {
    return `https://drive.google.com/thumbnail?id=${item.driveFileId}&sz=w1000`;
  }
  return item.previewUrl;
}

/** Resolve a media item's high-res URL for the fullscreen Lightbox. */
function getMediaFullUrl(item) {
  if (item.driveFileId) {
    return `https://drive.google.com/thumbnail?id=${item.driveFileId}&sz=w1600`;
  }
  return item.previewUrl;
}

/** Subtle L-shaped Kantajew/Alpana corner motif for Puthichitro cards. */
function CardAlpanaCorner({ pos }) {
  return (
    <span className={`fd-alpana fd-alpana--${pos}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <g stroke="#C85A32" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 2,36 L 2,2 L 36,2" strokeWidth="1.5" />
          <path d="M 6,32 L 6,6 L 32,6" strokeWidth="0.85" strokeDasharray="2 2" />
          <path
            d="M 6,6 C 13,6 18,10 19,17 C 12,16 8,12 6,6 Z"
            fill="#C85A32"
            fillOpacity="0.14"
            strokeWidth="1.1"
          />
          <circle cx="20" cy="20" r="1.2" fill="#C85A32" stroke="none" />
        </g>
      </svg>
    </span>
  );
}

/**
 * Page 3 — Clean, Zero-Redundancy Flat Media & Full Details Page (/flat/:unitId)
 * Dynamically renders the Main Walkthrough Video (if present) and the exact
 * Admin-organized Room-by-Room Photo & Video sections from the shared store.
 */
export default function FlatDetailsPage() {
  const { building, floors } = useBuilding();
  const { flatId } = useParams();
  const normalizedId = String(flatId || '').toUpperCase();

  // Locate unit and its parent floor in central building data
  let matchedFloor = null;
  let matchedUnit = null;
  for (const floor of floors) {
    const found = floor.units.find((u) => u.id.toUpperCase() === normalizedId);
    if (found) {
      matchedFloor = floor;
      matchedUnit = found;
      break;
    }
  }

  const fallbackFloorNumber =
    normalizedId.startsWith('E') ? 5 :
    normalizedId.startsWith('D') ? 4 :
    normalizedId.startsWith('C') ? 3 :
    normalizedId.startsWith('A') ? 1 : 2;

  const floorNumber = matchedFloor?.floorNumber || fallbackFloorNumber;
  const floorNameBn = matchedFloor?.nameBn || `${toBanglaDigits(floorNumber)}ম তলা`;

  // All currently available units across the building
  const availableUnits = floors.flatMap((f) =>
    f.units
      .filter((u) => isUnitAvailable(u))
      .map((u) => ({ ...u, floorNumber: f.floorNumber, floorNameBn: f.nameBn }))
  );

  // Room filter tab state & Fullscreen Lightbox state
  const [activeTabId, setActiveTabId] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const touchStartXRef = useRef(null);

  // Reset filter & lightbox when switching units
  useEffect(() => {
    setActiveTabId('all');
    setLightboxIndex(null);
  }, [normalizedId]);

  const sections = getDefaultSectionsForUnit(matchedUnit);

  const filteredSections =
    activeTabId === 'all'
      ? sections
      : sections.filter((sec) => sec.id === activeTabId);

  // Flattened list of all visible IMAGE items for Lightbox Next/Prev navigation
  const flatImageList = filteredSections.flatMap((sec, secIdx) =>
    (sec.items || [])
      .filter((item) => item.type !== 'video')
      .map((item) => ({
        ...item,
        sectionTitleBn: `${toBanglaDigits(secIdx + 1)}. ${sec.titleBn}`,
      }))
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setLightboxIndex((idx) =>
        idx === null || flatImageList.length === 0
          ? null
          : (idx - 1 + flatImageList.length) % flatImageList.length
      );
    },
    [flatImageList.length]
  );
  const showNext = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setLightboxIndex((idx) =>
        idx === null || flatImageList.length === 0
          ? null
          : (idx + 1) % flatImageList.length
      );
    },
    [flatImageList.length]
  );

  // Keyboard navigation for Fullscreen Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  const handleLightboxTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleLightboxTouchEnd = (e) => {
    if (touchStartXRef.current === null || !e.changedTouches?.length) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) < 42) return;
    if (deltaX < 0) showNext();
    else showPrev();
  };

  // =========================================================================
  // 1. PRIVACY GUARD: Block internal media if unit is Occupied or Owner's flat
  // =========================================================================
  if (!matchedUnit || !isUnitAvailable(matchedUnit)) {
    const isOwner = matchedUnit?.status === 'owner';
    return (
      <div className="fd-page">
        <nav className="fd-topbar" aria-label="পৃষ্ঠা নেভিগেশন">
          <div className="fd-topbar__left">
            <Link
              to={`/floor/${floorNumber}?unit=${encodeURIComponent(normalizedId || 'B2')}`}
              className="fd-nav-btn"
            >
              ⬅️ ফ্লোর ম্যাপে ফিরে যান
            </Link>
            <Link to="/" className="fd-nav-btn fd-nav-btn--secondary">
              🏠 হোম পেজ
            </Link>
          </div>
        </nav>

        <section className="fd-puthi-card fd-privacy-card" role="alert">
          <div className="fd-puthi-card__inner-rule" aria-hidden="true" />
          <CardAlpanaCorner pos="tl" />
          <CardAlpanaCorner pos="tr" />
          <CardAlpanaCorner pos="bl" />
          <CardAlpanaCorner pos="br" />

          <span className="fd-privacy-card__badge">
            {isOwner ? '🏠 বাড়িওয়ালার নিজস্ব ইউনিট' : `🔒 ইউনিট ${normalizedId || ''} — ভাড়া হয়ে গেছে`}
          </span>

          <h1 className="fd-privacy-card__title">
            🔒 এই ইউনিটটি বর্তমানে ভাড়া হয়ে গেছে — ছবি ও ভিডিও শুধুমাত্র খালি ফ্ল্যাটের জন্য উন্মুক্ত
          </h1>

          <div className="fd-privacy-card__actions">
            <Link
              to={`/floor/${floorNumber}?unit=${encodeURIComponent(normalizedId || 'B2')}`}
              className="fd-btn fd-btn--terracotta"
            >
              ⬅️ {floorNameBn}র ফ্লোর ম্যাপে ফিরে যান
            </Link>
            <Link to="/" className="fd-btn fd-btn--outline">
              🏠 হোম পেজে ফিরে যান
            </Link>
          </div>

          {availableUnits.length > 0 && (
            <div className="fd-privacy-card__open-list">
              <p className="fd-privacy-card__open-label">
                🟢 বর্তমানে খালি থাকা ফ্ল্যাট:
              </p>
              <div className="fd-privacy-card__open-pills">
                {availableUnits.map((u) => (
                  <Link key={u.id} to={`/flat/${u.id}`} className="fd-open-unit-pill">
                    🟢 ইউনিট {u.id} ({u.floorNameBn}) ➔
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  // =========================================================================
  // 2. CONCISE, ZERO-REDUNDANCY UNIT DATA
  // =========================================================================
  const isCompactUnit = matchedUnit.id.endsWith('2') && matchedFloor.units.length === 3;
  const bedroomsCount = matchedUnit.bedrooms || (isCompactUnit ? 2 : 3);
  const washroomsCount = matchedUnit.washrooms || 2;
  const balconiesCount = matchedUnit.balconies || (isCompactUnit ? 2 : 3);
  const monthlyRent = matchedUnit.rent || 12000;
  const rentFormatted = formatTaka(monthlyRent);
  const inclusiveBills = matchedUnit.inclusiveBills !== false;

  const rawFromText =
    matchedUnit.availableFromFullBn ||
    (matchedUnit.availableFrom ? `${monthBn(matchedUnit.availableFrom)} ২০২৭` : 'জানুয়ারি ২০২৭');
  const availableFromLabel = rawFromText.endsWith('থেকে')
    ? rawFromText
    : `${rawFromText} থেকে`;

  const hasMainVideo = Boolean(
    matchedUnit.driveVideoId || matchedUnit.mainVideoUrl
  );

  const whatsappMessage = `আসসালামু আলাইকুম, আমি ওয়েবসাইটে আপনাদের ইউনিট ${matchedUnit.id}-এর বিস্তারিত ও ভিডিও দেখে যোগাযোগ করছি। বাসাটি সরাসরি দেখতে চাই।`;
  const whatsappUrl = `https://wa.me/${building.contact.whatsapp}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  // Concise, non-repeating summary pills
  const summaryPills = [
    { icon: '🛏️', text: `${toBanglaDigits(bedroomsCount)} বেডরুম` },
    {
      icon: '🛋️',
      text: matchedUnit.hasSeparateDrawingDining
        ? 'আলাদা ড্রয়িং ও ডাইনিং (দেয়ালে টাইলস)'
        : 'ড্রয়িং-ডাইনিং (দেয়ালে টাইলস)',
    },
    { icon: '🚿', text: `${toBanglaDigits(washroomsCount)} বাথরুম (১টি হাই-কমোড)` },
    { icon: '☀️', text: `${toBanglaDigits(balconiesCount)} বারান্দা` },
    { icon: '🔥', text: 'লাইনের গ্যাস' },
    { icon: '⚡', text: 'প্রিপেইড মিটার' },
    { icon: '💧', text: '২৪ ঘণ্টা পানি' },
    { icon: '📹', text: 'সিসিটিভি' },
  ];

  const activeLightboxItem =
    lightboxIndex !== null ? flatImageList[lightboxIndex] : null;

  return (
    <div className="fd-page">
      {/* =====================================================================
          TOP NAVIGATION BAR
         ===================================================================== */}
      <nav className="fd-topbar" aria-label="পৃষ্ঠা নেভিগেশন">
        <div className="fd-topbar__left">
          <Link
            to={`/floor/${floorNumber}?unit=${encodeURIComponent(matchedUnit.id)}`}
            className="fd-nav-btn"
          >
            ⬅️ ফ্লোর ম্যাপে ফিরে যান
          </Link>
          <Link to="/" className="fd-nav-btn fd-nav-btn--secondary">
            🏠 হোম পেজ
          </Link>
        </div>

        {availableUnits.length > 1 && (
          <div className="fd-topbar__right" aria-label="অন্যান্য খালি ইউনিট">
            {availableUnits.map((u) => (
              <Link
                key={u.id}
                to={`/flat/${u.id}`}
                className={`fd-unit-chip ${
                  u.id === matchedUnit.id ? 'fd-unit-chip--active' : ''
                }`}
              >
                ইউনিট {u.id} ({u.floorNameBn})
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* =====================================================================
          CLEAN TOP HEADER & SINGLE-ROW SUMMARY PILLS
         ===================================================================== */}
      <header className="fd-header">
        <h1 className="fd-header__title">
          ইউনিট {matchedUnit.id} ({floorNameBn}) — ফ্যামিলি ফ্ল্যাট
        </h1>

        <ul className="fd-ribbon" aria-label="এক নজরে ফ্ল্যাটের মূল সুবিধাসমূহ">
          {summaryPills.map((item) => (
            <li key={item.text} className="fd-ribbon__pill">
              <span className="fd-ribbon__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </header>

      {/* =====================================================================
          TWO-COLUMN MAIN LAYOUT (Desktop: 65% Left / 35% Right Sticky)
         ===================================================================== */}
      <main className="fd-grid">
        {/* ----------------- LEFT COLUMN (65%): Video + Room Gallery ----------------- */}
        <div className="fd-col-left">
          {/* 1. Clean Walkthrough Video Card (Gracefully hidden if no main video is set) */}
          {hasMainVideo && (
            <section className="fd-puthi-card fd-video-card" aria-label="পুরো ফ্ল্যাটের ভিডিও">
              <div className="fd-puthi-card__inner-rule" aria-hidden="true" />
              <CardAlpanaCorner pos="tl" />
              <CardAlpanaCorner pos="tr" />
              <CardAlpanaCorner pos="bl" />
              <CardAlpanaCorner pos="br" />

              <h2 className="fd-card-title">🎥 পুরো ফ্ল্যাটের ভিডিও</h2>

              <div className="fd-video-frame">
                {matchedUnit.driveVideoId ? (
                  <iframe
                    title={`ইউনিট ${matchedUnit.id} পুরো ফ্ল্যাটের ভিডিও`}
                    src={`https://drive.google.com/file/d/${matchedUnit.driveVideoId}/preview`}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={matchedUnit.mainVideoUrl}
                    controls
                    preload="metadata"
                  />
                )}
              </div>
            </section>
          )}

          {/* 2. Clean Room-by-Room Photo & Video Gallery */}
          <section className="fd-gallery-section" aria-label="রুম অনুযায়ী ছবি ও ভিডিও">
            {/* Dynamic Quick Filter Tabs */}
            <div className="fd-filter-tabs" role="tablist" aria-label="রুম ফিল্টার">
              <button
                type="button"
                role="tab"
                aria-selected={activeTabId === 'all'}
                className={`fd-filter-tab ${
                  activeTabId === 'all' ? 'fd-filter-tab--active' : ''
                }`}
                onClick={() => setActiveTabId('all')}
              >
                সব রুম
              </button>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTabId === sec.id}
                  className={`fd-filter-tab ${
                    activeTabId === sec.id ? 'fd-filter-tab--active' : ''
                  }`}
                  onClick={() => setActiveTabId(sec.id)}
                >
                  {sec.titleBn.replace(/\s*\(.*\)/, '')}
                </button>
              ))}
            </div>

            {/* Clean Room Section Cards */}
            <div className="fd-room-sections">
              {filteredSections.map((section) => {
                const originalIndex = sections.findIndex((s) => s.id === section.id);
                const numberedTitle = /^\d|^[\u09E6-\u09EF]/.test(section.titleBn)
                  ? section.titleBn
                  : `${toBanglaDigits(originalIndex + 1)}. ${section.titleBn}`;

                return (
                  <article key={section.id} className="fd-puthi-card fd-room-card">
                    <div className="fd-puthi-card__inner-rule" aria-hidden="true" />
                    <h3 className="fd-room-card__title">{numberedTitle}</h3>

                    <div className="fd-media-grid">
                      {(section.items || []).map((item) => {
                        if (item.type === 'video') {
                          const videoSrc = item.driveFileId
                            ? `https://drive.google.com/file/d/${item.driveFileId}/preview`
                            : item.previewUrl;

                          return (
                            <div
                              key={item.id}
                              className="fd-media-thumb fd-media-thumb--video"
                            >
                              {item.driveFileId ? (
                                <iframe
                                  title={item.labelBn || section.titleBn}
                                  src={videoSrc}
                                  allow="autoplay; fullscreen"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={videoSrc}
                                  controls
                                  preload="metadata"
                                />
                              )}
                              <span className="fd-media-video-tag">🎥 ভিডিও</span>
                            </div>
                          );
                        }

                        const globalImgIdx = flatImageList.findIndex(
                          (m) => m.id === item.id
                        );
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className="fd-media-thumb"
                            onClick={() => setLightboxIndex(globalImgIdx)}
                            aria-label={`${section.titleBn} — ${
                              item.labelBn || 'ছবি বড় করে দেখুন'
                            }`}
                          >
                            <img
                              src={getMediaThumbUrl(item)}
                              alt={item.labelBn || section.titleBn}
                              loading="lazy"
                            />
                            <span className="fd-media-thumb__zoom" aria-hidden="true">
                              🔍
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* ----------------- RIGHT COLUMN (35% — Sticky Sidebar) ----------------- */}
        <aside className="fd-col-right" aria-label="ভাড়ার বিস্তারিত ও যোগাযোগ">
          <div className="fd-puthi-card fd-receipt-card">
            <div className="fd-puthi-card__inner-rule" aria-hidden="true" />
            <CardAlpanaCorner pos="tl" />
            <CardAlpanaCorner pos="tr" />
            <CardAlpanaCorner pos="bl" />
            <CardAlpanaCorner pos="br" />

            <h2 className="fd-receipt-card__heading">📋 ভাড়ার বিস্তারিত</h2>

            {/* Clean Rent Box */}
            <div className="fd-receipt-rent">
              <p className="fd-receipt-rent__amount">
                মাসিক ভাড়া: <strong>{rentFormatted}</strong>
              </p>
              {inclusiveBills && (
                <div className="fd-inclusive-badge">
                  ✅ গ্যাস, পানি ও ময়লার বিল ভাড়ার অন্তর্ভুক্ত
                </div>
              )}
            </div>

            {/* Single-Item Info Row */}
            <div className="fd-start-month-row">
              📅 <strong>ভাড়া শুরু:</strong> {availableFromLabel}
            </div>

            {/* Concise Location Box */}
            <div className="fd-location-box">
              <p className="fd-location-box__address">
                📍 {building.location.conciseAddressBn}
              </p>
              <a
                href={building.location.mapLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="fd-map-link-btn"
              >
                📍 গুগল ম্যাপে দেখুন ↗
              </a>
            </div>

            {/* Side-by-Side Bangla Call Buttons + Full-Width WhatsApp Button */}
            <div className="fd-contact-actions">
              <div className="fd-call-grid">
                <a
                  href={`tel:${building.contact.phone || '01817526285'}`}
                  className="fd-btn fd-btn--call"
                >
                  📞 {formatPhoneBn(building.contact.phone || '01817526285')}
                </a>
                {building.contact.phoneSecondary && (
                  <a
                    href={`tel:${building.contact.phoneSecondary}`}
                    className="fd-btn fd-btn--call"
                  >
                    📞 {formatPhoneBn(building.contact.phoneSecondary)}
                  </a>
                )}
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="fd-btn fd-btn--whatsapp"
              >
                💬 হোয়াটসঅ্যাপে মেসেজ দিন
              </a>
            </div>
          </div>
        </aside>
      </main>

      {/* =====================================================================
          MOBILE FIXED BOTTOM STICKY CONTACT BAR (<= 768px ONLY)
         ===================================================================== */}
      <div className="fd-mobile-sticky-bar" role="region" aria-label="তাৎক্ষণিক যোগাযোগ">
        <div className="fd-mobile-sticky-bar__rent">
          <strong>{rentFormatted}/মাস</strong>
          {inclusiveBills && <span>(গ্যাস-পানি সহ)</span>}
        </div>
        <div className="fd-mobile-sticky-bar__actions">
          <a
            href={`tel:${building.contact.phone || '01817526285'}`}
            className="fd-mobile-bar-btn fd-mobile-bar-btn--call"
          >
            📞 কল
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="fd-mobile-bar-btn fd-mobile-bar-btn--wa"
          >
            💬 হোয়াটসঅ্যাপ
          </a>
        </div>
      </div>

      {/* =====================================================================
          FULLSCREEN LIGHTBOX MODAL
         ===================================================================== */}
      {activeLightboxItem && (
        <div
          className="fd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="ছবি বড় করে দেখুন"
          onClick={closeLightbox}
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
        >
          <button
            type="button"
            className="fd-lightbox__close"
            onClick={closeLightbox}
            aria-label="বন্ধ করুন"
          >
            ✕
          </button>

          <button
            type="button"
            className="fd-lightbox__nav fd-lightbox__nav--prev"
            onClick={showPrev}
            aria-label="আগের ছবি"
          >
            <span className="fd-lightbox__arrow-desktop" aria-hidden="true">‹</span>
            <span className="fd-lightbox__arrow-mobile" aria-hidden="true">⬅️</span>
          </button>

          <figure
            className="fd-lightbox__figure"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getMediaFullUrl(activeLightboxItem)}
              alt={activeLightboxItem.labelBn || activeLightboxItem.sectionTitleBn}
              className="fd-lightbox__img"
            />
            <figcaption className="fd-lightbox__caption">
              <span>{activeLightboxItem.sectionTitleBn}</span>
              <span className="fd-lightbox__counter">
                {toBanglaDigits(lightboxIndex + 1)} / {toBanglaDigits(flatImageList.length)}
              </span>
            </figcaption>
          </figure>

          <button
            type="button"
            className="fd-lightbox__nav fd-lightbox__nav--next"
            onClick={showNext}
            aria-label="পরের ছবি"
          >
            <span className="fd-lightbox__arrow-desktop" aria-hidden="true">›</span>
            <span className="fd-lightbox__arrow-mobile" aria-hidden="true">➡️</span>
          </button>
        </div>
      )}
    </div>
  );
}
