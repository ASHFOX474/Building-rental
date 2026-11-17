import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPinLogin from '../../components/admin/AdminPinLogin.jsx';
import RentLedgerTab from '../../components/admin/RentLedgerTab.jsx';
import ToLetMediaTab from '../../components/admin/ToLetMediaTab.jsx';
import BuildingSettingsTab from '../../components/admin/BuildingSettingsTab.jsx';
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
  {
    id: 'ledger',
    labelBn: '📖 ১. ভাড়ার খাতা (মাসের হিসাব)',
    icon: '📖',
    shortLabelBn: 'ভাড়ার খাতা',
  },
  {
    id: 'tolet',
    labelBn: '🏠 ২. টু-লেট ও ছবি আপলোড',
    icon: '🏠',
    shortLabelBn: 'টু-লেট ও ছবি',
  },
  {
    id: 'settings',
    labelBn: '🏢 ৩. ভবন ও ভাড়াটিয়া সেটিংস',
    icon: '🏢',
    shortLabelBn: 'সেটিংস',
  },
];

/**
 * Private Family Admin Panel (/admin)
 * Part 1: PIN Pad Login, 3-Tab Header Navigation, and Tab 1 (Monthly Rent Ledger).
 * Part 2: Tab 2 (Live To-Let Switch & Google Drive Room-by-Room Media Manager).
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
                <span className="adm-tab-btn__desktop">{tab.labelBn}</span>
                <span className="adm-tab-btn__mobile" aria-hidden="true">
                  <span className="adm-tab-btn__m-icon">{tab.icon}</span>
                  <span className="adm-tab-btn__m-text">{tab.shortLabelBn}</span>
                </span>
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
          <ToLetMediaTab initialUnitId={preselectedUnitId} />
        )}

        {activeTab === 'settings' && (
          <BuildingSettingsTab onSwitchToToLetTab={handleJumpToToLet} />
        )}
      </main>
    </div>
  );
}
