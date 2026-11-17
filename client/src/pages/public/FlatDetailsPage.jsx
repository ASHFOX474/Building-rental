import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { building, floors } from '../../data/mockBuilding.js';
import { isUnitAvailable } from '../../components/floormap/UnitStatusElements.jsx';
import { formatTaka, monthBn, toBanglaDigits } from '../../lib/bangla.js';
import '../../components/flatdetails/flatdetails.css';

/** Extract a clean Google Drive File ID from either a raw ID or a full Drive sharing URL. */
function extractDriveFileId(input) {
  if (!input) return '';
  const trimmed = String(input).trim();
  const matchFromPath = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFromPath) return matchFromPath[1];
  const matchFromQuery = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchFromQuery) return matchFromQuery[1];
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) return trimmed;
  return '';
}

/** Subtle L-shaped Kantajew/Alpana corner motif for Page 3 Puthichitro cards. */
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
          <path d="M 11,5 Q 15,10 19,5 Q 23,10 27,5" strokeWidth="0.9" />
          <path d="M 5,11 Q 10,15 5,19 Q 10,23 5,27" strokeWidth="0.9" />
          <circle cx="20" cy="20" r="1.2" fill="#C85A32" stroke="none" />
        </g>
      </svg>
    </span>
  );
}

/** Ornamental horizontal Alpana divider beneath the unit title. */
function AlpanaBannerDivider() {
  return (
    <div className="fd-divider" aria-hidden="true">
      <svg viewBox="0 0 260 20" fill="none">
        <g stroke="#C85A32" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 10,10 C 30,4 46,16 66,10 C 82,5 96,14 112,10" strokeWidth="1.3" />
          <circle cx="117" cy="10" r="1.5" fill="#C85A32" stroke="none" />
          <path
            d="M 130,3 L 137,10 L 130,17 L 123,10 Z"
            fill="#C85A32"
            fillOpacity="0.18"
            strokeWidth="1.3"
          />
          <circle cx="130" cy="10" r="1.8" fill="#C85A32" stroke="none" />
          <circle cx="143" cy="10" r="1.5" fill="#C85A32" stroke="none" />
          <path d="M 148,10 C 164,14 178,5 194,10 C 214,16 230,4 250,10" strokeWidth="1.3" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Page 3 — Flat Media & Full Details Page (/flat/:unitId)
 * Part 1: Privacy Guard, Top Navigation, Unit Header, Summary Ribbon,
 * Two-Column Hero (Walkthrough Video + Sticky Rent Receipt), and Interior Spec Sheet.
 */
export default function FlatDetailsPage() {
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

  // Fallback floor number for back button if an unknown ID was typed
  const fallbackFloorNumber =
    normalizedId.startsWith('E') ? 5 :
    normalizedId.startsWith('D') ? 4 :
    normalizedId.startsWith('C') ? 3 :
    normalizedId.startsWith('A') ? 1 : 2;

  const floorNumber = matchedFloor?.floorNumber || fallbackFloorNumber;
  const floorNameBn = matchedFloor?.nameBn || `${toBanglaDigits(floorNumber)}ম তলা`;

  // All currently available units across the building (for quick comparison switcher)
  const availableUnits = floors.flatMap((f) =>
    f.units
      .filter((u) => isUnitAvailable(u))
      .map((u) => ({ ...u, floorNumber: f.floorNumber, floorNameBn: f.nameBn }))
  );

  // State for testing a custom Google Drive video link or File ID live
  const [customDriveInput, setCustomDriveInput] = useState('');
  const [showDriveTester, setShowDriveTester] = useState(false);

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

          <p className="fd-privacy-card__desc">
            বর্তমানে বসবাসরত ভাড়াটিয়াদের ব্যক্তিগত গোপনীয়তা ও নিরাপত্তা রক্ষার্থে শুধুমাত্র যে ফ্ল্যাটগুলো{' '}
            <strong>ভাড়া হবে (To-Let)</strong> সেগুলোর ভেতরের ছবি ও ভিডিও প্রদর্শন করা হয়।
          </p>

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
                🟢 বর্তমানে খালি থাকা ফ্ল্যাটগুলোর ছবি ও ভিডিও দেখুন:
              </p>
              <div className="fd-privacy-card__open-pills">
                {availableUnits.map((u) => (
                  <Link
                    key={u.id}
                    to={`/flat/${u.id}`}
                    className="fd-open-unit-pill"
                  >
                    🟢 ইউনিট {u.id} ({u.floorNameBn}) — ছবি ও ভিডিও দেখুন ➔
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
  // 2. DYNAMIC UNIT DATA FOR AVAILABLE FLAT (e.g., E1 or D3)
  // =========================================================================
  const isCompactUnit = matchedUnit.id.endsWith('2') && matchedFloor.units.length === 3;
  const bedroomsCount = matchedUnit.bedrooms || (isCompactUnit ? 2 : 3);
  const washroomsCount = matchedUnit.washrooms || 2;
  const balconiesCount = matchedUnit.balconies || (isCompactUnit ? 2 : 3);
  const monthlyRent = matchedUnit.rent || 12000;
  const rentFormatted = formatTaka(monthlyRent);
  const rentDigitsBn = toBanglaDigits(monthlyRent.toLocaleString('en-IN'));

  const availableFromLabel = matchedUnit.availableFrom
    ? `${monthBn(matchedUnit.availableFrom)} ২০২৭ থেকে`
    : 'জানুয়ারি ২০২৭ থেকে';

  const activeDriveId = extractDriveFileId(customDriveInput || matchedUnit.driveVideoId);
  const externalDriveUrl =
    building.contact.externalMediaUrl || 'http://tiny.cc/FlatsPhotosAndVideo';

  const whatsappMessage = `আসসালামু আলাইকুম, আমি ওয়েবসাইটে আপনাদের ইউনিট ${matchedUnit.id}-এর বিস্তারিত ও ভিডিও দেখে যোগাযোগ করছি। বাসাটি সরাসরি দেখতে চাই।`;
  const whatsappUrl = `https://wa.me/${building.contact.whatsapp}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const summarySpecs = [
    { icon: '🛏️', text: `${toBanglaDigits(bedroomsCount)}টি বেডরুম` },
    { icon: '🛋️', text: 'ড্রয়িং ও ডাইনিং একসাথে' },
    { icon: '🚿', text: `${toBanglaDigits(washroomsCount)}টি বাথরুম (১টি হাই-কমোড)` },
    {
      icon: '☀️',
      text:
        balconiesCount === 3
          ? '৩টি বারান্দা (প্রতিটি বেডরুমের সাথে)'
          : `${toBanglaDigits(balconiesCount)}টি বারান্দা`,
    },
    { icon: '🔥', text: 'লাইনের গ্যাসের সুবিধা' },
    { icon: '⚡', text: 'প্রি-পেইড বিদ্যুৎ মিটার' },
    { icon: '💧', text: '২৪ ঘণ্টা পৌরসভার পানি' },
    { icon: '📹', text: '২৪ ঘণ্টা সিসিটিভি নিরাপত্তা' },
    { icon: '👨‍👩‍👧‍👦', text: 'শুধুমাত্র ফ্যামিলি' },
  ];

  const interiorHighlights = [
    {
      icon: '✨',
      title: 'টাইলস ও ফিনিশিং:',
      desc: 'পুরো বাসায় উন্নতমানের টাইলস করা, এমনকি ডাইনিং ও ড্রয়িং রুমের দেয়ালেও টাইলসের সুন্দর ফিনিশিং রয়েছে।',
    },
    {
      icon: '☀️',
      title: 'প্রাকৃতিক আলো-বাতাস:',
      desc: 'কর্নার প্লট হওয়ায় ৩ দিক থেকে পর্যাপ্ত আলো-বাতাস প্রবেশ করে; দিনের বেলায় লাইট জ্বালানোর প্রয়োজন হয় না।',
    },
    {
      icon: '🍳',
      title: 'রান্নাঘর ও বারান্দা:',
      desc: `সুপরিকল্পিত ও আধুনিক কিচেন এবং প্রতিটি বেডরুমের সাথে সংযুক্ত ${toBanglaDigits(
        balconiesCount
      )}টি সুন্দর বারান্দা।`,
    },
    {
      icon: '🔥',
      title: 'গ্যাস ও পানি:',
      desc: 'লাইনের গ্যাসের সুবিধা এবং পৌরসভার সরবরাহকৃত পানি ২৪ ঘণ্টা পাওয়া যায়।',
    },
    {
      icon: '📹',
      title: 'নিরাপত্তা:',
      desc: 'সিসিটিভি (CCTV) ক্যামেরার মাধ্যমে ২৪ ঘণ্টা নিরাপত্তা পর্যবেক্ষণ।',
    },
  ];

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
            <span className="fd-topbar__switch-label">খালি ফ্ল্যাট:</span>
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
          UNIT HEADER BANNER & AT-A-GLANCE SUMMARY RIBBON
         ===================================================================== */}
      <header className="fd-header">
        <span className="fd-header__badge">
          <span className="fd-header__badge-dot" aria-hidden="true" />
           ভাড়া হবে — শুধুমাত্র ফ্যামিলি বাসা
        </span>

        <h1 className="fd-header__title">
          ইউনিট {matchedUnit.id} ({floorNameBn}) — সম্পূর্ণ নতুন ও আধুনিক ফ্যামিলি ফ্ল্যাট
        </h1>

        <AlpanaBannerDivider />

        <p className="fd-header__subtitle">
          আপনার পরিবারের জন্য খোলামেলা, আলো-বাতাসপূর্ণ ও আরামদায়ক একটি সুন্দর বাসা — কর্নার প্লট হওয়ায় ৩ দিক থেকে পর্যাপ্ত আলো-বাতাস চলাচলের সুব্যবস্থা।
        </p>

        {/* At-a-Glance Summary Ribbon */}
        <ul className="fd-ribbon" aria-label="এক নজরে ফ্ল্যাটের মূল সুবিধাসমূহ">
          {summarySpecs.map((item) => (
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
        {/* ----------------- LEFT COLUMN (65%) ----------------- */}
        <div className="fd-col-left">
          {/* 1. Main Flat Walkthrough Video Player Card */}
          <section
            className="fd-puthi-card fd-video-card"
            aria-labelledby="walkthrough-video-heading"
          >
            <div className="fd-puthi-card__inner-rule" aria-hidden="true" />
            <CardAlpanaCorner pos="tl" />
            <CardAlpanaCorner pos="tr" />
            <CardAlpanaCorner pos="bl" />
            <CardAlpanaCorner pos="br" />

            <div className="fd-video-card__header">
              <div>
                <span className="fd-section-eyebrow">পুরো ফ্ল্যাটের ভিডিও ট্যুর</span>
                <h2 id="walkthrough-video-heading" className="fd-section-title">
                  🎥 ঘরে বসেই পুরো ফ্ল্যাটের ভিডিও দেখুন
                </h2>
              </div>

              <button
                type="button"
                className="fd-drive-test-toggle"
                onClick={() => setShowDriveTester((v) => !v)}
              >
                {showDriveTester ? '✕ লিংক বক্স বন্ধ করুন' : '🔗 ড্রাইভ ভিডিও আইডি টেস্ট'}
              </button>
            </div>

            {showDriveTester && (
              <div className="fd-drive-tester">
                <label htmlFor="drive-video-input" className="fd-drive-tester__label">
                  যেকোনো Google Drive ভিডিওর শেয়ার লিংক বা File ID নিচে পেস্ট করে সরাসরি প্লেয়ার টেস্ট করুন:
                </label>
                <div className="fd-drive-tester__row">
                  <input
                    id="drive-video-input"
                    type="text"
                    value={customDriveInput}
                    onChange={(e) => setCustomDriveInput(e.target.value)}
                    placeholder="উদাহরণ: https://drive.google.com/file/d/1abcDEF.../view অথবা File ID"
                    className="fd-drive-tester__input"
                  />
                  {customDriveInput && (
                    <button
                      type="button"
                      className="fd-drive-tester__clear"
                      onClick={() => setCustomDriveInput('')}
                    >
                      মুছুন
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 16:9 Video Player Container */}
            <div className="fd-video-frame">
              {activeDriveId ? (
                <iframe
                  title={`ইউনিট ${matchedUnit.id} পুরো ফ্ল্যাটের ভিডিও ট্যুর`}
                  src={`https://drive.google.com/file/d/${activeDriveId}/preview`}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="fd-video-fallback">
                  <div className="fd-video-fallback__badge">
                    ইউনিট {matchedUnit.id} ({floorNameBn}) • এইচডি ভিডিও ও ছবি প্রস্তুত
                  </div>
                  <div className="fd-video-fallback__play-ring" aria-hidden="true">
                    <span>▶</span>
                  </div>
                  <h3 className="fd-video-fallback__title">
                    ঘরে বসেই পুরো ফ্ল্যাটের রুম-বাই-রুম ভিডিও ও ছবি দেখুন
                  </h3>
                  <p className="fd-video-fallback__sub">
                    ড্রয়িং-ডাইনিং • {toBanglaDigits(bedroomsCount)}টি বেডরুম • আধুনিক কিচেন • {toBanglaDigits(washroomsCount)}টি বাথরুম • {toBanglaDigits(balconiesCount)}টি বারান্দা
                  </p>
                  <div className="fd-video-fallback__actions">
                    <a
                      href={externalDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="fd-btn fd-btn--terracotta"
                    >
                      🎬 গুগল ড্রাইভে ফ্ল্যাটের ভিডিও ও ছবি দেখুন ↗
                    </a>
                  </div>
                  <p className="fd-video-fallback__link-note">
                    সরাসরি লিংক:{' '}
                    <a href={externalDriveUrl} target="_blank" rel="noreferrer">
                      {externalDriveUrl}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 2. Clean Placeholder Slot for Part 2: Room-by-Room Photo & Video Gallery */}
          <section
            id="room-media-gallery-slot"
            className="fd-puthi-card fd-gallery-slot"
            aria-label="রুম অনুযায়ী সাজানো ছবি ও ভিডিও গ্যালারি"
          >
            <div className="fd-gallery-slot__inner">
              <span className="fd-section-eyebrow">পরবর্তী অংশ (Part 2)</span>
              <h2 className="fd-section-title">
                📸 রুম অনুযায়ী সাজানো ছবি ও ভিডিও গ্যালারি
              </h2>
              <p className="fd-gallery-slot__desc">
                ড্রয়িং ও ডাইনিং, মাস্টার বেডরুম, ২য় ও ৩য় বেডরুম, আধুনিক কিচেন, বাথরুম এবং বারান্দার আলাদা আলাদা ছবি ও ফুল-স্ক্রিন লাইটবক্স ভিউ এখানে <strong>Part 2</strong>-তে যুক্ত হবে।
              </p>
            </div>
          </section>

          {/* 3. Detailed Highlights & Interior Features Card */}
          <section
            className="fd-puthi-card fd-features-card"
            aria-labelledby="interior-features-heading"
          >
            <div className="fd-puthi-card__inner-rule" aria-hidden="true" />
            <CardAlpanaCorner pos="tl" />
            <CardAlpanaCorner pos="tr" />
            <CardAlpanaCorner pos="bl" />
            <CardAlpanaCorner pos="br" />

            <span className="fd-section-eyebrow">স্থাপত্য বৈশিষ্ট্য ও ফিনিশিং</span>
            <h2 id="interior-features-heading" className="fd-section-title">
              🏡 বাসার বিবরণ ও বিশেষ সুবিধাসমূহ
            </h2>

            <ul className="fd-feature-list">
              {interiorHighlights.map((feat) => (
                <li key={feat.title} className="fd-feature-item">
                  <span className="fd-feature-item__icon" aria-hidden="true">
                    {feat.icon}
                  </span>
                  <div className="fd-feature-item__body">
                    <strong className="fd-feature-item__title">{feat.title}</strong>{' '}
                    <span className="fd-feature-item__desc">{feat.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ----------------- RIGHT COLUMN (35% — Sticky Receipt Card) ----------------- */}
        <aside className="fd-col-right" aria-label="ভাড়ার হিসাব ও যোগাযোগের কার্ড">
          <div className="fd-puthi-card fd-receipt-card">
            <div className="fd-puthi-card__inner-rule" aria-hidden="true" />
            <CardAlpanaCorner pos="tl" />
            <CardAlpanaCorner pos="tr" />
            <CardAlpanaCorner pos="bl" />
            <CardAlpanaCorner pos="br" />

            <h2 className="fd-receipt-card__heading">
              📋 ভাড়ার বিস্তারিত ও শর্তাবলী
            </h2>

            {/* Big Rent Display */}
            <div className="fd-receipt-rent">
              <span className="fd-receipt-rent__label">মাসিক ভাড়া (ইউনিট {matchedUnit.id})</span>
              <p className="fd-receipt-rent__amount">
                মাসিক ভাড়া: <strong>{rentFormatted}</strong> <small>/ মাস</small>
              </p>
            </div>

            {/* Highlighted Inclusive Callout Box */}
            <div className="fd-inclusive-callout">
              <p className="fd-inclusive-callout__main">
                ✅ গ্যাস বিল, পানির বিল ও ময়লার বিল এই {rentDigitsBn} টাকা ভাড়ার মধ্যেই অন্তর্ভুক্ত!
              </p>
              <p className="fd-inclusive-callout__sub">
                (অতিরিক্ত কোনো সার্ভিস চার্জ নেই)
              </p>
            </div>

            {/* Key Terms List */}
            <dl className="fd-terms-list">
              <div className="fd-terms-list__row">
                <dt>📅 ভাড়া শুরুর মাস:</dt>
                <dd>{availableFromLabel}</dd>
              </div>
              <div className="fd-terms-list__row">
                <dt>⚡ বিদ্যুৎ বিল:</dt>
                <dd>প্রি-পেইড মিটার (ব্যবহার অনুযায়ী ভাড়াটিয়ার নিজস্ব)</dd>
              </div>
              <div className="fd-terms-list__row">
                <dt>👨‍👩‍👧‍👦 ভাড়াটিয়ার ধরন:</dt>
                <dd>শুধুমাত্র ফ্যামিলি বাসা</dd>
              </div>
            </dl>

            {/* Location & Landmark Box */}
            <div className="fd-location-box">
              <h3 className="fd-location-box__title">📍 লোকেশন ও ঠিকানা</h3>
              <p className="fd-location-box__address">
                {building.location.fullAddressBn}
              </p>
              <a
                href={building.location.mapLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="fd-map-link-btn"
              >
                📍 গুগল ম্যাপে লোকেশন দেখুন ↗
              </a>
            </div>

            {/* Direct Call & WhatsApp Action Buttons */}
            <div className="fd-contact-actions">
              <h3 className="fd-contact-actions__title">📞 সরাসরি যোগাযোগ</h3>
              <a
                href="tel:01817526285"
                className="fd-btn fd-btn--call"
              >
                📞 কল করুন: 01817-526285 (০১৮১৭-৫২৬২৮৫)
              </a>
              <a
                href="tel:01815023898"
                className="fd-btn fd-btn--call fd-btn--call-alt"
              >
                📞 কল করুন: 01815-023898 (০১৮১৫-০২৩৮৯৮)
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="fd-btn fd-btn--whatsapp"
              >
                💬 হোয়াটসঅ্যাপে মেসেজ দিন
              </a>
            </div>

            <p className="fd-receipt-card__footer">
              “আগ্রহী পরিবারকে সরাসরি বাসা দেখে যাওয়ার আমন্ত্রণ জানানো হচ্ছে।”
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
