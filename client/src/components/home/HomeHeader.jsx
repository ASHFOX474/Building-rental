import { toBanglaDigits } from '../../lib/bangla.js';

/** Building name, perks line and the "শুধু খালি ফ্ল্যাট দেখুন" filter switch. */
export default function HomeHeader({ building, availableCount, onlyAvailable, onToggle }) {
  return (
    <header className="home-header">
      <p className="home-header__eyebrow">টু-লেট • ফ্ল্যাট ভাড়া</p>
      <h1 className="home-header__title">
        {building.name} <span className="home-header__area">— {building.area}</span>
      </h1>
      <p className="home-header__perks">{building.perks.join(' • ')}</p>

      <div className="home-header__bar">
        <p className="home-header__count">
          {availableCount > 0 ? (
            <>
              এখন <strong>{toBanglaDigits(availableCount)}টি</strong> ফ্ল্যাট খালি আছে
            </>
          ) : (
            'এই মুহূর্তে কোনো ফ্ল্যাট খালি নেই'
          )}
        </p>

        <button
          type="button"
          role="switch"
          aria-checked={onlyAvailable}
          className={`toggle ${onlyAvailable ? 'toggle--on' : ''}`}
          onClick={onToggle}
        >
          <span className="toggle__track" aria-hidden="true">
            <span className="toggle__thumb" />
          </span>
          শুধু খালি ফ্ল্যাট দেখুন
        </button>
      </div>

      <ul className="legend" aria-label="রঙের অর্থ">
        <li><span className="legend__swatch legend__swatch--available" /> ভাড়া হবে</li>
        <li><span className="legend__swatch legend__swatch--occupied" /> ভাড়া হয়ে গেছে</li>
        <li><span className="legend__swatch legend__swatch--owner" /> বাড়িওয়ালা</li>
      </ul>
    </header>
  );
}
