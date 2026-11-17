import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isUnitAvailable,
  useOccupiedPopup,
  AvailableStatusBadgeSvg,
  RoomStatusActionSvg,
  OccupiedUnitPopover,
} from './UnitStatusElements.jsx';

/**
 * Reusable 3-Unit Architectural Floorplate for:
 *   - Row D (4th Floor / ৪র্থ তলা: Units D1, D2, D3)
 *   - Row E (5th Floor / ৫ম তলা: Units E1, E2, E3)
 *
 * Dynamically applies Availability (`ভাড়া হবে`) vs. Occupied Privacy (`ভাড়া হয়ে গেছে`)
 * per unit from the central building data store.
 */
export default function FloorDEBlueprint({ floor }) {
  const navigate = useNavigate();
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const { activePopupUnitId, setHoveredId, triggerTapPopup } = useOccupiedPopup();

  const prefix = floor.id || 'D';
  const unit1Id = `${prefix}1`;
  const unit2Id = `${prefix}2`;
  const unit3Id = `${prefix}3`;

  const unit1 = floor.units.find((u) => u.id === unit1Id) || { id: unit1Id, status: 'occupied' };
  const unit2 = floor.units.find((u) => u.id === unit2Id) || { id: unit2Id, status: 'occupied' };
  const unit3 = floor.units.find((u) => u.id === unit3Id) || { id: unit3Id, status: 'occupied' };

  const u1Available = isUnitAvailable(unit1);
  const u2Available = isUnitAvailable(unit2);
  const u3Available = isUnitAvailable(unit3);

  // Unit 1 (Left — Green in CAD)
  const u1Accent = '#2D6A4F';
  const u1Fill = u1Available ? '#FBFDFB' : '#F3EFE6';
  const u1HallFill = u1Available ? '#EFF7F1' : '#EAE4D7';
  const u1VerandaFill = u1Available ? '#E2F1E7' : '#E3DDD0';
  const u1BathFill = u1Available ? '#EDF2EE' : '#E6E0D3';

  // Unit 2 (Middle — Yellow/Ochre in CAD)
  const u2Accent = '#C67D0A';
  const u2Stroke = '#B45309';
  const u2Fill = u2Available ? '#FFFDF7' : '#F3EFE6';
  const u2HallFill = u2Available ? '#FEF7E6' : '#EAE4D7';
  const u2VerandaFill = u2Available ? '#F9EBC8' : '#E3DDD0';
  const u2BathFill = u2Available ? '#F3ECE0' : '#E6E0D3';

  // Unit 3 (Right — Red/Terracotta in CAD)
  const u3Accent = '#C85A32';
  const u3Fill = u3Available ? '#FFFDF9' : '#F3EFE6';
  const u3HallFill = u3Available ? '#FAF5EC' : '#EAE4D7';
  const u3VerandaFill = u3Available ? '#F6ECE3' : '#E3DDD0';
  const u3BathFill = u3Available ? '#F2ECE1' : '#E6E0D3';

  const handleUnitClick = (unit, available, e) => {
    if (available) {
      if (e) e.stopPropagation();
      navigate(`/flat/${unit.id}`);
    } else {
      triggerTapPopup(unit.id, e);
    }
  };

  const handleUnitEnter = (unit, available) => {
    setHoveredUnit(unit.id);
    if (!available) setHoveredId(unit.id);
  };

  const handleUnitLeave = (unit, available) => {
    setHoveredUnit(null);
    if (!available) setHoveredId(null);
  };

  // Popover anchor positions (in % of the SVG stage) for each of the 3 units
  const POPOVER_POSITIONS = {
    [unit1Id]: { left: '28%', top: '53%' },
    [unit2Id]: { left: '50%', top: '26%' },
    [unit3Id]: { left: '73%', top: '53%' },
  };

  // 1. Exact outer polygon for Left Unit (D1 / E1 — Green border in CAD)
  const u1PolygonPoints = [
    '100,60',
    '286,60',
    '286,204',
    '432,204',
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

  // 2. Exact outer polygon for Middle Unit (D2 / E2 — Yellow border in CAD)
  const u2PolygonPoints = [
    '286,60',
    '735,60',
    '735,204',
    '570,204',
    '570,240',
    '432,240',
    '432,204',
    '286,204',
  ].join(' ');

  // 3. Exact outer polygon for Right Unit (D3 / E3 — Red border in CAD)
  const u3PolygonPoints = [
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
        aria-label={`${floor.nameBn} (ফ্লোর ${prefix}) স্থাপত্য ফ্লোর ম্যাপ: বাম পাশে ইউনিট ${unit1Id}, মাঝখানে ইউনিট ${unit2Id}, এবং ডান পাশে ইউনিট ${unit3Id}`}
      >
        <defs>
          <filter id="u1-glow" x="-6%" y="-6%" width="112%" height="114%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation={hoveredUnit === unit1Id ? '6' : '2.5'}
              floodColor={u1Accent}
              floodOpacity={hoveredUnit === unit1Id ? '0.24' : '0.1'}
            />
          </filter>

          <filter id="u2-glow" x="-6%" y="-6%" width="112%" height="114%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation={hoveredUnit === unit2Id ? '6' : '2.5'}
              floodColor={u2Stroke}
              floodOpacity={hoveredUnit === unit2Id ? '0.26' : '0.12'}
            />
          </filter>

          <filter id="u3-glow" x="-6%" y="-6%" width="112%" height="114%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation={hoveredUnit === unit3Id ? '6' : '2.5'}
              floodColor={u3Accent}
              floodOpacity={hoveredUnit === unit3Id ? '0.24' : '0.1'}
            />
          </filter>
        </defs>

        {/* ===================================================================
            1. LEFT UNIT: D1 / E1 (GREEN BORDER IN CAD — 3 BEDROOMS)
           =================================================================== */}
        <g
          className={`bp-unit ${u1Available ? 'bp-unit--available' : 'bp-unit--occupied'} ${
            hoveredUnit === unit1Id ? 'bp-unit--hovered' : ''
          }`}
          filter="url(#u1-glow)"
          onClick={(e) => handleUnitClick(unit1, u1Available, e)}
          onMouseEnter={() => handleUnitEnter(unit1, u1Available)}
          onMouseLeave={() => handleUnitLeave(unit1, u1Available)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleUnitClick(unit1, u1Available, e);
          }}
          aria-label={
            u1Available
              ? `ইউনিট ${unit1Id} — ভাড়া হবে, ছবি এবং ভিডিও দেখতে ক্লিক করুন`
              : `ইউনিট ${unit1Id} — বর্তমানে ভাড়া হয়ে গেছে`
          }
        >
          {/* Base surface of Unit 1 */}
          <polygon points={u1PolygonPoints} fill={u1Fill} />

          {/* Main Drawing & Dining Hall Fill (185..432, 204..356) */}
          <rect x="185" y="204" width="247" height="152" fill={u1HallFill} stroke="none" />
          <path
            d="M 185,204 L 432,204 L 432,356 L 185,356"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2.2"
          />

          {/* Top-Left: Veranda (100..158, 60..126) & Bathroom (100..158, 126..204) */}
          <rect x="100" y="60" width="58" height="66" fill={u1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="100" y="126" width="58" height="78" fill={u1BathFill} stroke="#1F2421" strokeWidth="2" />

          {/* Top-Left Bedroom 3 (158..286, 60..204) */}
          <rect x="158" y="60" width="128" height="144" fill={u1Fill} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="155" y="96" width="6" height="24" fill="#FFFFFF" stroke={u1Accent} strokeWidth="1.3" />
          <rect x="155" y="168" width="6" height="28" fill="#FFFFFF" stroke={u1Accent} strokeWidth="1.3" />
          <rect x="230" y="201" width="46" height="6" fill="#FFFFFF" stroke={u1Accent} strokeWidth="1.3" />

          {/* Middle-Left Outer Wall: Common Toilet (100..185, 204..278) & Kitchen (100..185, 278..356) */}
          <rect x="100" y="204" width="85" height="74" fill={u1BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="182" y="218" width="6" height="34" fill="#FFFFFF" stroke={u1Accent} strokeWidth="1.3" />

          {/* Leftmost Kitchen with open entry path at bottom-right (x=185, y=322..356) */}
          <rect x="100" y="278" width="85" height="78" fill={u1Available ? '#F4EFE6' : '#E8E2D5'} stroke="none" />
          <path
            d="M 100,278 L 185,278 L 185,322 M 185,356 L 100,356 L 100,278"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2.2"
            strokeLinecap="square"
          />

          {/* Bottom-Left: Two Side-by-Side Bedrooms (y=356..500) + Two Protruding Verandas */}
          <rect x="100" y="356" width="166" height="144" fill={u1Fill} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="210" y="353" width="46" height="6" fill="#FFFFFF" stroke={u1Accent} strokeWidth="1.3" />
          <rect x="114" y="500" width="138" height="45" fill={u1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="198" y="497" width="36" height="6" fill="#FFFFFF" stroke={u1Accent} strokeWidth="1.3" />

          <rect x="266" y="356" width="166" height="144" fill={u1Fill} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="380" y="353" width="44" height="6" fill="#FFFFFF" stroke={u1Accent} strokeWidth="1.3" />
          <rect x="280" y="500" width="138" height="45" fill={u1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="364" y="497" width="36" height="6" fill="#FFFFFF" stroke={u1Accent} strokeWidth="1.3" />

          {/* Outer Deep Leaf-Green Border of Unit D1 / E1 */}
          <polygon
            points={u1PolygonPoints}
            fill="none"
            stroke={u1Accent}
            strokeWidth={hoveredUnit === unit1Id ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* Entry Doorway from Stairs (x=432) */}
          <rect x="429" y="258" width="6" height="48" fill="#FFFFFF" stroke={u1Accent} strokeWidth="1.5" />

          {/* Labels inside Left Unit (D1 / E1) */}
          <g fill="#1F2421" textAnchor="middle" className="bp-u1-labels">
            <rect x="166" y="68" width="96" height="25" rx="6" fill={u1Accent} />
            <text x="214" y="85" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট {unit1Id}
            </text>

            <text x="129" y="93" transform="rotate(-90 129 93)" fontSize="11" fontWeight="700" fill={u1Accent}>বারান্দা</text>
            <text x="129" y="165" transform="rotate(-90 129 165)" fontSize="11.5" fontWeight="700">বাথরুম</text>

            <text x="222" y="134" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৩</text>
            <text x="222" y="151" fontSize="10.5" fill="#5C5852" fontWeight="600">(দক্ষিণ-পশ্চিম কোণ)</text>

            <text x="142" y="238" fontSize="11.5" fontWeight="700">কমন</text>
            <text x="142" y="253" fontSize="11.5" fontWeight="700">টয়লেট</text>
            <text x="142" y="316" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">কিচেন</text>
            <text x="142" y="331" fontSize="10" fill="#5C5852" fontWeight="600">(রান্নাঘর)</text>

            <text x="308" y={u1Available ? '262' : '256'} fontSize="16" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং
            </text>

            <text x="183" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ১</text>
            <text x="183" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(দক্ষিণ-পূর্ব কোণ)</text>
            <text x="183" y="527" fontSize="12" fontWeight="700" fill={u1Accent}>বারান্দা</text>

            <text x="349" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ২</text>
            <text x="349" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(পূর্ব মুখী)</text>
            <text x="349" y="527" fontSize="12" fontWeight="700" fill={u1Accent}>বারান্দা</text>
          </g>

          {/* Prominent "🟢 ভাড়া হবে" Badge when Unit 1 is Available */}
          {u1Available && (
            <AvailableStatusBadgeSvg
              x={308}
              y={226}
              availableFrom={unit1.availableFrom}
            />
          )}

          {/* Dynamic Room Action: CTA Button if Available, "🔒 ভাড়া হয়ে গেছে" if Occupied */}
          <RoomStatusActionSvg
            x={308}
            y={306}
            isAvailable={u1Available}
            accentColor={u1Accent}
            hoverColor="#21523C"
            isBtnHovered={hoveredBtn === unit1Id}
            onMouseEnterBtn={() => setHoveredBtn(unit1Id)}
            onMouseLeaveBtn={() => setHoveredBtn(null)}
            onOpenMedia={(e) => handleUnitClick(unit1, true, e)}
          />
        </g>

        {/* ===================================================================
            2. MIDDLE UNIT: D2 / E2 (YELLOW BORDER IN CAD — 2 BEDROOMS)
           =================================================================== */}
        <g
          className={`bp-unit ${u2Available ? 'bp-unit--available' : 'bp-unit--occupied'} ${
            hoveredUnit === unit2Id ? 'bp-unit--hovered' : ''
          }`}
          filter="url(#u2-glow)"
          onClick={(e) => handleUnitClick(unit2, u2Available, e)}
          onMouseEnter={() => handleUnitEnter(unit2, u2Available)}
          onMouseLeave={() => handleUnitLeave(unit2, u2Available)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleUnitClick(unit2, u2Available, e);
          }}
          aria-label={
            u2Available
              ? `ইউনিট ${unit2Id} — ভাড়া হবে, ছবি এবং ভিডিও দেখতে ক্লিক করুন`
              : `ইউনিট ${unit2Id} — বর্তমানে ভাড়া হয়ে গেছে`
          }
        >
          {/* Base surface of Middle Unit (D2 / E2) */}
          <polygon points={u2PolygonPoints} fill={u2Fill} />

          {/* Central Drawing & Dining Space of Middle Unit (432..570, 110..240) */}
          <rect x="432" y="110" width="138" height="130" fill={u2HallFill} stroke="#1F2421" strokeWidth="2.2" />

          {/* Top-Center Edge: Kitchen (432..502, 60..110) with open path at bottom-left & Common Toilet (502..570, 60..110) */}
          <rect x="432" y="60" width="70" height="50" fill={u2Available ? '#F7EFE2' : '#E8E2D5'} stroke="none" />
          <path
            d="M 432,110 L 432,60 L 502,60 L 502,110 L 464,110"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2"
            strokeLinecap="square"
          />
          <rect x="502" y="60" width="68" height="50" fill={u2BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="536" y="107" width="28" height="6" fill="#FFFFFF" stroke={u2Stroke} strokeWidth="1.3" />

          {/* Left Wing of Middle Unit: Veranda (286..340, 60..104), Bathroom (340..432, 60..104) & Bedroom 1 (286..432, 104..204) */}
          <rect x="286" y="60" width="54" height="44" fill={u2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="340" y="60" width="92" height="44" fill={u2BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="286" y="104" width="146" height="100" fill={u2Fill} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="292" y="101" width="26" height="6" fill="#FFFFFF" stroke={u2Stroke} strokeWidth="1.3" />
          <rect x="348" y="101" width="28" height="6" fill="#FFFFFF" stroke={u2Stroke} strokeWidth="1.3" />
          <rect x="429" y="140" width="6" height="38" fill="#FFFFFF" stroke={u2Stroke} strokeWidth="1.3" />

          {/* Right Wing of Middle Unit: Bathroom (570..660, 60..118), Veranda (660..735, 60..102) & Bedroom 2 (570..735, 118/102..204) */}
          <rect x="570" y="60" width="90" height="58" fill={u2BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="660" y="60" width="75" height="42" fill={u2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <path
            d="M 570,118 L 660,118 L 660,102 L 735,102 L 735,204 L 570,204 Z"
            fill={u2Fill}
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          <rect x="630" y="115" width="24" height="6" fill="#FFFFFF" stroke={u2Stroke} strokeWidth="1.3" />
          <rect x="664" y="99" width="26" height="6" fill="#FFFFFF" stroke={u2Stroke} strokeWidth="1.3" />
          <rect x="567" y="160" width="6" height="34" fill="#FFFFFF" stroke={u2Stroke} strokeWidth="1.3" />

          {/* Outer Golden Ochre / Amber Border of Middle Unit (Yellow border in CAD) */}
          <polygon
            points={u2PolygonPoints}
            fill="none"
            stroke={u2Accent}
            strokeWidth={hoveredUnit === unit2Id ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* Entry Doorway at bottom of Middle Unit from Stairs (y=240) */}
          <rect x="518" y="237" width="40" height="6" fill="#FFFFFF" stroke={u2Stroke} strokeWidth="1.5" />

          {/* Labels inside Middle Unit (D2 / E2) */}
          <g fill="#1F2421" textAnchor="middle" className="bp-u2-labels">
            <text x="313" y="86" fontSize="10.5" fontWeight="700" fill={u2Stroke}>বারান্দা</text>
            <text x="386" y="86" fontSize="11" fontWeight="700">বাথরুম</text>
            <text x="359" y="148" fontSize="14.5" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ১</text>
            <text x="359" y="165" fontSize="10.5" fill="#5C5852" fontWeight="600">(পশ্চিম মুখী)</text>

            <text x="467" y="89" fontSize="12" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">কিচেন</text>
            <text x="536" y="82" fontSize="10.5" fontWeight="700">কমন</text>
            <text x="536" y="96" fontSize="10.5" fontWeight="700">টয়লেট</text>

            {/* Unit D2 / E2 Badge + Drawing & Dining Label */}
            <rect x="457" y="116" width="88" height="22" rx="5" fill={u2Stroke} />
            <text x="501" y="131" fill="#FFFFFF" fontSize="11.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট {unit2Id}
            </text>

            <text x="501" y="156" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং
            </text>

            <text x="615" y="93" fontSize="11.5" fontWeight="700">বাথরুম</text>
            <text x="697" y="85" fontSize="11" fontWeight="700" fill={u2Stroke}>বারান্দা</text>
            <text x="652" y="156" fontSize="14.5" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ২</text>
            <text x="652" y="173" fontSize="10.5" fill="#5C5852" fontWeight="600">(পশ্চিম মুখী)</text>
          </g>

          {/* Prominent "🟢 ভাড়া হবে" Badge when Unit 2 is Available */}
          {u2Available && (
            <AvailableStatusBadgeSvg
              x={501}
              y={174}
              availableFrom={unit2.availableFrom}
              compact
            />
          )}

          {/* Dynamic Room Action inside Middle Unit (D2 / E2) Drawing & Dining */}
          <RoomStatusActionSvg
            x={501}
            y={u2Available ? 208 : 198}
            isAvailable={u2Available}
            accentColor={u2Stroke}
            hoverColor="#92400E"
            isBtnHovered={hoveredBtn === unit2Id}
            onMouseEnterBtn={() => setHoveredBtn(unit2Id)}
            onMouseLeaveBtn={() => setHoveredBtn(null)}
            onOpenMedia={(e) => handleUnitClick(unit2, true, e)}
            compact
          />
        </g>

        {/* ===================================================================
            3. CENTRAL STAIRCASE (সিঁড়ি / STAIRS: x=432..570, y=240..356)
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
            4. RIGHT UNIT: D3 / E3 (RED BORDER IN CAD — 3 BEDROOMS)
           =================================================================== */}
        <g
          className={`bp-unit ${u3Available ? 'bp-unit--available' : 'bp-unit--occupied'} ${
            hoveredUnit === unit3Id ? 'bp-unit--hovered' : ''
          }`}
          filter="url(#u3-glow)"
          onClick={(e) => handleUnitClick(unit3, u3Available, e)}
          onMouseEnter={() => handleUnitEnter(unit3, u3Available)}
          onMouseLeave={() => handleUnitLeave(unit3, u3Available)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleUnitClick(unit3, u3Available, e);
          }}
          aria-label={
            u3Available
              ? `ইউনিট ${unit3Id} — ভাড়া হবে, ছবি এবং ভিডিও দেখতে ক্লিক করুন`
              : `ইউনিট ${unit3Id} — বর্তমানে ভাড়া হয়ে গেছে`
          }
        >
          {/* Base warm surface of Right Unit (D3 / E3) */}
          <polygon points={u3PolygonPoints} fill={u3Fill} />

          {/* Top-Right Bedroom 3 (735..848, 60..204) + Attached Veranda & Bathroom */}
          <rect x="735" y="60" width="113" height="144" fill={u3Fill} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="848" y="60" width="52" height="62" fill={u3VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="848" y="122" width="52" height="82" fill={u3BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="845" y="96" width="6" height="22" fill="#FFFDF9" stroke={u3Accent} strokeWidth="1.3" />
          <rect x="845" y="130" width="6" height="26" fill="#FFFDF9" stroke={u3Accent} strokeWidth="1.3" />
          <rect x="738" y="201" width="44" height="6" fill="#FFFDF9" stroke={u3Accent} strokeWidth="1.3" />

          {/* Central Drawing & Dining Room (570..824, 204..356) */}
          <rect x="570" y="204" width="254" height="152" fill={u3HallFill} stroke="none" />
          <path
            d="M 570,204 L 824,204 M 570,204 L 570,356 L 824,356"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2.2"
          />

          {/* Middle-Right Wall: Kitchen (824..900, 204..286) with open path at top-left & Common Toilet (824..900, 286..356) */}
          <rect x="824" y="204" width="76" height="82" fill={u3Available ? '#F7EFE4' : '#E8E2D5'} stroke="none" />
          <path
            d="M 824,204 L 900,204 L 900,286 L 824,286 L 824,238"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2"
            strokeLinecap="square"
          />
          <rect x="824" y="286" width="76" height="70" fill={u3BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="821" y="316" width="6" height="32" fill="#FFFDF9" stroke={u3Accent} strokeWidth="1.3" />

          {/* Bottom-Right Two Bedrooms (y=356..500) + Two East Verandas */}
          <rect x="570" y="356" width="165" height="144" fill={u3Fill} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="574" y="353" width="44" height="6" fill="#FFFDF9" stroke={u3Accent} strokeWidth="1.3" />
          <rect x="584" y="500" width="136" height="45" fill={u3VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="602" y="497" width="38" height="6" fill="#FFFDF9" stroke={u3Accent} strokeWidth="1.3" />

          <rect x="735" y="356" width="165" height="144" fill={u3Fill} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="738" y="353" width="44" height="6" fill="#FFFDF9" stroke={u3Accent} strokeWidth="1.3" />
          <rect x="748" y="500" width="136" height="45" fill={u3VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="762" y="497" width="38" height="6" fill="#FFFDF9" stroke={u3Accent} strokeWidth="1.3" />

          {/* Outer Deep Terracotta Border of Right Unit (D3 / E3) */}
          <polygon
            points={u3PolygonPoints}
            fill="none"
            stroke={u3Accent}
            strokeWidth={hoveredUnit === unit3Id ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* Entry Doorway on the Staircase Right Wall (x=570) */}
          <rect x="567" y="264" width="6" height="44" fill="#FFFDF9" stroke={u3Accent} strokeWidth="1.5" />

          {/* Labels inside Right Unit (D3 / E3) */}
          <g fill="#1F2421" textAnchor="middle" className="bp-u3-labels">
            <rect x="744" y="68" width="94" height="25" rx="6" fill={u3Accent} />
            <text x="791" y="85" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট {unit3Id}
            </text>

            <text x="791" y="132" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৩</text>
            <text x="791" y="149" fontSize="10.5" fill="#5C5852" fontWeight="600">(উত্তর-পশ্চিম কোণ)</text>

            <text x="874" y="91" transform="rotate(-90 874 91)" fontSize="11" fontWeight="700" fill="#2D6A4F">বারান্দা</text>
            <text x="874" y="163" transform="rotate(-90 874 163)" fontSize="11.5" fontWeight="700">বাথরুম</text>

            <text x="697" y={u3Available ? '262' : '256'} fontSize="16" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং রুম
            </text>

            <text x="862" y="244" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">কিচেন</text>
            <text x="862" y="260" fontSize="10" fill="#5C5852" fontWeight="600">(রান্নাঘর)</text>

            <text x="862" y="317" fontSize="11.5" fontWeight="700">কমন</text>
            <text x="862" y="332" fontSize="11.5" fontWeight="700">টয়লেট</text>

            <text x="652" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ১</text>
            <text x="652" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(পূর্ব মুখী)</text>
            <text x="652" y="527" fontSize="12" fontWeight="700" fill="#2D6A4F">বারান্দা</text>

            <text x="818" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ২</text>
            <text x="818" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(উত্তর-পূর্ব কোণ)</text>
            <text x="816" y="527" fontSize="12" fontWeight="700" fill="#2D6A4F">বারান্দা</text>
          </g>

          {/* Prominent "🟢 ভাড়া হবে" Badge when Unit 3 is Available */}
          {u3Available && (
            <AvailableStatusBadgeSvg
              x={697}
              y={226}
              availableFrom={unit3.availableFrom}
            />
          )}

          {/* Dynamic Room Action inside Right Unit (D3 / E3) Drawing & Dining */}
          <RoomStatusActionSvg
            x={697}
            y={306}
            isAvailable={u3Available}
            accentColor={u3Accent}
            hoverColor="#B34B25"
            isBtnHovered={hoveredBtn === unit3Id}
            onMouseEnterBtn={() => setHoveredBtn(unit3Id)}
            onMouseLeaveBtn={() => setHoveredBtn(null)}
            onOpenMedia={(e) => handleUnitClick(unit3, true, e)}
          />
        </g>
      </svg>

      {/* Floating Hover (Desktop) & Tap (Mobile) Popover for Occupied Units */}
      <OccupiedUnitPopover
        activeUnit={activePopupUnitId}
        position={POPOVER_POSITIONS[activePopupUnitId]}
      />
    </div>
  );
}
