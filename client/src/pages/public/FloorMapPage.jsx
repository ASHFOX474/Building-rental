import { Link, useNavigate, useParams } from 'react-router-dom';
import FloorCompassFrame from '../../components/floormap/FloorCompassFrame.jsx';
import FloorBBlueprint from '../../components/floormap/FloorBBlueprint.jsx';
import FloorCBlueprint from '../../components/floormap/FloorCBlueprint.jsx';
import { building, floors } from '../../data/mockBuilding.js';
import '../../components/floormap/floormap.css';

// Modular blueprint registry: new floor CAD components (D, E, A) plug in here step by step.
const FLOOR_BLUEPRINTS = {
  B: FloorBBlueprint,
  C: FloorCBlueprint,
};

/** Hand-drawn ornamental Alpana divider (~~~ ❖ ~~~) placed beneath the page title. */
function AlpanaTitleDivider() {
  return (
    <div className="fmap-title-divider" aria-hidden="true">
      <svg viewBox="0 0 260 22" className="fmap-title-divider__svg" fill="none">
        <g stroke="#C85A32" strokeLinecap="round" strokeLinejoin="round">
          {/* Left flowing wave & kalka scroll */}
          <path d="M 8,11 C 28,5 44,17 64,11 C 80,6 94,15 110,11" strokeWidth="1.35" />
          <path d="M 48,11 C 54,6 62,6 66,11" strokeWidth="0.9" opacity="0.7" />
          <circle cx="115" cy="11" r="1.6" fill="#C85A32" stroke="none" />

          {/* Center lotus diamond motif (❖) */}
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

          {/* Right flowing wave & kalka scroll */}
          <circle cx="145" cy="11" r="1.6" fill="#C85A32" stroke="none" />
          <path d="M 150,11 C 166,15 180,6 196,11 C 216,17 232,5 252,11" strokeWidth="1.35" />
          <path d="M 194,11 C 198,6 206,6 212,11" strokeWidth="0.9" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
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
  const legendPills = currentFloor.legendPills || floorB.legendPills || [];

  return (
    <div className="fmap-page">
      {/* Top Bar (Back Button + Floor Switcher), Title, Alpana Divider & 3-Pill Legend */}
      <header className="fmap-header">
        <div className="fmap-header__nav">
          <Link to="/" className="fmap-back-btn">
            ⬅️ হোম পেজে ফিরে যান
          </Link>

          {/* Top Floor Switcher Bar */}
          <nav className="fmap-switcher" aria-label="অন্যান্য তলার ফ্লোর ম্যাপ দেখুন">
            {orderedFloors.map((f) => {
              const isActive = f.id === currentFloor.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => navigate(`/floor/${f.floorNumber}`)}
                  className={`fmap-switcher__btn ${isActive ? 'fmap-switcher__btn--active' : ''}`}
                >
                  {f.nameBn} ({f.id})
                  {f.blueprintReady && (
                    <span className="fmap-switcher__dot" title="অটো-ক্যাড নকশা প্রস্তুত" />
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

        {/* 3-Pill Legend */}
        <ul className="fmap-legend" aria-label="নকশার রঙের অর্থ">
          {legendPills.map((pill) => (
            <li key={pill.textBn} className="fmap-legend__pill">
              <span className={`fmap-legend__swatch fmap-legend__swatch--${pill.swatch}`} />
              {pill.textBn}
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

        <FloorCompassFrame surroundings={building.surroundings} hasAvailableUnit>
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
