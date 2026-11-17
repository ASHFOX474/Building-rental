import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPinLogin from '../../components/admin/AdminPinLogin.jsx';
import RentLedgerTab from '../../components/admin/RentLedgerTab.jsx';
import { useBuilding } from '../../context/BuildingContext.jsx';
import '../../components/admin/admin.css';

const ADMIN_AUTH_KEY = 'moni_lodge_admin_unlocked_v1';

function isInitiallyUnlocked() {
  try {
    return (
      localStorage.getItem(ADMIN_AUTH_KEY) === 'true' ||
      sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

const ADMIN_TABS = [
  { id: 'ledger', labelBn: '📖 ১. ভাড়ার খাতা (মাসের হিসাব)' },
  { id: 'tolet', labelBn: '🏠 ২. টু-লেট ও ছবি আপলোড' },
  { id: 'settings', labelBn: '🏢 ৩. ভবন ও ভাড়াটিয়া সেটিংস' },
];

/**
 * Private Family Admin Panel (/admin)
 * Part 1: PIN Pad Login, 3-Tab Header Navigation, and Tab 1 (Monthly Rent Ledger).
 */
export default function AdminDashboardPage() {
  const { building } = useBuilding();
  const [unlocked, setUnlocked] = useState(isInitiallyUnlocked);
  const [activeTab, setActiveTab] = useState('ledger');
  const [preselectedUnitId, setPreselectedUnitId] = useState('E1');

  const handleUnlock = (rememberDevice) => {
    setUnlocked(true);
    try {
      if (rememberDevice) {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } else {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      }
    } catch {
      // ignore storage errors
    }
  };

  const handleLogout = () => {
    setUnlocked(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {
      // ignore
    }
  };

  const handleJumpToToLet = (unitId) => {
    if (unitId) setPreselectedUnitId(unitId);
    setActiveTab('tolet');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!unlocked) {
    return <AdminPinLogin onUnlock={handleUnlock} />;
  }

  return (
    <div className="adm-page">
      {/* =====================================================================
          ADMIN TOP BAR
         ===================================================================== */}
      <header className="adm-header">
        <div className="adm-topbar">
          <Link to="/" className="adm-back-btn">
            ⬅️ মূল ওয়েবসাইটে ফিরে যান
          </Link>

          <h1 className="adm-topbar__title">
            🏢 আমাদের বিল্ডিং ড্যাশবোর্ড — {building.name}
          </h1>

          <button
            type="button"
            className="adm-logout-btn"
            onClick={handleLogout}
          >
            🚪 লগআউট
          </button>
        </div>

        {/* ===================================================================
            3 GIANT TOP TABS
           =================================================================== */}
        <nav className="adm-tabs" role="tablist" aria-label="অ্যাডমিন প্যানেল ট্যাবসমূহ">
          {ADMIN_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`adm-tab-btn ${isActive ? 'adm-tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.labelBn}
              </button>
            );
          })}
        </nav>
      </header>

      {/* =====================================================================
          TAB CONTENT AREA
         ===================================================================== */}
      <main className="adm-main">
        {activeTab === 'ledger' && (
          <RentLedgerTab onSwitchToToLetTab={handleJumpToToLet} />
        )}

        {activeTab === 'tolet' && (
          <section className="adm-puthi-card adm-placeholder-card">
            <div className="adm-puthi-card__inner-rule" aria-hidden="true" />
            <span className="adm-placeholder-card__badge">পরবর্তী ধাপ (Part 2)</span>
            <h2 className="adm-placeholder-card__title">
              🏠 ২. টু-লেট ও ছবি আপলোড (নির্বাচিত ইউনিট: {preselectedUnitId})
            </h2>
            <p className="adm-placeholder-card__desc">
              এই ট্যাবে যেকোনো ফ্ল্যাটের <strong>টু-লেট (ভাড়া হবে / ভাড়া হয়ে গেছে)</strong> সুইচ অন-অফ করা এবং রুম অনুযায়ী গুগল ড্রাইভের ছবি ও ভিডিও খুব সহজে সাজানোর সুবিধা <strong>Part 2</strong>-তে যুক্ত হবে।
            </p>
            <button
              type="button"
              className="adm-back-to-ledger-btn"
              onClick={() => setActiveTab('ledger')}
            >
              ⬅️ ভাড়ার খাতায় ফিরে যান
            </button>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="adm-puthi-card adm-placeholder-card">
            <div className="adm-puthi-card__inner-rule" aria-hidden="true" />
            <span className="adm-placeholder-card__badge">পরবর্তী ধাপ (Part 3)</span>
            <h2 className="adm-placeholder-card__title">
              🏢 ৩. ভবন ও ভাড়াটিয়া সেটিংস
            </h2>
            <p className="adm-placeholder-card__desc">
              এই ট্যাবে প্রতিটি ফ্ল্যাটের ভাড়াটিয়ার নাম, মোবাইল নম্বর, মাসিক ভাড়ার পরিমাণ পরিবর্তন এবং বিল্ডিংয়ের তলা ও ফ্ল্যাট নিয়ন্ত্রণের সুবিধা <strong>Part 3</strong>-তে যুক্ত হবে।
            </p>
            <button
              type="button"
              className="adm-back-to-ledger-btn"
              onClick={() => setActiveTab('ledger')}
            >
              ⬅️ ভাড়ার খাতায় ফিরে যান
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
