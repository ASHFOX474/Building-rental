import { Link, useNavigate, useParams } from 'react-router-dom';
import FloorCompassFrame from '../../components/floormap/FloorCompassFrame.jsx';
import FloorABlueprint from '../../components/floormap/FloorABlueprint.jsx';
import FloorBBlueprint from '../../components/floormap/FloorBBlueprint.jsx';
import FloorCBlueprint from '../../components/floormap/FloorCBlueprint.jsx';
import FloorDEBlueprint from '../../components/floormap/FloorDEBlueprint.jsx';
import { isUnitAvailable } from '../../components/floormap/UnitStatusElements.jsx';
import { useBuilding } from '../../context/BuildingContext.jsx';
import { monthBn } from '../../lib/bangla.js';
import '../../components/floormap/floormap.css';

// Complete blueprint registry across all 5 floors (A, B, C, D, E)
const FLOOR_BLUEPRINTS = {
  A: FloorABlueprint,
  B: FloorBBlueprint,
  C: FloorCBlueprint,
  D: FloorDEBlueprint,
  E: FloorDEBlueprint,
};

/** Hand-drawn ornamental Alpana divider (~~~ ❖ ~~~) placed beneath the page title. */
function AlpanaTitleDivider() {
  return (
    <div className="fmap-title-divider" aria-hidden="true">
      <svg viewBox="0 0 260 22" className="fmap-title-divider__svg" fill="none">
        <g stroke="#C85A32" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 8,11 C 28,5 44,17 64,11 C 80,6 94,15 110,11" strokeWidth="1.35" />
          <path d="M 48,11 C 54,6 62,6 66,11" strokeWidth="0.9" opacity="0.7" />
          <circle cx="115" cy="11" r="1.6" fill="#C85A32" stroke="none" />

          <path
            d="M 130,3 L 138,11 L 130,19 L 122,11 Z"
            fill="#C85A32"
            fillOpacity="0.18"
            strokeWidth="1.4"
          />
          <circle cx="130" cy="11" r="2" fill="#C85A32" stroke="none" />
          <circle cx="125" cy="6" r="1" fill="#C85A32" stroke="none" />
          <circle cx="135" cy="6" r="1" fill="#C85A32" stroke="none" />
          <circle cx="125" cy="16" r="1" fill="#C85A32" stroke="none" />
          <circle cx="135" cy="16" r="1" fill="#C85A32" stroke="none" />

          <circle cx="145" cy="11" r="1.6" fill="#C85A32" stroke="none" />
          <path d="M 150,11 C 166,15 180,6 196,11 C 216,17 232,5 252,11" strokeWidth="1.35" />
          <path d="M 194,11 C 198,6 206,6 212,11" strokeWidth="0.9" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Builds the dynamic legend pills for a floor based on each unit's live
 * availability status (`available`, `occupied`, or `owner`) + Garage on Floor A.
 */
function buildDynamicLegendPills(floor) {
  const unitCount = floor.units.length;
  const pills = [];

  // On Ground Floor (Floor A), prepend the Garage legend pill
  if (floor.id === 'A') {
    pills.push({
      key: 'garage',
      swatch: 'owner',
      statusDot: '🚗',
      textBn: 'গ্যারেজ ও পার্কিং (বাম পাশ)',
      isAvailable: false,
    });
  }

  floor.units.forEach((unit, idx) => {
    let zoneSwatch = 'tenant';
    if (unit.status === 'owner') {
      zoneSwatch = 'owner';
    } else if (floor.id === 'A') {
      zoneSwatch = idx === 0 ? 'ochre' : 'tenant';
    } else if (unitCount === 3) {
      zoneSwatch = idx === 0 ? 'green' : idx === 1 ? 'ochre' : 'tenant';
    } else if (unitCount === 2) {
      zoneSwatch = idx === 0 ? 'green' : 'tenant';
    }

    if (unit.status === 'owner') {
      pills.push({
        key: unit.id,
        swatch: 'owner',
        statusDot: '🏠',
        textBn: `ইউনিট ${unit.id}: বাড়িওয়ালা (মালিকের নিজস্ব বাসস্থান)`,
        isAvailable: false,
      });
      return;
    }

    if (isUnitAvailable(unit)) {
      const fromText = unit.availableFrom ? ` (${monthBn(unit.availableFrom)} হতে)` : '';
      pills.push({
        key: unit.id,
        swatch: zoneSwatch,
        statusDot: '🟢',
        textBn: `ইউনিট ${unit.id}: ভাড়া হবে${fromText} — ছবি ও ভিডিও দেখুন`,
        isAvailable: true,
        unitId: unit.id,
      });
      return;
    }

    pills.push({
      key: unit.id,
      swatch: zoneSwatch,
      statusDot: '🔒',
      textBn: `ইউনিট ${unit.id}: ভাড়া হয়ে গেছে`,
      isAvailable: false,
    });
  });

  pills.push({
    key: 'stairs',
    swatch: 'stairs',
    statusDot: null,
    textBn: 'সিঁড়ি ঘর ও প্রবেশপথ',
    isAvailable: false,
  });

  return pills;
}

/** Page 2 — Interactive Architectural Floor Map View (ফ্লোর ম্যাপ ভিউ). */
export default function FloorMapPage() {
  const { building, floors } = useBuilding();
  const { floorNumber } = useParams();
  const navigate = useNavigate();

  const floorB = floors.find((f) => f.id === 'B') || floors[0];
  const currentFloor =
    floors.find((f) => String(f.floorNumber) === String(floorNumber)) || floorB;

  const ActiveBlueprint =
    FLOOR_BLUEPRINTS[currentFloor.id] ||
    (currentFloor.floorNumber >= 6 || currentFloor.units.length === 3
      ? FloorDEBlueprint
      : FloorBBlueprint);

  const legendPills = buildDynamicLegendPills(currentFloor);
  const floorHasAvailable = currentFloor.units.some(isUnitAvailable);

  return (
    <div className="fmap-page">
      {/* Top Bar (Back Button), Title, Alpana Divider & Dynamic Legend Pills */}
      <header className="fmap-header">
        <div className="fmap-header__nav">
          <Link to="/" className="fmap-back-btn">
            ⬅️ হোম পেজে ফিরে যান
          </Link>
        </div>

        <h1 className="fmap-header__title">
          {currentFloor.titleBn || `${currentFloor.nameBn} (ফ্লোর ${currentFloor.id})`}
        </h1>

        <AlpanaTitleDivider />

        {/* Dynamic Status Legend Pills */}
        <ul className="fmap-legend" aria-label="ইউনিটের বর্তমান অবস্থা ও রঙের অর্থ">
          {legendPills.map((pill) => (
            <li
              key={pill.key}
              className={`fmap-legend__pill ${
                pill.isAvailable ? 'fmap-legend__pill--available' : ''
              }`}
              onClick={
                pill.isAvailable ? () => navigate(`/flat/${pill.unitId}`) : undefined
              }
              role={pill.isAvailable ? 'button' : undefined}
              tabIndex={pill.isAvailable ? 0 : undefined}
              onKeyDown={
                pill.isAvailable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/flat/${pill.unitId}`);
                    }
                  : undefined
              }
            >
              <span className={`fmap-legend__swatch fmap-legend__swatch--${pill.swatch}`} />
              {pill.statusDot && <span aria-hidden="true">{pill.statusDot}</span>}
              <span>{pill.textBn}</span>
            </li>
          ))}
        </ul>
      </header>

      <main className="fmap-main">
        <FloorCompassFrame
          surroundings={building.surroundings}
          hasAvailableUnit={floorHasAvailable}
        >
          <ActiveBlueprint floor={currentFloor} />
        </FloorCompassFrame>
      </main>
    </div>
  );
}
