import { useState } from 'react';
import { Link } from 'react-router-dom';
import Building from '../../components/building/Building.jsx';
import HomeHeader from '../../components/home/HomeHeader.jsx';
import LocationCard from '../../components/home/LocationCard.jsx';
import ContactCard from '../../components/home/ContactCard.jsx';
import { useBuilding } from '../../context/BuildingContext.jsx';
import { stackFloors } from '../../lib/building.js';
import '../../components/home/home.css';

/** Page 1 — Public Home Page: the hand-drawn building array. */
export default function HomePage() {
  const { building, floors } = useBuilding();
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const availableCount = stackFloors(floors)
    .flatMap((f) => f.units)
    .filter((u) => u.status === 'available').length;

  return (
    <div className="home">
      <HomeHeader
        building={building}
        availableCount={availableCount}
        onlyAvailable={onlyAvailable}
        onToggle={() => setOnlyAvailable((v) => !v)}
      />

      <main>
        <Building
          floors={floors}
          showRentOnOccupied={building.showRentOnOccupied}
          onlyAvailable={onlyAvailable}
        />
        <p className="home__hint">খালি ফ্ল্যাটের ঘরে চাপ দিলে ফ্লোর ম্যাপ, ছবি ও ভিডিও দেখতে পাবেন।</p>
        <div className="home__blueprint-cta">
          <Link to="/floor/2?unit=B2" className="btn btn--blueprint">
            📐 ২য় তলার (ফ্লোর B: ইউনিট B1 ও B2) অটো-ক্যাড ফ্লোর ম্যাপ দেখুন ➔
          </Link>
        </div>

        <section className="info-grid" aria-label="লোকেশন ও যোগাযোগ">
          <LocationCard location={building.location} />
          <ContactCard contact={building.contact} />
        </section>
      </main>

      <footer className="home__footer">
        <span>© {building.name}, {building.area}</span>
        <span className="home__footer-dot" aria-hidden="true">•</span>
        <Link to="/admin" className="home__admin-link">
          🔒 বাড়িওয়ালা লগইন (Admin)
        </Link>
      </footer>
    </div>
  );
}
