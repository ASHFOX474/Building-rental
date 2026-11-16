import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTaka, monthBn } from '../../lib/bangla.js';

/**
 * Exact architectural floorplate for Row B (2nd Floor / ২য় তলা: Units B1 & B2)
 * reconstructed directly from the building's AutoCAD blueprint.
 *
 * Orientation:
 *   TOP    = West  (পশ্চিম — আমাদের নিজস্ব খালি জায়গা)
 *   BOTTOM = East  (পূর্ব — সামনের রাস্তা)
 *   RIGHT  = North (উত্তর — উত্তর পাশের রাস্তা ও খোলা প্লট)
 *   LEFT   = South (দক্ষিণ — দক্ষিণা বাতাস)
 *
 * Unit B1 (Left + Top-Center-Right L-shape): Owner's residence (বাড়িওয়ালা)
 * Unit B2 (Right + Bottom-Right): Tenant unit (ভাড়াটিয়ার ইউনিট)
 */
export default function FloorBBlueprint({ floor, selectedUnitId, demoToLet }) {
  const navigate = useNavigate();
  const [b2Hovered, setB2Hovered] = useState(false);
  const [cardMinimized, setCardMinimized] = useState(false);

  const unitB1 = floor.units.find((u) => u.id === 'B1') || { id: 'B1', status: 'owner' };
  const rawB2 = floor.units.find((u) => u.id === 'B2') || {
    id: 'B2',
    status: 'occupied',
    rent: 10500,
    availableFrom: 'june',
  };

  const isToLet = demoToLet || rawB2.status === 'available';
  const b2AccentColor = isToLet ? '#2D6A4F' : '#C85A32';
  const b2FillColor = isToLet ? '#F3FAF5' : '#FFFDF9';
  const b2VerandaFill = isToLet ? '#E2F2E8' : '#F6ECE3';

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
        viewBox="65 30 870 545"
        role="img"
        aria-label="২য় তলার (ফ্লোর B) স্থাপত্য ফ্লোর ম্যাপ: বাম পাশে ইউনিট B1 (বাড়িওয়ালা) এবং ডান পাশে ইউনিট B2 (ভাড়াটিয়ার ইউনিট)"
      >
        <defs>
          {/* Subtle architectural grid pattern for blueprint canvas */}
          <pattern id="bp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgba(31, 36, 33, 0.055)"
              strokeWidth="0.8"
            />
          </pattern>

          {/* Subtle diagonal hatch for Owner Unit B1 */}
          <pattern id="owner-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(31, 36, 33, 0.06)" strokeWidth="2" />
          </pattern>

          {/* Soft drop shadow for interactive B2 unit */}
          <filter id="b2-glow" x="-6%" y="-6%" width="112%" height="114%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation={b2Hovered || selectedUnitId === 'B2' ? '7' : '3'}
              floodColor={b2AccentColor}
              floodOpacity={b2Hovered || selectedUnitId === 'B2' ? '0.28' : '0.14'}
            />
          </filter>
        </defs>

        {/* Blueprint grid background */}
        <rect x="65" y="30" width="870" height="545" fill="url(#bp-grid)" rx="14" />

        {/* ===================================================================
            1. LEFT L-SHAPED UNIT: B1 (OWNER'S UNIT / বাড়িওয়ালা)
               Rendered with muted sand fill (#EAE3D5) and faint watermark
               internal walls & labels (opacity: 0.34) per specification.
           =================================================================== */}
        <g className="bp-unit bp-unit--owner" aria-label="ইউনিট B1 — বাড়িওয়ালা (মালিকের নিজস্ব বাসভবন)">
          {/* Base Sand Fill + Subtle Hatch */}
          <polygon points={b1PolygonPoints} fill="#EAE3D5" />
          <polygon points={b1PolygonPoints} fill="url(#owner-hatch)" />

          {/* Internal Room Walls & Labels of B1 (faint watermark opacity) */}
          <g className="bp-b1-internals" opacity="0.33" stroke="#1F2421" fill="none">
            {/* Far-Left Top Veranda (100..158, 60..128) & Bathroom (100..158, 128..212) */}
            <rect x="100" y="60" width="58" height="68" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="100" y="128" width="58" height="84" fill="#E5DECFE0" strokeWidth="1.6" />
            {/* Door ticks on x=158 */}
            <rect x="155" y="102" width="6" height="22" fill="#EAE3D5" strokeWidth="1" />
            <rect x="155" y="182" width="6" height="24" fill="#EAE3D5" strokeWidth="1" />

            {/* Top-Left Bedroom (158..286, 60..212) with angled bottom-right doorway */}
            <path
              d="M 158,60 L 286,60 L 286,188 L 225,212 L 158,212 Z"
              strokeWidth="1.8"
            />
            {/* Chamfered door double-line (225,212 -> 286,188) */}
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
            {/* Bathroom (570..660, 60..118) */}
            <rect x="570" y="60" width="90" height="58" fill="#E5DECF" strokeWidth="1.6" />
            <rect x="632" y="115" width="22" height="5" fill="#EAE3D5" strokeWidth="1" />
            {/* Veranda (660..735, 60..102) */}
            <rect x="660" y="60" width="75" height="42" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="662" y="99" width="24" height="5" fill="#EAE3D5" strokeWidth="1" />
            {/* 4th Bedroom (570..735, 118/102..204) */}
            <path d="M 570,118 L 660,118 L 660,102 L 735,102 L 735,204 L 570,204 Z" strokeWidth="1.8" />
            {/* Door on left wall of 4th bedroom (x=570) */}
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

              <text x="316" y="278" fontSize="15" fontWeight="700">ড্রয়িং ও ডাইনিং</text>

              <text x="183" y="434" fontSize="13.5" fontWeight="700">বেডরুম</text>
              <text x="183" y="527" fontSize="11.5" fontWeight="600">বারান্দা</text>
              <text x="349" y="527" fontSize="11.5" fontWeight="600">বারান্দা</text>
            </g>
          </g>

          {/* Outer L-Shaped Border of B1 */}
          <polygon
            points={b1PolygonPoints}
            fill="none"
            stroke="#6E675F"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* B1 Entry Doorways from Stairs (matching blue entry lines in CAD) */}
          <line x1="432" y1="258" x2="432" y2="306" stroke="#8C857B" strokeWidth="4" strokeDasharray="5 4" />
          <line x1="518" y1="240" x2="558" y2="240" stroke="#8C857B" strokeWidth="4" strokeDasharray="5 4" />

          {/* Prominent Warm Centered Overlay Badge on B1 */}
          <g className="bp-owner-badge" transform="translate(308, 326)">
            <rect
              x="-126"
              y="-38"
              width="252"
              height="76"
              rx="16"
              fill="#FAF7F2"
              stroke="#1F2421"
              strokeWidth="2.2"
            />
            <rect
              x="-120"
              y="-32"
              width="240"
              height="64"
              rx="12"
              fill="#F0EBE1"
              stroke="#8C857B"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text x="0" y="-4" textAnchor="middle" fill="#1F2421" fontSize="18" fontWeight="700" fontFamily="var(--font-heading)">
              🏠 {unitB1.ownerLabelBn || 'ইউনিট B1 — বাড়িওয়ালা'}
            </text>
            <text x="0" y="18" textAnchor="middle" fill="#5C5852" fontSize="13" fontWeight="600">
              {unitB1.ownerSubtextBn || '(মালিকের নিজস্ব বাসভবন)'}
            </text>
          </g>
        </g>

        {/* ===================================================================
            2. CENTRAL STAIRCASE (সিঁড়ি / STAIRS: x=432..570, y=240..356)
           =================================================================== */}
        <g className="bp-stairs" aria-label="কেন্দ্রীয় সিঁড়ি ঘর (Staircase)">
          {/* Stairwell box */}
          <rect
            x="432"
            y="240"
            width="138"
            height="116"
            fill="#F5F0E6"
            stroke="#1F2421"
            strokeWidth="2.4"
          />

          {/* Landing strip at top of stairs (y=240..268) */}
          <line x1="432" y1="268" x2="570" y2="268" stroke="#1F2421" strokeWidth="1.4" />

          {/* Two flights of steps with central handrail (x=501) */}
          <line x1="501" y1="268" x2="501" y2="338" stroke="#1F2421" strokeWidth="1.6" />
          {[278, 288, 298, 308, 318, 328, 338].map((yPos) => (
            <line
              key={yPos}
              x1="438"
              y1={yPos}
              x2="564"
              y2={yPos}
              stroke="#5C5852"
              strokeWidth="1.1"
            />
          ))}

          {/* Up/Down direction arrow on stairs */}
          <path d="M 468,332 L 468,276 L 463,283 M 468,276 L 473,283" fill="none" stroke="#C85A32" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 534,276 L 534,332 L 529,325 M 534,332 L 539,325" fill="none" stroke="#5C5852" strokeWidth="1.4" strokeLinecap="round" />

          {/* Stair label pill */}
          <rect x="455" y="290" width="92" height="28" rx="7" fill="#FAF7F2" stroke="#1F2421" strokeWidth="1.5" />
          <text x="501" y="309" textAnchor="middle" fill="#1F2421" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)">
            সিঁড়ি (Stairs)
          </text>

          {/* Open setback / air shaft below stairs (x=432..570, y=356..500) */}
          <rect
            x="432"
            y="356"
            width="138"
            height="144"
            fill="rgba(250, 247, 242, 0.65)"
            stroke="#8C857B"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text x="501" y="424" textAnchor="middle" fill="#8C857B" fontSize="11.5" fontWeight="600">
            খোলা স্পেস / আলো-বাতাস
          </text>
        </g>

        {/* ===================================================================
            3. RIGHT UNIT: B2 (TENANT UNIT / ভাড়াটিয়ার ইউনিট)
               Interactive floorplate matching the Red Border in AutoCAD.
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
          aria-label={`ইউনিট B2 — ৩টি বেডরুম, ড্রয়িং-ডাইনিং, ২টি বাথরুম, ৩টি বারান্দা, কিচেন। ছবি এবং ভিডিও দেখতে ক্লিক করুন`}
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
          {/* Top-Right Veranda (848..900, 60..122) */}
          <rect
            x="848"
            y="60"
            width="52"
            height="62"
            fill={b2VerandaFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          {/* Top-Right Attached Bathroom (848..900, 122..204) */}
          <rect
            x="848"
            y="122"
            width="52"
            height="82"
            fill="#F2ECE1"
            stroke="#1F2421"
            strokeWidth="2"
          />
          {/* Doors for Top-Right Bedroom, Veranda & Bathroom (exact CAD positions) */}
          {/* Door between Bedroom and Veranda on x=848 */}
          <rect x="845" y="96" width="6" height="22" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          {/* Door between Bedroom and Bathroom on x=848 */}
          <rect x="845" y="130" width="6" height="26" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          {/* Door between Top-Right Bedroom and Drawing/Dining on y=204 */}
          <rect x="738" y="201" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* --- ROOM 2: Central Drawing & Dining Room (570..824, 204..356) --- */}
          <rect
            x="570"
            y="204"
            width="254"
            height="152"
            fill={isToLet ? '#ECF8F0' : '#FAF5EC'}
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
          {/* Open doorway into Kitchen on x=824 (top part y=206..238) */}
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
          {/* Door into Common Toilet on x=824 */}
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
          {/* Door from Drawing/Dining on y=356 */}
          <rect x="574" y="353" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          {/* Protruding East Veranda 1 (584..720, 500..545) */}
          <rect
            x="584"
            y="500"
            width="136"
            height="45"
            fill={b2VerandaFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          {/* Door to Veranda 1 on y=500 */}
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
          {/* Door from Drawing/Dining on y=356 */}
          <rect x="738" y="353" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          {/* Protruding East Veranda 2 (748..884, 500..545) */}
          <rect
            x="748"
            y="500"
            width="136"
            height="45"
            fill={b2VerandaFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          {/* Door to Veranda 2 on y=500 */}
          <rect x="762" y="497" width="38" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* Subtle CAD ceiling-fan / fixture crosshair inside Bottom-Right Bedroom (matching CAD image) */}
          <g stroke="rgba(31, 36, 33, 0.25)" strokeWidth="1.1" fill="none">
            <line x1="772" y1="362" x2="772" y2="442" />
            <line x1="730" y1="396" x2="814" y2="396" />
            <rect x="768" y="392" width="8" height="8" fill={b2FillColor} stroke="rgba(31, 36, 33, 0.35)" />
          </g>

          {/* Outer Highlight Border of Tenant Unit B2 (Red border in CAD -> Terracotta / Leaf Green) */}
          <polygon
            points={b2PolygonPoints}
            fill="none"
            stroke={b2AccentColor}
            strokeWidth={b2Hovered ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* 3 Blue Square Entry Pillars on the Staircase Entry Wall (x=570, matching CAD image) */}
          <g fill="#2B5B84" stroke="#1F2421" strokeWidth="1.2">
            <rect x="565" y="242" width="10" height="10" rx="1.5" />
            <rect x="565" y="294" width="10" height="10" rx="1.5" />
            <rect x="565" y="344" width="10" height="10" rx="1.5" />
          </g>
          {/* Entry arrow from Stairs into B2 Drawing & Dining */}
          <g className="bp-entry-indicator">
            <path
              d="M 552,272 L 592,272"
              stroke="#C85A32"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <polygon points="596,272 586,267 586,277" fill="#C85A32" />
            <text x="600" y="276" fill="#C85A32" fontSize="10.5" fontWeight="700">
              প্রবেশপথ
            </text>
          </g>

          {/* --- CRISP BANGLA ROOM LABELS INSIDE B2 --- */}
          <g fill="#1F2421" textAnchor="middle" className="bp-b2-labels">
            {/* Top-Right Bedroom */}
            <text x="791" y="128" fontSize="14.5" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৩</text>
            <text x="791" y="145" fontSize="10.5" fill="#5C5852" fontWeight="600">(উত্তর-পশ্চিম কোণ)</text>

            {/* Top-Right Veranda & Attached Bathroom (vertical labels like CAD) */}
            <text x="874" y="91" transform="rotate(-90 874 91)" fontSize="11" fontWeight="700" fill="#2D6A4F">বারান্দা</text>
            <text x="874" y="163" transform="rotate(-90 874 163)" fontSize="11.5" fontWeight="700">বাথরুম</text>

            {/* Central Drawing & Dining Room */}
            <text x="697" y="256" fontSize="16" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং রুম
            </text>
            <text x="697" y="274" fontSize="11" fill="#5C5852" fontWeight="600">
              (প্রশস্ত মূল কক্ষ)
            </text>

            {/* Kitchen & Common Toilet */}
            <text x="862" y="246" fontSize="13" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">কিচেন</text>
            <text x="862" y="261" fontSize="9.5" fill="#5C5852" fontWeight="600">(রান্নাঘর)</text>

            <text x="862" y="317" fontSize="11.5" fontWeight="700">কমন</text>
            <text x="862" y="332" fontSize="11.5" fontWeight="700">টয়লেট</text>

            {/* Bottom-Left Bedroom of B2 (Bedroom 1) + Veranda */}
            <text x="652" y="426" fontSize="14.5" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ১</text>
            <text x="652" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(পূর্ব মুখী)</text>
            <text x="652" y="527" fontSize="12" fontWeight="700" fill="#2D6A4F">বারান্দা</text>

            {/* Bottom-Right Bedroom of B2 (Bedroom 2) + Veranda */}
            <text x="818" y="426" fontSize="14.5" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ২</text>
            <text x="818" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(উত্তর-পূর্ব কোণ)</text>
            <text x="816" y="527" fontSize="12" fontWeight="700" fill="#2D6A4F">বারান্দা</text>
          </g>

          {/* Unit B2 Corner Header Tag inside the Blueprint */}
          <g transform="translate(744, 68)">
            <rect
              x="0"
              y="0"
              width="94"
              height="26"
              rx="6"
              fill={b2AccentColor}
            />
            <text x="47" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট B2 ➔
            </text>
          </g>
        </g>
      </svg>

      {/* =====================================================================
          PINNED / FLOATING INTERACTIVE CALLOUT CARD FOR UNIT B2
          Positioned so it never hides the room geometry of B2, with a 1-tap
          minimize/expand toggle for unobstructed blueprint inspection.
         ===================================================================== */}
      <div
        className={`b2-callout-card ${isToLet ? 'b2-callout-card--tolet' : ''} ${
          cardMinimized ? 'b2-callout-card--minimized' : ''
        }`}
      >
        <div className="b2-callout-card__top">
          <div className="b2-callout-card__title-group">
            <span className="b2-callout-card__unit">ইউনিট {rawB2.id}</span>
            {isToLet ? (
              <span className="b2-status-badge b2-status-badge--available">
                🟢 ভাড়া হবে ({monthBn(rawB2.availableFrom)} হতে) — {formatTaka(rawB2.rent)}/মাস
              </span>
            ) : (
              <span className="b2-status-badge b2-status-badge--occupied">
                ⚪ ভাড়া হয়ে গেছে ({formatTaka(rawB2.rent)}/মাস)
              </span>
            )}
          </div>

          <button
            type="button"
            className="b2-callout-card__minimize"
            onClick={() => setCardMinimized((v) => !v)}
            aria-expanded={!cardMinimized}
          >
            {cardMinimized ? '🔼 তথ্য কার্ড দেখুন' : '👁️ শুধু নকশা দেখুন'}
          </button>
        </div>

        {!cardMinimized && (
          <div className="b2-callout-card__body">
            <p className="b2-callout-card__specs">
              <strong>এক নজরে রুম তথ্য:</strong>{' '}
              {rawB2.roomsSummaryBn ||
                '৩টি বেডরুম • ড্রয়িং-ডাইনিং • ২টি বাথরুম • ৩টি বারান্দা • কিচেন'}
            </p>
            <p className="b2-callout-card__facing">
              <strong>দিক ও সুবিধা:</strong>{' '}
              {rawB2.facingBn || 'উত্তর-পূর্ব মুখী (দুই দিকেই রাস্তা ও খোলা জায়গা)'}
            </p>

            <div className="b2-callout-card__actions">
              <button
                type="button"
                className="b2-cta-btn"
                onClick={handleOpenMedia}
              >
                📸 ছবি এবং ভিডিও দেখুন ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
