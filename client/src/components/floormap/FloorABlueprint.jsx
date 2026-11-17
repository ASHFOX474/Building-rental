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
 * Exact Architectural Floorplate for Row A:
 * Ground Floor / নিচতলা (১ম তলা — ফ্লোর A: গ্যারেজ, ইউনিট A1 ও A2)
 * reconstructed directly from the Ground Floor AutoCAD blueprint.
 *
 * Three Distinct Zones:
 *   1. Left Zone (Green in CAD): গ্যারেজ ও পার্কিং (Garage — non-rentable)
 *   2. Top-Middle to Top-Right Zone (Yellow in CAD): ইউনিট A1
 *      (১টি বেডরুম • আলাদা ড্রয়িং রুম ও ডাইনিং রুম • কিচেন • কমন টয়লেট • এটাচড বাথরুম ও বারান্দা)
 *   3. Lower-Right Zone (Red in CAD): ইউনিট A2
 *      (২টি বেডরুম • ড্রয়িং ও ডাইনিং রুম • কিচেন • কমন টয়লেট • বারান্দা ও এটাচড বাথরুম)
 */
export default function FloorABlueprint({ floor }) {
  const navigate = useNavigate();
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const { activePopupUnitId, setHoveredId, triggerTapPopup } = useOccupiedPopup();

  const unitA1 = floor.units.find((u) => u.id === 'A1') || { id: 'A1', status: 'occupied' };
  const unitA2 = floor.units.find((u) => u.id === 'A2') || { id: 'A2', status: 'occupied' };

  const a1Available = isUnitAvailable(unitA1);
  const a2Available = isUnitAvailable(unitA2);

  // Unit A1 (Top-Middle to Top-Right — Yellow/Ochre border in CAD)
  const a1Accent = '#C67D0A';
  const a1Stroke = '#B45309';
  const a1Fill = a1Available ? '#FFFDF7' : '#F3EFE6';
  const a1HallFill = a1Available ? '#FEF7E6' : '#EAE4D7';
  const a1VerandaFill = a1Available ? '#F9EBC8' : '#E3DDD0';
  const a1BathFill = a1Available ? '#F3ECE0' : '#E6E0D3';

  // Unit A2 (Lower-Right — Red/Terracotta border in CAD)
  const a2Accent = '#C85A32';
  const a2Fill = a2Available ? '#FFFDF9' : '#F3EFE6';
  const a2HallFill = a2Available ? '#FAF5EC' : '#EAE4D7';
  const a2VerandaFill = a2Available ? '#F6ECE3' : '#E3DDD0';
  const a2BathFill = a2Available ? '#F2ECE1' : '#E6E0D3';

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

  const POPOVER_POSITIONS = {
    A1: { left: '66%', top: '25%' },
    A2: { left: '73%', top: '62%' },
  };

  // 1. Exact outer polygon for Unit A1 (Yellow border in CAD)
  const a1PolygonPoints = [
    '432,60',
    '900,60',
    '900,204',
    '570,204',
    '570,240',
    '432,240',
  ].join(' ');

  // 2. Exact outer polygon for Unit A2 (Red border in CAD — includes bottom-left veranda & bottom-right bathroom)
  const a2PolygonPoints = [
    '570,204',
    '900,204',
    '900,500',
    '884,500',
    '884,545',
    '735,545',
    '735,500',
    '720,500',
    '720,545',
    '584,545',
    '584,500',
    '570,500',
  ].join(' ');

  return (
    <div className="bp-stage">
      <svg
        className="bp-svg"
        viewBox="88 46 824 512"
        role="img"
        aria-label="১ম তলা / নিচতলার (ফ্লোর A) স্থাপত্য ফ্লোর ম্যাপ: বাম পাশে গ্যারেজ ও পার্কিং, উপরে ইউনিট A1 এবং ডান-নিচে ইউনিট A2"
      >
        <defs>
          {/* Subtle architectural stone/paving hatch for the Garage */}
          <pattern
            id="garage-hatch"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-35)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="18"
              stroke="rgba(31, 36, 33, 0.055)"
              strokeWidth="2"
            />
          </pattern>

          <filter id="a1-glow" x="-6%" y="-6%" width="112%" height="114%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation={hoveredUnit === 'A1' ? '6' : '2.5'}
              floodColor={a1Stroke}
              floodOpacity={hoveredUnit === 'A1' ? '0.26' : '0.12'}
            />
          </filter>

          <filter id="a2-glow" x="-6%" y="-6%" width="112%" height="114%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation={hoveredUnit === 'A2' ? '6' : '2.5'}
              floodColor={a2Accent}
              floodOpacity={hoveredUnit === 'A2' ? '0.24' : '0.1'}
            />
          </filter>
        </defs>

        {/* ===================================================================
            1. LEFT ZONE: GARAGE (গ্যারেজ ও পার্কিং — x=100..432, y=60..500)
               Muted architectural surface with centered solid pill badge.
           =================================================================== */}
        <g className="bp-unit bp-unit--owner" aria-label="গ্যারেজ ও পার্কিং (ভবনের প্রবেশপথ)">
          <rect x="100" y="60" width="332" height="440" fill="#EAE3D5" />
          <rect x="100" y="60" width="332" height="440" fill="url(#garage-hatch)" />

          {/* Outer border of Garage (matching Green box in CAD, rendered in dignified slate-olive) */}
          <rect
            x="100"
            y="60"
            width="332"
            height="440"
            fill="none"
            stroke="#5F6F5E"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />

          {/* Doorway between Garage and Staircase on x=432 */}
          <rect
            x="429"
            y="258"
            width="6"
            height="76"
            fill="#FAF7F2"
            stroke="#5F6F5E"
            strokeWidth="1.5"
          />

          {/* Centered Solid Pill Badge for Garage */}
          <g transform="translate(266, 280)">
            <rect
              x="-138"
              y="-20"
              width="276"
              height="38"
              rx="9"
              fill="#4A5D4E"
            />
            <text
              x="0"
              y="5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="14.5"
              fontWeight="700"
              fontFamily="var(--font-heading)"
            >
              🚗 গ্যারেজ ও পার্কিং (ভবনের প্রবেশপথ)
            </text>
          </g>
        </g>

        {/* ===================================================================
            2. CENTRAL STAIRCASE (সিঁড়ি / STAIRS: x=432..570, y=240..356)
               Plus entrance lobby cross-hair below stairs as shown in CAD
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

          {/* Subtle CAD cross-hair marker below stairs (matching Ground Floor CAD image) */}
          <g stroke="rgba(31, 36, 33, 0.25)" strokeWidth="1" fill="none">
            <line x1="478" y1="340" x2="478" y2="414" />
            <line x1="442" y1="377" x2="514" y2="377" />
            <rect x="475" y="374" width="6" height="6" />
          </g>
        </g>

        {/* ===================================================================
            3. TOP-MIDDLE TO TOP-RIGHT ZONE: UNIT A1 (YELLOW BORDER IN CAD)
               1 Bedroom + Separate Drawing Room & Dining Room + Kitchen +
               Common Toilet + Attached Bathroom & Veranda
           =================================================================== */}
        <g
          className={`bp-unit ${a1Available ? 'bp-unit--available' : 'bp-unit--occupied'} ${
            hoveredUnit === 'A1' ? 'bp-unit--hovered' : ''
          }`}
          filter="url(#a1-glow)"
          onClick={(e) => handleUnitClick(unitA1, a1Available, e)}
          onMouseEnter={() => handleUnitEnter(unitA1, a1Available)}
          onMouseLeave={() => handleUnitLeave(unitA1, a1Available)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleUnitClick(unitA1, a1Available, e);
          }}
          aria-label={
            a1Available
              ? 'ইউনিট A1 — ভাড়া হবে, ছবি এবং ভিডিও দেখতে ক্লিক করুন'
              : 'ইউনিট A1 — বর্তমানে ভাড়া হয়ে গেছে'
          }
        >
          {/* Base surface of Unit A1 */}
          <polygon points={a1PolygonPoints} fill={a1Fill} />

          {/* 1. Separate Drawing Room above Stairs (432..570, 60..240) */}
          <rect
            x="432"
            y="60"
            width="138"
            height="180"
            fill={a1HallFill}
            stroke="#1F2421"
            strokeWidth="2.2"
          />

          {/* 2. Central Dining Room (570..735, 112..204) */}
          <rect
            x="570"
            y="112"
            width="165"
            height="92"
            fill={a1HallFill}
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          {/* Internal Door connecting Drawing Room and Dining Room on x=570 */}
          <rect
            x="567"
            y="148"
            width="6"
            height="42"
            fill="#FFFFFF"
            stroke={a1Stroke}
            strokeWidth="1.3"
          />

          {/* 3. Top-Middle Utility Rooms above Dining Room: Common Toilet (570..642, 60..112) & Kitchen (642..735, 60..112) */}
          <rect
            x="570"
            y="60"
            width="72"
            height="52"
            fill={a1BathFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          {/* Door at bottom of Common Toilet (y=112) */}
          <rect
            x="586"
            y="109"
            width="28"
            height="6"
            fill="#FFFFFF"
            stroke={a1Stroke}
            strokeWidth="1.3"
          />

          {/* Kitchen (642..735, 60..112) with open path at bottom-right (x=698..734, y=112) */}
          <rect
            x="642"
            y="60"
            width="93"
            height="52"
            fill={a1Available ? '#F7EFE2' : '#E8E2D5'}
            stroke="none"
          />
          <path
            d="M 642,112 L 642,60 L 735,60 L 735,112 M 642,112 L 698,112"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2"
            strokeLinecap="square"
          />

          {/* 4. Right Section (Top-Right Corner): Bedroom (735..848, 60..204) + Attached Veranda & Bathroom */}
          <rect
            x="735"
            y="60"
            width="113"
            height="144"
            fill={a1Fill}
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          {/* Door between Dining Room and Bedroom on x=735 */}
          <rect
            x="732"
            y="148"
            width="6"
            height="42"
            fill="#FFFFFF"
            stroke={a1Stroke}
            strokeWidth="1.3"
          />

          {/* Attached Top-Right Veranda (848..900, 60..122) */}
          <rect
            x="848"
            y="60"
            width="52"
            height="62"
            fill={a1VerandaFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          {/* Attached Top-Right Bathroom (848..900, 122..204) */}
          <rect
            x="848"
            y="122"
            width="52"
            height="82"
            fill={a1BathFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          {/* Doors to Veranda & Bathroom on x=848 */}
          <rect x="845" y="94" width="6" height="22" fill="#FFFFFF" stroke={a1Stroke} strokeWidth="1.3" />
          <rect x="845" y="130" width="6" height="26" fill="#FFFFFF" stroke={a1Stroke} strokeWidth="1.3" />

          {/* Outer Golden Ochre / Amber Border of Unit A1 (Yellow border in CAD) */}
          <polygon
            points={a1PolygonPoints}
            fill="none"
            stroke={a1Accent}
            strokeWidth={hoveredUnit === 'A1' ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* Entry Doorway at bottom of Drawing Room from Stairs (y=240) */}
          <rect x="518" y="237" width="40" height="6" fill="#FFFFFF" stroke={a1Stroke} strokeWidth="1.5" />

          {/* Crisp Bangla Labels inside Unit A1 */}
          <g fill="#1F2421" textAnchor="middle" className="bp-a1-labels">
            {/* Solid Unit Pill Badge: ইউনিট A1 */}
            <rect x="444" y="68" width="92" height="24" rx="6" fill={a1Stroke} />
            <text x="490" y="84" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট A1
            </text>

            {/* Separate Drawing Room Label */}
            <text x="501" y="134" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">
              ড্রয়িং রুম
            </text>
            <text x="501" y="150" fontSize="10.5" fill="#5C5852" fontWeight="600">
              (আলাদা বসার ঘর)
            </text>

            {/* Top-Middle Common Toilet & Kitchen */}
            <text x="606" y="82" fontSize="10.5" fontWeight="700">কমন</text>
            <text x="606" y="96" fontSize="10.5" fontWeight="700">টয়লেট</text>
            <text x="688" y="89" fontSize="12" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">
              কিচেন
            </text>

            {/* Central Dining Room Label */}
            <text x="652" y="152" fontSize="14.5" fontWeight="700" fontFamily="var(--font-heading)">
              ডাইনিং রুম
            </text>

            {/* Top-Right Bedroom, Veranda & Bathroom */}
            <text x="791" y="130" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">
              বেডরুম
            </text>
            <text x="791" y="147" fontSize="10.5" fill="#5C5852" fontWeight="600">
              (উত্তর-পশ্চিম কোণ)
            </text>
            <text x="874" y="91" transform="rotate(-90 874 91)" fontSize="11" fontWeight="700" fill="#2D6A4F">
              বারান্দা
            </text>
            <text x="874" y="163" transform="rotate(-90 874 163)" fontSize="11.5" fontWeight="700">
              বাথরুম
            </text>
          </g>

          {/* Prominent "🟢 ভাড়া হবে" Badge when A1 is Available */}
          {a1Available && (
            <AvailableStatusBadgeSvg
              x={652}
              y={182}
              availableFrom={unitA1.availableFrom}
              compact
            />
          )}

          {/* Dynamic Room Action inside A1 Drawing Room */}
          <RoomStatusActionSvg
            x={501}
            y={192}
            isAvailable={a1Available}
            accentColor={a1Stroke}
            hoverColor="#92400E"
            isBtnHovered={hoveredBtn === 'A1'}
            onMouseEnterBtn={() => setHoveredBtn('A1')}
            onMouseLeaveBtn={() => setHoveredBtn(null)}
            onOpenMedia={(e) => handleUnitClick(unitA1, true, e)}
            compact
          />
        </g>

        {/* ===================================================================
            4. LOWER-RIGHT ZONE: UNIT A2 (RED BORDER IN CAD — 2 BEDROOMS)
               Drawing & Dining + Kitchen + Common Toilet + Bedroom 1 (with
               Veranda) + Bedroom 2 (with protruding bottom-right Bathroom!)
           =================================================================== */}
        <g
          className={`bp-unit ${a2Available ? 'bp-unit--available' : 'bp-unit--occupied'} ${
            hoveredUnit === 'A2' ? 'bp-unit--hovered' : ''
          }`}
          filter="url(#a2-glow)"
          onClick={(e) => handleUnitClick(unitA2, a2Available, e)}
          onMouseEnter={() => handleUnitEnter(unitA2, a2Available)}
          onMouseLeave={() => handleUnitLeave(unitA2, a2Available)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleUnitClick(unitA2, a2Available, e);
          }}
          aria-label={
            a2Available
              ? 'ইউনিট A2 — ভাড়া হবে, ছবি এবং ভিডিও দেখতে ক্লিক করুন'
              : 'ইউনিট A2 — বর্তমানে ভাড়া হয়ে গেছে'
          }
        >
          {/* Base warm surface of Unit A2 */}
          <polygon points={a2PolygonPoints} fill={a2Fill} />

          {/* 1. Central Drawing & Dining Room (570..824, 204..356) */}
          <rect x="570" y="204" width="254" height="152" fill={a2HallFill} stroke="none" />
          <path
            d="M 570,204 L 824,204 M 570,204 L 570,356 L 824,356"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2.2"
          />

          {/* 2. Middle-Right Outer Wall: Kitchen (824..900, 204..280) & Common Toilet (824..900, 280..356) */}
          <rect
            x="824"
            y="204"
            width="76"
            height="76"
            fill={a2Available ? '#F7EFE4' : '#E8E2D5'}
            stroke="none"
          />
          {/* Open entry path into Kitchen at top-left (x=824, y=204..234) */}
          <path
            d="M 824,204 L 900,204 L 900,280 L 824,280 L 824,234"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2"
            strokeLinecap="square"
          />

          <rect x="824" y="280" width="76" height="76" fill={a2BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="821" y="314" width="6" height="32" fill="#FFFDF9" stroke={a2Accent} strokeWidth="1.3" />

          {/* 3. Bottom-Left Bedroom 1 of A2 (570..735, 356..500) + Protruding East Veranda */}
          <rect x="570" y="356" width="165" height="144" fill={a2Fill} stroke="#1F2421" strokeWidth="2.2" />
          {/* Door from Drawing/Dining into Bedroom 1 on y=356 (near right side matching CAD) */}
          <rect x="680" y="353" width="44" height="6" fill="#FFFDF9" stroke={a2Accent} strokeWidth="1.3" />

          <rect x="584" y="500" width="136" height="45" fill={a2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          {/* Door to Veranda on y=500 */}
          <rect x="670" y="497" width="38" height="6" fill="#FFFDF9" stroke={a2Accent} strokeWidth="1.3" />

          {/* 4. Bottom-Right Bedroom 2 of A2 (735..900, 356..500 + alcove 735..802, 500..545)
                 + Protruding Bottom-Right Attached BATHROOM (802..884, 496..545)! */}
          <path
            d="M 735,356 L 900,356 L 900,500 L 884,500 L 884,496 L 802,496 L 802,545 L 735,545 Z"
            fill={a2Fill}
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          {/* Door from Drawing/Dining into Bedroom 2 on y=356 */}
          <rect x="742" y="353" width="44" height="6" fill="#FFFDF9" stroke={a2Accent} strokeWidth="1.3" />

          {/* Protruding Bottom-Right Attached Bathroom (802..884, 496..545) */}
          <rect
            x="802"
            y="496"
            width="82"
            height="49"
            fill={a2BathFill}
            stroke="#1F2421"
            strokeWidth="2"
          />
          {/* Vertical Door on x=802 entering the bottom-right Bathroom */}
          <rect x="799" y="504" width="6" height="28" fill="#FFFDF9" stroke={a2Accent} strokeWidth="1.3" />

          {/* Outer Deep Terracotta Border of Tenant Unit A2 */}
          <polygon
            points={a2PolygonPoints}
            fill="none"
            stroke={a2Accent}
            strokeWidth={hoveredUnit === 'A2' ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* A2 Entry Doorway on the Staircase Right Wall (x=570) */}
          <rect x="567" y="264" width="6" height="44" fill="#FFFDF9" stroke={a2Accent} strokeWidth="1.5" />

          {/* Crisp Bangla Labels inside Unit A2 */}
          <g fill="#1F2421" textAnchor="middle" className="bp-a2-labels">
            {/* Solid Unit Pill Badge: ইউনিট A2 */}
            <rect x="582" y="212" width="92" height="24" rx="6" fill={a2Accent} />
            <text x="628" y="228" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট A2
            </text>

            {/* Central Drawing & Dining Room Heading */}
            <text x="697" y={a2Available ? '262' : '256'} fontSize="16" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং রুম
            </text>

            {/* Kitchen & Common Toilet */}
            <text x="862" y="242" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">
              কিচেন
            </text>
            <text x="862" y="258" fontSize="10" fill="#5C5852" fontWeight="600">
              (রান্নাঘর)
            </text>

            <text x="862" y="314" fontSize="11.5" fontWeight="700">কমন</text>
            <text x="862" y="329" fontSize="11.5" fontWeight="700">টয়লেট</text>

            {/* Bottom-Left Bedroom 1 + Veranda */}
            <text x="652" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">
              বেডরুম ১
            </text>
            <text x="652" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">
              (পূর্ব মুখী)
            </text>
            <text x="652" y="527" fontSize="12" fontWeight="700" fill="#2D6A4F">
              বারান্দা
            </text>

            {/* Bottom-Right Bedroom 2 + Protruding Attached Bathroom */}
            <text x="818" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">
              বেডরুম ২
            </text>
            <text x="818" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">
              (উত্তর-পূর্ব কোণ)
            </text>
            <text x="843" y="525" fontSize="12" fontWeight="700" fill="#1F2421">
              বাথরুম
            </text>
          </g>

          {/* Prominent "🟢 ভাড়া হবে" Badge when A2 is Available */}
          {a2Available && (
            <AvailableStatusBadgeSvg
              x={728}
              y={224}
              availableFrom={unitA2.availableFrom}
            />
          )}

          {/* Dynamic Room Action inside A2 Drawing & Dining Room */}
          <RoomStatusActionSvg
            x={697}
            y={306}
            isAvailable={a2Available}
            accentColor={a2Accent}
            hoverColor="#B34B25"
            isBtnHovered={hoveredBtn === 'A2'}
            onMouseEnterBtn={() => setHoveredBtn('A2')}
            onMouseLeaveBtn={() => setHoveredBtn(null)}
            onOpenMedia={(e) => handleUnitClick(unitA2, true, e)}
          />
        </g>
      </svg>

      {/* Floating Hover (Desktop) & Tap (Mobile) Popover for Occupied Units A1 / A2 */}
      <OccupiedUnitPopover
        activeUnit={activePopupUnitId}
        position={POPOVER_POSITIONS[activePopupUnitId]}
      />
    </div>
  );
}
