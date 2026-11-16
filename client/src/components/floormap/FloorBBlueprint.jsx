import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Exact architectural floorplate for Row B (2nd Floor / ২য় তলা: Units B1 & B2)
 * reconstructed directly from the building's AutoCAD blueprint.
 *
 * - Unit B1 (Left L-shape): Muted sand fill (#EAE3D5), faint internal walls
 *   (opacity: 0.3), and gentle centered overlay text without any outer box.
 * - Unit B2 (Right): Outlined in deep Terracotta (#C85A32), with the primary
 *   "🎥 ছবি এবং ভিডিও দেখুন ➔" button embedded directly inside the center of
 *   the Drawing & Dining Room.
 */
export default function FloorBBlueprint({ floor }) {
  const navigate = useNavigate();
  const [b2Hovered, setB2Hovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const rawB2 = floor.units.find((u) => u.id === 'B2') || { id: 'B2' };

  const b2AccentColor = '#C85A32';
  const b2FillColor = '#FFFDF9';
  const b2VerandaFill = '#F6ECE3';

  const handleOpenMedia = (e) => {
    if (e) e.stopPropagation();
    navigate(`/flat/${rawB2.id}`);
  };

  // Exact outer polygon for L-shaped Owner Unit B1 (Blue border in CAD)
  const b1PolygonPoints = [
    '100,60',
    '735,60',
    '735,204',
    '570,204',
    '570,240',
    '432,240',
    '432,500',
    '418,500',
    '418,545',
    '280,545',
    '280,500',
    '252,500',
    '252,545',
    '114,545',
    '114,500',
    '100,500',
  ].join(' ');

  // Exact outer polygon for Tenant Unit B2 (Red border in CAD)
  const b2PolygonPoints = [
    '735,60',
    '900,60',
    '900,500',
    '884,500',
    '884,545',
    '748,545',
    '748,500',
    '720,500',
    '720,545',
    '584,545',
    '584,500',
    '570,500',
    '570,204',
    '735,204',
  ].join(' ');

  return (
    <div className="bp-stage">
      <svg
        className="bp-svg"
        viewBox="88 46 824 512"
        role="img"
        aria-label="২য় তলার (ফ্লোর B) স্থাপত্য ফ্লোর ম্যাপ: বাম পাশে ইউনিট B1 (বাড়িওয়ালা) এবং ডান পাশে ইউনিট B2 (ভাড়াটিয়ার ইউনিট)"
      >
        <defs>
          {/* Soft drop shadow for interactive B2 unit */}
          <filter id="b2-glow" x="-6%" y="-6%" width="112%" height="114%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation={b2Hovered ? '6' : '2.5'}
              floodColor={b2AccentColor}
              floodOpacity={b2Hovered ? '0.22' : '0.1'}
            />
          </filter>
        </defs>

        {/* ===================================================================
            1. LEFT L-SHAPED UNIT: B1 (OWNER'S UNIT / বাড়িওয়ালা)
               Muted sand fill (#EAE3D5) and faint watermark internal walls
               & labels (opacity: 0.3), with gentle centered overlay text
               (NO outer box around the text).
           =================================================================== */}
        <g className="bp-unit bp-unit--owner" aria-label="ইউনিট B1 — বাড়িওয়ালা (মালিকের নিজস্ব বাসভবন)">
          {/* Base Sand Fill */}
          <polygon points={b1PolygonPoints} fill="#EAE3D5" />

          {/* Internal Room Walls & Labels of B1 (faint watermark opacity: 0.3) */}
          <g className="bp-b1-internals" opacity="0.3" stroke="#1F2421" fill="none">
            {/* Far-Left Top Veranda (100..158, 60..128) & Bathroom (100..158, 128..212) */}
            <rect x="100" y="60" width="58" height="68" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="100" y="128" width="58" height="84" fill="#E5DECF" strokeWidth="1.6" />
            <rect x="155" y="102" width="6" height="22" fill="#EAE3D5" strokeWidth="1" />
            <rect x="155" y="182" width="6" height="24" fill="#EAE3D5" strokeWidth="1" />

            {/* Top-Left Bedroom (158..286, 60..212) with angled bottom-right doorway */}
            <path d="M 158,60 L 286,60 L 286,188 L 225,212 L 158,212 Z" strokeWidth="1.8" />
            <line x1="227" y1="215" x2="285" y2="192" strokeWidth="1.2" />

            {/* Top-Left-Center Veranda (286..340, 60..104) & Bathroom (340..432, 60..104) */}
            <rect x="286" y="60" width="54" height="44" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="340" y="60" width="92" height="44" fill="#E5DECF" strokeWidth="1.6" />
            <rect x="292" y="101" width="24" height="5" fill="#EAE3D5" strokeWidth="1" />
            <rect x="352" y="101" width="26" height="5" fill="#EAE3D5" strokeWidth="1" />

            {/* 2nd Bedroom of B1 (286..432, 104..188) */}
            <rect x="286" y="104" width="146" height="84" strokeWidth="1.8" />
            <rect x="296" y="185" width="52" height="6" fill="#EAE3D5" strokeWidth="1" />

            {/* Top-Center (Above Stairs): Veranda (432..570, 60..110) + Kitchen (432..570, 110..240) */}
            <rect x="432" y="60" width="138" height="50" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="526" y="107" width="38" height="5" fill="#EAE3D5" strokeWidth="1" />
            <path d="M 432,110 L 570,110 L 570,240 L 432,240" strokeWidth="1.8" />

            {/* Top-Right of Blue Zone (B1's 4th Bedroom + Bathroom + Veranda: 570..735, 60..204) */}
            <rect x="570" y="60" width="90" height="58" fill="#E5DECF" strokeWidth="1.6" />
            <rect x="632" y="115" width="22" height="5" fill="#EAE3D5" strokeWidth="1" />
            <rect x="660" y="60" width="75" height="42" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="662" y="99" width="24" height="5" fill="#EAE3D5" strokeWidth="1" />
            <path d="M 570,118 L 660,118 L 660,102 L 735,102 L 735,204 L 570,204 Z" strokeWidth="1.8" />
            <rect x="567" y="164" width="6" height="32" fill="#EAE3D5" strokeWidth="1" />

            {/* Middle-Left Common Toilet (100..185, 212..308) */}
            <rect x="100" y="212" width="85" height="96" fill="#E5DECF" strokeWidth="1.8" />
            <rect x="182" y="238" width="6" height="34" fill="#EAE3D5" strokeWidth="1" />

            {/* Bottom-Left Bedroom (100..266, 356..500) */}
            <rect x="100" y="356" width="166" height="144" strokeWidth="1.8" />
            <rect x="210" y="353" width="48" height="6" fill="#EAE3D5" strokeWidth="1" />

            {/* Two Protruding Bottom Verandas of B1 (y=500..545) */}
            <rect x="114" y="500" width="138" height="45" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="196" y="497" width="32" height="6" fill="#EAE3D5" strokeWidth="1" />
            <rect x="280" y="500" width="138" height="45" fill="#DFD7C6" strokeWidth="1.6" />

            {/* Watermark Bangla Room Labels inside B1 */}
            <g fill="#1F2421" stroke="none" textAnchor="middle" className="bp-b1-labels">
              <text x="129" y="94" transform="rotate(-90 129 94)" fontSize="10.5" fontWeight="600">বারান্দা</text>
              <text x="129" y="170" transform="rotate(-90 129 170)" fontSize="11" fontWeight="600">বাথরুম</text>
              <text x="222" y="138" fontSize="13.5" fontWeight="700">বেডরুম</text>

              <text x="313" y="86" fontSize="10" fontWeight="600">বারান্দা</text>
              <text x="386" y="86" fontSize="11" fontWeight="600">বাথরুম</text>
              <text x="359" y="150" fontSize="13.5" fontWeight="700">বেডরুম</text>

              <text x="501" y="90" fontSize="11.5" fontWeight="600">বারান্দা</text>
              <text x="501" y="182" fontSize="13" fontWeight="700">কিচেন</text>

              <text x="615" y="93" fontSize="11" fontWeight="600">বাথরুম</text>
              <text x="697" y="85" fontSize="10.5" fontWeight="600">বারান্দা</text>
              <text x="652" y="160" fontSize="13.5" fontWeight="700">বেডরুম</text>

              <text x="142" y="256" fontSize="11.5" fontWeight="600">কমন</text>
              <text x="142" y="272" fontSize="11.5" fontWeight="600">টয়লেট</text>

              <text x="310" y="264" fontSize="14.5" fontWeight="700">ড্রয়িং ও ডাইনিং</text>

              <text x="183" y="434" fontSize="13.5" fontWeight="700">বেডরুম</text>
              <text x="183" y="527" fontSize="11.5" fontWeight="600">বারান্দা</text>
              <text x="349" y="527" fontSize="11.5" fontWeight="600">বারান্দা</text>
            </g>
          </g>

          {/* Outer L-Shaped Border of B1 */}
          <polygon
            points={b1PolygonPoints}
            fill="none"
            stroke="#7A736A"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* B1 Entry Doorways from Stairs */}
          <line x1="432" y1="258" x2="432" y2="306" stroke="#8C857B" strokeWidth="3.5" strokeDasharray="5 4" />
          <line x1="518" y1="240" x2="558" y2="240" stroke="#8C857B" strokeWidth="3.5" strokeDasharray="5 4" />

          {/* Gentle Centered Overlay Text on B1 (NO outer box border!) */}
          <g className="bp-owner-text" transform="translate(310, 322)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill="#3E3A35"
              stroke="#EAE3D5"
              strokeWidth="7"
              paintOrder="stroke fill"
              fontSize="18.5"
              fontWeight="700"
              fontFamily="var(--font-heading)"
            >
              🏠 ইউনিট B1 — বাড়িওয়ালা
            </text>
          </g>
        </g>

        {/* ===================================================================
            2. CENTRAL STAIRCASE (সিঁড়ি / STAIRS: x=432..570, y=240..356)
           =================================================================== */}
        <g className="bp-stairs" aria-label="কেন্দ্রীয় সিঁড়ি ঘর (Staircase)">
          <rect
            x="432"
            y="240"
            width="138"
            height="116"
            fill="#F5F0E6"
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          <line x1="432" y1="268" x2="570" y2="268" stroke="#1F2421" strokeWidth="1.3" />
          <line x1="501" y1="268" x2="501" y2="338" stroke="#1F2421" strokeWidth="1.4" />
          {[278, 288, 298, 308, 318, 328, 338].map((yPos) => (
            <line
              key={yPos}
              x1="438"
              y1={yPos}
              x2="564"
              y2={yPos}
              stroke="#5C5852"
              strokeWidth="1"
              opacity="0.65"
            />
          ))}
          <text
            x="501"
            y="308"
            textAnchor="middle"
            fill="#1F2421"
            stroke="#F5F0E6"
            strokeWidth="6"
            paintOrder="stroke fill"
            fontSize="14"
            fontWeight="700"
            fontFamily="var(--font-heading)"
          >
            সিঁড়ি (Stairs)
          </text>
        </g>

        {/* ===================================================================
            3. RIGHT UNIT: B2 (TENANT UNIT / ভাড়াটিয়ার ইউনিট)
               Outlined in deep Terracotta (#C85A32) with the primary CTA button
               embedded right inside the center of Drawing & Dining Room.
           =================================================================== */}
        <g
          className={`bp-unit bp-unit--tenant ${b2Hovered ? 'bp-unit--hovered' : ''}`}
          filter="url(#b2-glow)"
          onClick={handleOpenMedia}
          onMouseEnter={() => setB2Hovered(true)}
          onMouseLeave={() => setB2Hovered(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleOpenMedia(e);
          }}
          aria-label="ইউনিট B2 — ছবি এবং ভিডিও দেখতে ক্লিক করুন"
        >
          {/* Base warm surface of Unit B2 */}
          <polygon points={b2PolygonPoints} fill={b2FillColor} />

          {/* --- ROOM 1: Top-Right Bedroom (735..848, 60..204) + Attached Veranda & Bathroom --- */}
          <rect
            x="735"
            y="60"
            width="113"
            height="144"
            fill={b2FillColor}
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          <rect
            x="848"
            y="60"
            width="52"
            height="62"
            fill={b2VerandaFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          <rect
            x="848"
            y="122"
            width="52"
            height="82"
            fill="#F2ECE1"
            stroke="#1F2421"
            strokeWidth="2"
          />
          {/* Doors for Top-Right Bedroom, Veranda & Bathroom */}
          <rect x="845" y="96" width="6" height="22" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="845" y="130" width="6" height="26" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="738" y="201" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* --- ROOM 2: Central Drawing & Dining Room (570..824, 204..356) --- */}
          <rect
            x="570"
            y="204"
            width="254"
            height="152"
            fill="#FAF5EC"
            stroke="#1F2421"
            strokeWidth="2.2"
          />

          {/* --- ROOM 3: Kitchen (824..900, 204..286) & Common Toilet (824..900, 286..356) --- */}
          <rect
            x="824"
            y="204"
            width="76"
            height="82"
            fill="#F7EFE4"
            stroke="#1F2421"
            strokeWidth="2"
          />
          <line x1="824" y1="207" x2="824" y2="238" stroke="#FAF5EC" strokeWidth="3.5" />

          <rect
            x="824"
            y="286"
            width="76"
            height="70"
            fill="#F2ECE1"
            stroke="#1F2421"
            strokeWidth="2"
          />
          <rect x="821" y="316" width="6" height="32" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* --- ROOM 4: Bottom-Left Bedroom of B2 (570..735, 356..500) + East Veranda --- */}
          <rect
            x="570"
            y="356"
            width="165"
            height="144"
            fill={b2FillColor}
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          <rect x="574" y="353" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect
            x="584"
            y="500"
            width="136"
            height="45"
            fill={b2VerandaFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          <rect x="602" y="497" width="38" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* --- ROOM 5: Bottom-Right Bedroom of B2 (735..900, 356..500) + East Veranda --- */}
          <rect
            x="735"
            y="356"
            width="165"
            height="144"
            fill={b2FillColor}
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          <rect x="738" y="353" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect
            x="748"
            y="500"
            width="136"
            height="45"
            fill={b2VerandaFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          <rect x="762" y="497" width="38" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* Outer Deep Terracotta Border of Tenant Unit B2 */}
          <polygon
            points={b2PolygonPoints}
            fill="none"
            stroke={b2AccentColor}
            strokeWidth={b2Hovered ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* 3 Square Entry Pillars on the Staircase Entry Wall (x=570) */}
          <g fill="#2B5B84" stroke="#1F2421" strokeWidth="1.2">
            <rect x="565" y="242" width="10" height="10" rx="1.5" />
            <rect x="565" y="294" width="10" height="10" rx="1.5" />
          </g>

          {/* --- CRISP BANGLA ROOM LABELS INSIDE B2 --- */}
          <g fill="#1F2421" textAnchor="middle" className="bp-b2-labels">
            {/* Unit B2 Header Tag */}
            <rect x="744" y="68" width="94" height="25" rx="6" fill={b2AccentColor} />
            <text x="791" y="85" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট B2
            </text>

            {/* Top-Right Bedroom */}
            <text x="791" y="132" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৩</text>
            <text x="791" y="149" fontSize="10.5" fill="#5C5852" fontWeight="600">(উত্তর-পশ্চিম কোণ)</text>

            {/* Top-Right Veranda & Attached Bathroom */}
            <text x="874" y="91" transform="rotate(-90 874 91)" fontSize="11" fontWeight="700" fill="#2D6A4F">বারান্দা</text>
            <text x="874" y="163" transform="rotate(-90 874 163)" fontSize="11.5" fontWeight="700">বাথরুম</text>

            {/* Central Drawing & Dining Room Heading */}
            <text x="697" y="246" fontSize="16" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং রুম
            </text>

            {/* Kitchen & Common Toilet */}
            <text x="862" y="244" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">কিচেন</text>
            <text x="862" y="260" fontSize="10" fill="#5C5852" fontWeight="600">(রান্নাঘর)</text>

            <text x="862" y="317" fontSize="11.5" fontWeight="700">কমন</text>
            <text x="862" y="332" fontSize="11.5" fontWeight="700">টয়লেট</text>

            {/* Bottom-Left Bedroom of B2 (Bedroom 1) + Veranda */}
            <text x="652" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ১</text>
            <text x="652" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(পূর্ব মুখী)</text>
            <text x="652" y="527" fontSize="12" fontWeight="700" fill="#2D6A4F">বারান্দা</text>

            {/* Bottom-Right Bedroom of B2 (Bedroom 2) + Veranda */}
            <text x="818" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ২</text>
            <text x="818" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(উত্তর-পূর্ব কোণ)</text>
            <text x="816" y="527" fontSize="12" fontWeight="700" fill="#2D6A4F">বারান্দা</text>
          </g>

          {/* --- EMBEDDED CTA BUTTON INSIDE DRAWING & DINING ROOM CENTER --- */}
          <g
            className="bp-room-cta"
            transform="translate(697, 294)"
            onClick={handleOpenMedia}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
          >
            {/* Button offset shadow */}
            <rect
              x="-101"
              y="-19"
              width="206"
              height="42"
              rx="11"
              fill="#1F2421"
            />
            {/* Main Terracotta Button body */}
            <rect
              x="-103"
              y="-22"
              width="206"
              height="42"
              rx="11"
              fill={btnHovered ? '#B34B25' : '#C85A32'}
              stroke="#1F2421"
              strokeWidth="2"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="14.5"
              fontWeight="700"
              fontFamily="var(--font-heading)"
            >
              🎥 ছবি এবং ভিডিও দেখুন ➔
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
