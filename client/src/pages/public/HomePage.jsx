import { useState } from 'react';
import Building from '../../components/building/Building.jsx';
import HomeHeader from '../../components/home/HomeHeader.jsx';
import LocationCard from '../../components/home/LocationCard.jsx';
import ContactCard from '../../components/home/ContactCard.jsx';
import { building, floors } from '../../data/mockBuilding.js';
import { stackFloors } from '../../lib/building.js';
import '../../components/home/home.css';

/** Page 1 — Public Home Page: the hand-drawn building array. */
export default function HomePage() {
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

        <section className="info-grid" aria-label="লোকেশন ও যোগাযোগ">
          <LocationCard location={building.location} />
          <ContactCard contact={building.contact} />
        </section>
      </main>

      <footer className="home__footer">© {building.name}, {building.area}</footer>
    </div>
  );
}
