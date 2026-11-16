/**
 * Surrounds any floor blueprint with the 4 directional & environmental context
 * strips (Top = West, Bottom = East Front Road, Right = North Road & Open Plot,
 * Left = South Breeze) + an architectural compass rose.
 */
export default function FloorCompassFrame({ surroundings, children }) {
  return (
    <div className="compass-frame" role="region" aria-label="স্থাপত্য ফ্লোর ম্যাপ ও চারপাশের পরিবেশ">
      {/* TOP EDGE — WEST (পশ্চিম দিক) */}
      <div className="env-strip env-strip--west">
        <span className="env-strip__tag">পশ্চিম (West)</span>
        <span className="env-strip__text">{surroundings.westTopBn}</span>
        <span className="env-strip__trees" aria-hidden="true">🌳 🌿 🌳 🌿 🌳</span>
      </div>

      <div className="compass-frame__middle">
        {/* LEFT EDGE — SOUTH (দক্ষিণ দিক) */}
        <aside className="env-strip env-strip--south" aria-label="দক্ষিণ দিক">
          <div className="env-strip__vertical-inner">
            <span className="env-strip__tag">দক্ষিণ (South)</span>
            <span className="env-strip__text">{surroundings.southLeftBn}</span>
            <span className="env-strip__wind" aria-hidden="true">〰️ 🍃 দখিনা বাতাস 〰️</span>
          </div>
        </aside>

        {/* CENTER — BLUEPRINT CANVAS */}
        <div className="compass-frame__canvas">
          {/* Architectural Compass Rose (Top = West) */}
          <div className="compass-rose" aria-label="দিক নির্দেশনা: উপরে পশ্চিম, নিচে পূর্ব, ডানে উত্তর, বামে দক্ষিণ">
            <svg viewBox="0 0 110 110" className="compass-rose__svg" aria-hidden="true">
              <circle cx="55" cy="55" r="38" fill="#FAF7F2" stroke="#1F2421" strokeWidth="1.5" strokeDasharray="3 2" />
              <circle cx="55" cy="55" r="24" fill="#F0EBE1" stroke="#1F2421" strokeWidth="1.2" />
              {/* Cross hairs */}
              <line x1="55" y1="14" x2="55" y2="96" stroke="#1F2421" strokeWidth="1.5" />
              <line x1="14" y1="55" x2="96" y2="55" stroke="#1F2421" strokeWidth="1.5" />
              {/* North pointer is to the RIGHT (x=96, y=55) */}
              <polygon points="98,55 82,49 85,55 82,61" fill="#C85A32" stroke="#1F2421" strokeWidth="1" />
              {/* West pointer is at TOP (x=55, y=14) */}
              <polygon points="55,12 49,26 55,23 61,26" fill="#2D6A4F" stroke="#1F2421" strokeWidth="1" />
              <circle cx="55" cy="55" r="3.5" fill="#C85A32" stroke="#1F2421" strokeWidth="1.2" />
              {/* Direction labels */}
              <text x="55" y="10" textAnchor="middle" className="compass-rose__lbl compass-rose__lbl--top">পশ্চিম (W)</text>
              <text x="55" y="107" textAnchor="middle" className="compass-rose__lbl">পূর্ব (E)</text>
              <text x="105" y="44" textAnchor="end" className="compass-rose__lbl compass-rose__lbl--north">উত্তর (N) ➔</text>
              <text x="5" y="44" textAnchor="start" className="compass-rose__lbl">⬅ দক্ষিণ (S)</text>
            </svg>
          </div>

          {children}
        </div>

        {/* RIGHT EDGE — NORTH (উত্তর দিক: রাস্তা ও খোলা প্লট) */}
        <aside className="env-strip env-strip--north" aria-label="উত্তর দিক">
          <div className="road-lane road-lane--vertical" aria-hidden="true">
            <span className="road-lane__dash" />
          </div>
          <div className="env-strip__vertical-inner">
            <span className="env-strip__tag env-strip__tag--green">উত্তর (North)</span>
            <span className="env-strip__text">{surroundings.northRightBn}</span>
          </div>
        </aside>
      </div>

      {/* BOTTOM EDGE — EAST / FRONT ROAD (সামনের রাস্তা — পূর্ব দিক) */}
      <div className="env-strip env-strip--east">
        <div className="road-lane road-lane--horizontal" aria-hidden="true">
          <span className="road-lane__label">সামনের মেইন রোড (পূর্ব দিক)</span>
          <span className="road-lane__dash" />
        </div>
        <div className="env-strip__east-row">
          <span className="env-strip__tag env-strip__tag--terracotta">পূর্ব (East • সম্মুখভাগ)</span>
          <span className="env-strip__text">{surroundings.eastBottomBn}</span>
          <span className="env-strip__opposite" aria-hidden="true">🏢 বিপরীত পাশের ভবনসমূহ</span>
        </div>
      </div>
    </div>
  );
}
