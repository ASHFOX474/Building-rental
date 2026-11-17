import { Link, useNavigate, useParams } from 'react-router-dom';
import FloorCompassFrame from '../../components/floormap/FloorCompassFrame.jsx';
import FloorBBlueprint from '../../components/floormap/FloorBBlueprint.jsx';
import FloorCBlueprint from '../../components/floormap/FloorCBlueprint.jsx';
import FloorDEBlueprint from '../../components/floormap/FloorDEBlueprint.jsx';
import { isUnitAvailable } from '../../components/floormap/UnitStatusElements.jsx';
import { building, floors } from '../../data/mockBuilding.js';
import { monthBn } from '../../lib/bangla.js';
import '../../components/floormap/floormap.css';

// Modular blueprint registry: Floor A plugs in here next.
const FLOOR_BLUEPRINTS = {
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
 * availability status (`available`, `occupied`, or `owner`).
 */
function buildDynamicLegendPills(floor) {
  const unitCount = floor.units.length;
  const pills = floor.units.map((unit, idx) => {
    // Architectural border swatch color matching the blueprint zone
    let zoneSwatch = 'tenant';
    if (unit.status === 'owner') {
      zoneSwatch = 'owner';
    } else if (unitCount === 3) {
      zoneSwatch = idx === 0 ? 'green' : idx === 1 ? 'ochre' : 'tenant';
    } else if (unitCount === 2) {
      zoneSwatch = idx === 0 ? 'green' : 'tenant';
    }

    if (unit.status === 'owner') {
      return {
        key: unit.id,
        swatch: 'owner',
        statusDot: '🏠',
        textBn: `ইউনিট ${unit.id}: বাড়িওয়ালা (মালিকের নিজস্ব বাসস্থান)`,
        isAvailable: false,
      };
    }

    if (isUnitAvailable(unit)) {
      const fromText = unit.availableFrom ? ` (${monthBn(unit.availableFrom)} হতে)` : '';
      return {
        key: unit.id,
        swatch: zoneSwatch,
        statusDot: '🟢',
        textBn: `ইউনিট ${unit.id}: ভাড়া হবে${fromText} — ছবি ও ভিডিও দেখুন`,
        isAvailable: true,
        unitId: unit.id,
      };
    }

    return {
      key: unit.id,
      swatch: zoneSwatch,
      statusDot: '🔒',
      textBn: `ইউনিট ${unit.id}: ভাড়া হয়ে গেছে`,
      isAvailable: false,
    };
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
  const { floorNumber } = useParams();
  const navigate = useNavigate();

  const orderedFloors = floors
    .filter((f) => f.isVisible !== false)
    .slice()
    .sort((a, b) => a.floorNumber - b.floorNumber);

  const floorB = floors.find((f) => f.id === 'B') || floors[3];
  const currentFloor =
    floors.find((f) => String(f.floorNumber) === String(floorNumber)) || floorB;

  const ActiveBlueprint = FLOOR_BLUEPRINTS[currentFloor.id];
  const displayFloor = ActiveBlueprint ? currentFloor : floorB;
  const legendPills = buildDynamicLegendPills(displayFloor);
  const floorHasAvailable = displayFloor.units.some(isUnitAvailable);

  return (
    <div className="fmap-page">
      {/* Top Bar (Back Button + Floor Switcher), Title, Alpana Divider & Dynamic Legend Pills */}
      <header className="fmap-header">
        <div className="fmap-header__nav">
          <Link to="/" className="fmap-back-btn">
            ⬅️ হোম পেজে ফিরে যান
          </Link>

          {/* Top Floor Switcher Bar */}
          <nav className="fmap-switcher" aria-label="অন্যান্য তলার ফ্লোর ম্যাপ দেখুন">
            {orderedFloors.map((f) => {
              const isActive = f.id === currentFloor.id;
              const hasOpen = f.units.some(isUnitAvailable);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => navigate(`/floor/${f.floorNumber}`)}
                  className={`fmap-switcher__btn ${isActive ? 'fmap-switcher__btn--active' : ''}`}
                >
                  {f.nameBn} ({f.id})
                  {hasOpen && (
                    <span
                      className="fmap-switcher__dot fmap-switcher__dot--open"
                      title="এই তলায় ফ্ল্যাট খালি আছে (ভাড়া হবে)"
                    />
                  )}
                </button>
              );
            })}
          </nav>
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
        {!ActiveBlueprint && (
          <div className="fmap-modular-notice" role="status">
            <div>
              <strong>{currentFloor.titleBn}</strong>-এর নিজস্ব অটো-ক্যাড নকশা পরের ধাপে যুক্ত করা হবে।
              আপাতত নিচে <strong>২য় তলা (ফ্লোর B: ইউনিট B1 ও B2)</strong>-এর অটো-ক্যাড ফ্লোর ম্যাপ দেখানো হচ্ছে।
            </div>
            <button
              type="button"
              className="fmap-modular-notice__btn"
              onClick={() => navigate('/floor/2?unit=B2')}
            >
              ২য় তলায় (ফ্লোর B) যান ➔
            </button>
          </div>
        )}

        <FloorCompassFrame
          surroundings={building.surroundings}
          hasAvailableUnit={floorHasAvailable}
        >
          {ActiveBlueprint ? (
            <ActiveBlueprint floor={currentFloor} />
          ) : (
            <FloorBBlueprint floor={floorB} />
          )}
        </FloorCompassFrame>
      </main>
    </div>
  );
}
