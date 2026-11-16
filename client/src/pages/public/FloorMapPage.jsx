import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const selectedUnitId = params.get('unit') || 'B2';
  // Testing toggle so we can preview B2 as To-Let ("ভাড়া হবে") or Occupied ("ভাড়া হয়ে গেছে")
  const [demoToLet, setDemoToLet] = useState(false);

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
      {/* Top navigation & Floor Switcher bar */}
      <header className="fmap-header">
        <div className="fmap-header__top-bar">
          <Link to="/" className="fmap-back-btn">
            ⬅️ হোম পেজে ফিরে যান
          </Link>

          {/* Floor Switcher */}
          <nav className="fmap-switcher" aria-label="তলা পরিবর্তন করুন">
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
                  {f.blueprintReady && <span className="fmap-switcher__dot" title="অটো-ক্যাড নকশা প্রস্তুত" />}
                </button>
              );
            })}
          </nav>

          {/* Testing toggle for B2 status */}
          <button
            type="button"
            role="switch"
            aria-checked={demoToLet}
            className={`fmap-demo-toggle ${demoToLet ? 'fmap-demo-toggle--on' : ''}`}
            onClick={() => setDemoToLet((v) => !v)}
          >
            {demoToLet
              ? '🟢 ডেমো: B2 ভাড়া হবে (To-Let)'
              : '🧪 ডেমো টগল: B2 খালি হিসেবে দেখুন'}
          </button>
        </div>

        <div className="fmap-header__title-block">
          <p className="fmap-header__eyebrow">স্থাপত্য ফ্লোর ম্যাপ ও রুমের নকশা • {building.name}</p>
          <h1 className="fmap-header__title">
            {currentFloor.titleBn || `${currentFloor.nameBn} (ফ্লোর ${currentFloor.id})`}
          </h1>
          <p className="fmap-header__subtitle">
            উপরে <strong>পশ্চিম দিক</strong> (নিজস্ব খালি জায়গা), নিচে <strong>পূর্ব দিক</strong> (সামনের মেইন রোড) এবং ডানে <strong>উত্তর দিক</strong> (রাস্তা ও খোলা প্লট)।
          </p>
        </div>

        {/* Legend bar */}
        <ul className="fmap-legend" aria-label="নকশার রঙের অর্থ">
          <li>
            <span className="fmap-legend__box fmap-legend__box--owner" />
            ইউনিট B1: বাড়িওয়ালা (মালিকের নিজস্ব বাসভবন)
          </li>
          <li>
            <span
              className={`fmap-legend__box ${
                demoToLet ? 'fmap-legend__box--available' : 'fmap-legend__box--tenant'
              }`}
            />
            ইউনিট B2: ভাড়াটিয়ার ইউনিট (ছবি ও ভিডিও দেখতে ক্লিক করুন)
          </li>
          <li>
            <span className="fmap-legend__box fmap-legend__box--stairs" />
            সিঁড়ি ঘর ও প্রবেশপথ (নীল পিলার চিহ্নিত)
          </li>
        </ul>
      </header>

      <main className="fmap-main">
        {!ActiveBlueprint && (
          <div className="fmap-modular-notice" role="status">
            <div>
              <strong>{currentFloor.titleBn}</strong>-এর নিজস্ব অটো-ক্যাড নকশা পরের ধাপে যুক্ত করা হবে।
              আপাতত নিচে <strong>২য় তলা (ফ্লোর B: ইউনিট B1 ও B2)</strong>-এর সম্পূর্ণ অটো-ক্যাড ফ্লোর ম্যাপ দেখানো হচ্ছে।
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
            <ActiveBlueprint
              floor={currentFloor}
              selectedUnitId={selectedUnitId}
              demoToLet={demoToLet}
            />
          ) : (
            <FloorBBlueprint
              floor={floorB}
              selectedUnitId="B2"
              demoToLet={demoToLet}
            />
          )}
        </FloorCompassFrame>
      </main>
    </div>
  );
}
