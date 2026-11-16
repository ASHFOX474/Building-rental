import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Exact architectural floorplate for Row C (3rd Floor / ৩য় তলা: Units C1 & C2)
 * reconstructed directly from the Floor C AutoCAD blueprint.
 *
 * - Both Unit C1 (Left + Top-Middle L-shape, Green border in CAD -> #2D6A4F)
 *   and Unit C2 (Right side, Red border in CAD -> #C85A32) are active,
 *   full-visibility tenant units with embedded "🎥 ছবি এবং ভিডিও দেখুন ➔"
 *   buttons inside their Drawing & Dining rooms.
 */
export default function FloorCBlueprint({ floor }) {
  const navigate = useNavigate();
  const [c1Hovered, setC1Hovered] = useState(false);
  const [c2Hovered, setC2Hovered] = useState(false);
  const [c1BtnHovered, setC1BtnHovered] = useState(false);
  const [c2BtnHovered, setC2BtnHovered] = useState(false);

  const rawC1 = floor.units.find((u) => u.id === 'C1') || { id: 'C1' };
  const rawC2 = floor.units.find((u) => u.id === 'C2') || { id: 'C2' };

  const c1AccentColor = '#2D6A4F'; // Deep Leaf / Olive Green (matching Green CAD border)
  const c1FillColor = '#FBFDFB';
  const c1HallFill = '#EFF7F1';
  const c1VerandaFill = '#E2F1E7';

  const c2AccentColor = '#C85A32'; // Burnt Terracotta (matching Red CAD border)
  const c2FillColor = '#FFFDF9';
  const c2HallFill = '#FAF5EC';
  const c2VerandaFill = '#F6ECE3';

  const handleOpenC1 = (e) => {
    if (e) e.stopPropagation();
    navigate(`/flat/${rawC1.id}`);
  };

  const handleOpenC2 = (e) => {
    if (e) e.stopPropagation();
    navigate(`/flat/${rawC2.id}`);
  };

  // Exact outer polygon for L-shaped Tenant Unit C1 (Green border in CAD)
  const c1PolygonPoints = [
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

  // Exact outer polygon for Tenant Unit C2 (Red border in CAD)
  const c2PolygonPoints = [
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
        aria-label="৩য় তলার (ফ্লোর C) স্থাপত্য ফ্লোর ম্যাপ: বাম পাশে ইউনিট C1 (বড় ফ্ল্যাট) এবং ডান পাশে ইউনিট C2"
      >
        <defs>
          {/* Soft drop shadow for interactive C1 unit */}
          <filter id="c1-glow" x="-5%" y="-5%" width="110%" height="112%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation={c1Hovered ? '6' : '2.5'}
              floodColor={c1AccentColor}
              floodOpacity={c1Hovered ? '0.22' : '0.1'}
            />
          </filter>

          {/* Soft drop shadow for interactive C2 unit */}
          <filter id="c2-glow" x="-6%" y="-6%" width="112%" height="114%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation={c2Hovered ? '6' : '2.5'}
              floodColor={c2AccentColor}
              floodOpacity={c2Hovered ? '0.22' : '0.1'}
            />
          </filter>
        </defs>

        {/* ===================================================================
            1. LEFT + TOP-MIDDLE L-SHAPED TENANT UNIT: C1 (GREEN BORDER IN CAD)
               Full-visibility tenant unit with crisp architectural walls and
               embedded "🎥 ছবি এবং ভিডিও দেখুন ➔" CTA inside main Drawing & Dining.
           =================================================================== */}
        <g
          className={`bp-unit bp-unit--tenant ${c1Hovered ? 'bp-unit--hovered' : ''}`}
          filter="url(#c1-glow)"
          onClick={handleOpenC1}
          onMouseEnter={() => setC1Hovered(true)}
          onMouseLeave={() => setC1Hovered(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleOpenC1(e);
          }}
          aria-label="ইউনিট C1 — ভাড়াটিয়ার বড় ইউনিট, ছবি এবং ভিডিও দেখতে ক্লিক করুন"
        >
          {/* Base surface of Unit C1 */}
          <polygon points={c1PolygonPoints} fill={c1FillColor} />

          {/* --- TOP-LEFT: Far-Left Veranda (100..158, 60..128) & Bathroom (100..158, 128..212) --- */}
          <rect x="100" y="60" width="58" height="68" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="100" y="128" width="58" height="84" fill="#EDF2EE" stroke="#1F2421" strokeWidth="2" />

          {/* Top-Left Bedroom 1 (158..286, 60..212) */}
          <rect x="158" y="60" width="128" height="152" fill={c1FillColor} stroke="#1F2421" strokeWidth="2.2" />
          {/* Doors for Top-Left Bedroom 1 */}
          <rect x="155" y="98" width="6" height="24" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="155" y="176" width="6" height="28" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="230" y="209" width="46" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* --- TOP-LEFT-CENTER: Veranda (286..340, 60..104), Bathroom (340..432, 60..104) & Bedroom 2 (286..432, 104..212) --- */}
          <rect x="286" y="60" width="54" height="44" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="340" y="60" width="92" height="44" fill="#EDF2EE" stroke="#1F2421" strokeWidth="2" />
          <rect x="286" y="104" width="146" height="108" fill={c1FillColor} stroke="#1F2421" strokeWidth="2.2" />
          {/* Doors for Bedroom 2 */}
          <rect x="292" y="101" width="26" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="348" y="101" width="28" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          {/* Door on right wall (x=432) opening into Top-Center Drawing & Dining */}
          <rect x="429" y="144" width="6" height="38" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* --- MIDDLE-LEFT OUTER WALL: Common Toilet (100..185, 212..282) & Kitchen (100..185, 282..356) --- */}
          <rect x="100" y="212" width="85" height="70" fill="#EDF2EE" stroke="#1F2421" strokeWidth="2" />
          <rect x="182" y="222" width="6" height="34" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          <rect x="100" y="282" width="85" height="74" fill="#F4EFE6" stroke="#1F2421" strokeWidth="2" />
          {/* Open entry to middle-left Kitchen on x=185 (bottom part y=316..354) */}
          <line x1="185" y1="316" x2="185" y2="354" stroke={c1HallFill} strokeWidth="3.6" />

          {/* --- LOWER-LEFT MAIN HALL: Spacious Drawing & Dining (185..432, 212..356) --- */}
          <rect x="185" y="212" width="247" height="144" fill={c1HallFill} stroke="#1F2421" strokeWidth="2.2" />

          {/* --- BOTTOM-LEFT (East Road Side): Two Side-by-Side Bedrooms (y=356..500) + Two Verandas --- */}
          {/* Bottom-Far-Left Bedroom (100..266, 356..500) */}
          <rect x="100" y="356" width="166" height="144" fill={c1FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="210" y="353" width="46" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="114" y="500" width="138" height="45" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="198" y="497" width="36" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* Bottom-Mid-Left Bedroom (266..432, 356..500) */}
          <rect x="266" y="356" width="166" height="144" fill={c1FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="380" y="353" width="44" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="280" y="500" width="138" height="45" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="364" y="497" width="36" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* --- TOP-CENTER SECTION (Above Staircase: x=432..570, y=60..240) --- */}
          {/* Second Drawing & Dining Space (432..570, 110..240) */}
          <rect x="432" y="110" width="138" height="130" fill={c1HallFill} stroke="#1F2421" strokeWidth="2.2" />
          {/* Top-Center Left: Kitchen (432..502, 60..110) */}
          <rect x="432" y="60" width="70" height="50" fill="#F4EFE6" stroke="#1F2421" strokeWidth="2" />
          {/* Open doorway at bottom-left of top-center Kitchen (y=110, x=434..464) */}
          <line x1="434" y1="110" x2="464" y2="110" stroke={c1HallFill} strokeWidth="3.6" />

          {/* Top-Center Right: Common Toilet (502..570, 60..110) */}
          <rect x="502" y="60" width="68" height="50" fill="#EDF2EE" stroke="#1F2421" strokeWidth="2" />
          <rect x="536" y="107" width="28" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* --- TOP-RIGHT OF GREEN ZONE (Above C2's Drawing/Dining: x=570..735, y=60..204) --- */}
          {/* Bathroom (570..660, 60..118) */}
          <rect x="570" y="60" width="90" height="58" fill="#EDF2EE" stroke="#1F2421" strokeWidth="2" />
          {/* Veranda (660..735, 60..102) */}
          <rect x="660" y="60" width="75" height="42" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          {/* 4th Bedroom of C1 (570..735, 118/102..204) */}
          <path
            d="M 570,118 L 660,118 L 660,102 L 735,102 L 735,204 L 570,204 Z"
            fill={c1FillColor}
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          {/* Doors for 4th Bedroom */}
          <rect x="630" y="115" width="24" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="664" y="99" width="26" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="567" y="160" width="6" height="34" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* Outer Deep Leaf-Green Border of Tenant Unit C1 (Green border in CAD) */}
          <polygon
            points={c1PolygonPoints}
            fill="none"
            stroke={c1AccentColor}
            strokeWidth={c1Hovered ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* C1 Entry Doorways from Stairs (matching Green entry lines in CAD) */}
          <rect x="429" y="258" width="6" height="48" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.5" />
          <rect x="518" y="237" width="40" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.5" />

          {/* --- CRISP BANGLA ROOM LABELS INSIDE C1 --- */}
          <g fill="#1F2421" textAnchor="middle" className="bp-c1-labels">
            {/* Unit C1 Header Tag */}
            <rect x="166" y="68" width="96" height="25" rx="6" fill={c1AccentColor} />
            <text x="214" y="85" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট C1
            </text>

            {/* Far-Left Veranda & Bathroom */}
            <text x="129" y="94" transform="rotate(-90 129 94)" fontSize="11" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>
            <text x="129" y="170" transform="rotate(-90 129 170)" fontSize="11.5" fontWeight="700">বাথরুম</text>

            {/* Top-Left Bedroom 1 */}
            <text x="222" y="138" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ১</text>
            <text x="222" y="155" fontSize="10.5" fill="#5C5852" fontWeight="600">(দক্ষিণ-পশ্চিম)</text>

            {/* Top-Left-Center Veranda, Bathroom & Bedroom 2 */}
            <text x="313" y="86" fontSize="10.5" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>
            <text x="386" y="86" fontSize="11" fontWeight="700">বাথরুম</text>
            <text x="359" y="154" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ২</text>
            <text x="359" y="171" fontSize="10.5" fill="#5C5852" fontWeight="600">(পশ্চিম মুখী)</text>

            {/* Middle-Left Common Toilet & Kitchen */}
            <text x="142" y="244" fontSize="11.5" fontWeight="700">কমন</text>
            <text x="142" y="259" fontSize="11.5" fontWeight="700">টয়লেট</text>
            <text x="142" y="320" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">কিচেন</text>
            <text x="142" y="335" fontSize="10" fill="#5C5852" fontWeight="600">(রান্নাঘর)</text>

            {/* Lower-Left Main Drawing & Dining Heading */}
            <text x="308" y="252" fontSize="16" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং
            </text>

            {/* Bottom-Left Two Bedrooms & Two Verandas */}
            <text x="183" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৩</text>
            <text x="183" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(দক্ষিণ-পূর্ব কোণ)</text>
            <text x="183" y="527" fontSize="12" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>

            <text x="349" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৪</text>
            <text x="349" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(পূর্ব মুখী)</text>
            <text x="349" y="527" fontSize="12" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>

            {/* Top-Center Kitchen, Common Toilet & Second Drawing/Dining (Above Stairs) */}
            <text x="467" y="89" fontSize="12" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">কিচেন</text>
            <text x="536" y="82" fontSize="10.5" fontWeight="700">কমন</text>
            <text x="536" y="96" fontSize="10.5" fontWeight="700">টয়লেট</text>

            <text x="501" y="168" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং
            </text>
            <text x="501" y="185" fontSize="10" fill="#5C5852" fontWeight="600">
              (২য় অংশ)
            </text>

            {/* Top-Right of Green Zone: Bathroom, Veranda & Bedroom */}
            <text x="615" y="93" fontSize="11.5" fontWeight="700">বাথরুম</text>
            <text x="697" y="85" fontSize="11" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>
            <text x="652" y="158" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৫</text>
            <text x="652" y="175" fontSize="10.5" fill="#5C5852" fontWeight="600">(পশ্চিম মুখী)</text>
          </g>

          {/* --- EMBEDDED CTA BUTTON INSIDE C1 MAIN DRAWING & DINING ROOM --- */}
          <g
            className="bp-room-cta"
            transform="translate(308, 298)"
            onClick={handleOpenC1}
            onMouseEnter={() => setC1BtnHovered(true)}
            onMouseLeave={() => setC1BtnHovered(false)}
          >
            <rect x="-101" y="-19" width="206" height="42" rx="11" fill="#1F2421" />
            <rect
              x="-103"
              y="-22"
              width="206"
              height="42"
              rx="11"
              fill={c1BtnHovered ? '#21523C' : c1AccentColor}
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
            3. RIGHT UNIT: C2 (TENANT UNIT — RED BORDER IN CAD)
               Outlined in deep Terracotta (#C85A32) with the primary CTA button
               embedded right inside the center of Drawing & Dining Room.
           =================================================================== */}
        <g
          className={`bp-unit bp-unit--tenant ${c2Hovered ? 'bp-unit--hovered' : ''}`}
          filter="url(#c2-glow)"
          onClick={handleOpenC2}
          onMouseEnter={() => setC2Hovered(true)}
          onMouseLeave={() => setC2Hovered(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleOpenC2(e);
          }}
          aria-label="ইউনিট C2 — ছবি এবং ভিডিও দেখতে ক্লিক করুন"
        >
          {/* Base warm surface of Unit C2 */}
          <polygon points={c2PolygonPoints} fill={c2FillColor} />

          {/* --- ROOM 1: Top-Right Bedroom (735..848, 60..204) + Attached Veranda & Bathroom --- */}
          <rect x="735" y="60" width="113" height="144" fill={c2FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="848" y="60" width="52" height="62" fill={c2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="848" y="122" width="52" height="82" fill="#F2ECE1" stroke="#1F2421" strokeWidth="2" />
          <rect x="845" y="96" width="6" height="22" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="845" y="130" width="6" height="26" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="738" y="201" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* --- ROOM 2: Central Drawing & Dining Room (570..824, 204..356) --- */}
          <rect x="570" y="204" width="254" height="152" fill={c2HallFill} stroke="#1F2421" strokeWidth="2.2" />

          {/* --- ROOM 3: Kitchen (824..900, 204..286) & Common Toilet (824..900, 286..356) --- */}
          <rect x="824" y="204" width="76" height="82" fill="#F7EFE4" stroke="#1F2421" strokeWidth="2" />
          <line x1="824" y1="207" x2="824" y2="238" stroke={c2HallFill} strokeWidth="3.5" />

          <rect x="824" y="286" width="76" height="70" fill="#F2ECE1" stroke="#1F2421" strokeWidth="2" />
          <rect x="821" y="316" width="6" height="32" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* --- ROOM 4: Bottom-Left Bedroom of C2 (570..735, 356..500) + East Veranda --- */}
          <rect x="570" y="356" width="165" height="144" fill={c2FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="574" y="353" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="584" y="500" width="136" height="45" fill={c2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="602" y="497" width="38" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* --- ROOM 5: Bottom-Right Bedroom of C2 (735..900, 356..500) + East Veranda --- */}
          <rect x="735" y="356" width="165" height="144" fill={c2FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="738" y="353" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="748" y="500" width="136" height="45" fill={c2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="762" y="497" width="38" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* Outer Deep Terracotta Border of Tenant Unit C2 */}
          <polygon
            points={c2PolygonPoints}
            fill="none"
            stroke={c2AccentColor}
            strokeWidth={c2Hovered ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* C2 Entry Doorway on the Staircase Right Wall (x=570) */}
          <rect x="567" y="264" width="6" height="44" fill="#FFFDF9" stroke={c2AccentColor} strokeWidth="1.5" />

          {/* --- CRISP BANGLA ROOM LABELS INSIDE C2 --- */}
          <g fill="#1F2421" textAnchor="middle" className="bp-c2-labels">
            {/* Unit C2 Header Tag */}
            <rect x="744" y="68" width="94" height="25" rx="6" fill={c2AccentColor} />
            <text x="791" y="85" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট C2
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

            {/* Bottom-Left Bedroom of C2 (Bedroom 1) + Veranda */}
            <text x="652" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ১</text>
            <text x="652" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(পূর্ব মুখী)</text>
            <text x="652" y="527" fontSize="12" fontWeight="700" fill="#2D6A4F">বারান্দা</text>

            {/* Bottom-Right Bedroom of C2 (Bedroom 2) + Veranda */}
            <text x="818" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ২</text>
            <text x="818" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(উত্তর-পূর্ব কোণ)</text>
            <text x="816" y="527" fontSize="12" fontWeight="700" fill="#2D6A4F">বারান্দা</text>
          </g>

          {/* --- EMBEDDED CTA BUTTON INSIDE C2 DRAWING & DINING ROOM CENTER --- */}
          <g
            className="bp-room-cta"
            transform="translate(697, 294)"
            onClick={handleOpenC2}
            onMouseEnter={() => setC2BtnHovered(true)}
            onMouseLeave={() => setC2BtnHovered(false)}
          >
            <rect x="-101" y="-19" width="206" height="42" rx="11" fill="#1F2421" />
            <rect
              x="-103"
              y="-22"
              width="206"
              height="42"
              rx="11"
              fill={c2BtnHovered ? '#B34B25' : c2AccentColor}
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
