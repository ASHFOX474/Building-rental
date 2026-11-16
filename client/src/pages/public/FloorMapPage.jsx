import { Link, useNavigate, useParams } from 'react-router-dom';
import FloorCompassFrame from '../../components/floormap/FloorCompassFrame.jsx';
import FloorBBlueprint from '../../components/floormap/FloorBBlueprint.jsx';
import { building, floors } from '../../data/mockBuilding.js';
import '../../components/floormap/floormap.css';

// Modular blueprint registry: new floor CAD components (C, D, E, A) plug in here step by step.
const FLOOR_BLUEPRINTS = {
  B: FloorBBlueprint,
};

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

  return (
    <div className="fmap-page">
      {/* Top Bar (Back Button + Floor Switcher), Title & 3-Pill Legend */}
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

        {/* 3-Pill Legend */}
        <ul className="fmap-legend" aria-label="নকশার রঙের অর্থ">
          <li className="fmap-legend__pill">
            <span className="fmap-legend__swatch fmap-legend__swatch--owner" />
            ইউনিট B1: বাড়িওয়ালা (মালিকের নিজস্ব বাসস্থান)
          </li>
          <li className="fmap-legend__pill">
            <span className="fmap-legend__swatch fmap-legend__swatch--tenant" />
            ইউনিট B2: ভাড়াটিয়ার ইউনিট (ছবি ও ভিডিও দেখতে ক্লিক করুন)
          </li>
          <li className="fmap-legend__pill">
            <span className="fmap-legend__swatch fmap-legend__swatch--stairs" />
            সিঁড়ি ঘর ও প্রবেশপথ
          </li>
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

        <FloorCompassFrame surroundings={building.surroundings}>
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
