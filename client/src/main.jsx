import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import HomePage from './pages/public/HomePage.jsx';
import FloorMapPage from './pages/public/FloorMapPage.jsx';
import { floors } from './data/mockBuilding.js';
import { isUnitAvailable } from './components/floormap/UnitStatusElements.jsx';
import './styles/theme.css';

function FlatDetailsPlaceholder() {
  const { flatId } = useParams();
  const floorMapNumber =
    flatId?.startsWith('C') ? 3 :
    flatId?.startsWith('D') ? 4 :
    flatId?.startsWith('E') ? 5 :
    flatId?.startsWith('A') ? 1 : 2;

  const matchedUnit = floors
    .flatMap((f) => f.units)
    .find((u) => u.id === flatId);
  const available = isUnitAvailable(matchedUnit);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px' }}>
      <Link
        to={`/floor/${floorMapNumber}?unit=${encodeURIComponent(flatId || 'B2')}`}
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          border: '2px solid var(--ink)',
          borderRadius: 12,
          background: 'var(--surface-white)',
          color: 'var(--ink)',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        ⬅️ ফ্লোর ম্যাপে ফিরে যান
      </Link>

      {available ? (
        <>
          <h1 style={{ marginTop: 20 }}>
            ইউনিট {flatId} — রুম অনুযায়ী ছবি, ভিডিও ও বিস্তারিত (পেজ ৩)
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            এই পেজটি (Page 3: Categorized Room-by-Room Media & Full Details) পরবর্তী ধাপে তৈরি করা হবে।
          </p>
        </>
      ) : (
        <div
          style={{
            marginTop: 24,
            padding: '24px',
            borderRadius: 16,
            border: '2px solid var(--terracotta)',
            background: 'var(--surface-sand)',
          }}
        >
          <h2 style={{ margin: '0 0 8px' }}>🔒 ইউনিট {flatId} বর্তমানে ভাড়া হয়ে গেছে</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            ভাড়াটিয়াদের গোপনীয়তা রক্ষার্থে ছবি ও ভিডিও শুধুমাত্র খালি ফ্ল্যাটের জন্য উন্মুক্ত।
          </p>
        </div>
      )}
    </div>
  );
}

const Placeholder = ({ title }) => <h1 style={{ padding: 24 }}>{title}</h1>;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/floor/:floorNumber" element={<FloorMapPage />} />
        <Route path="/flat/:flatId" element={<FlatDetailsPlaceholder />} />
        <Route path="/admin/*" element={<Placeholder title="অ্যাডমিন প্যানেল" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
