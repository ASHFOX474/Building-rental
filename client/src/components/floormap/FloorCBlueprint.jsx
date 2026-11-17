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
 * Exact architectural floorplate for Row C (3rd Floor / ৩য় তলা: Units C1 & C2)
 * reconstructed directly from the Floor C AutoCAD blueprint, with dynamic
 * Availability (`ভাড়া হবে`) vs. Occupied Privacy (`ভাড়া হয়ে গেছে`) logic.
 */
export default function FloorCBlueprint({ floor }) {
  const navigate = useNavigate();
  const [c1Hovered, setC1Hovered] = useState(false);
  const [c2Hovered, setC2Hovered] = useState(false);
  const [c1BtnHovered, setC1BtnHovered] = useState(false);
  const [c2BtnHovered, setC2BtnHovered] = useState(false);
  const { activePopupUnitId, setHoveredId, triggerTapPopup } = useOccupiedPopup();

  const unitC1 = floor.units.find((u) => u.id === 'C1') || { id: 'C1', status: 'occupied' };
  const unitC2 = floor.units.find((u) => u.id === 'C2') || { id: 'C2', status: 'occupied' };

  const c1Available = isUnitAvailable(unitC1);
  const c2Available = isUnitAvailable(unitC2);

  const c1AccentColor = '#2D6A4F';
  const c1FillColor = c1Available ? '#FBFDFB' : '#F3EFE6';
  const c1HallFill = c1Available ? '#EFF7F1' : '#EAE4D7';
  const c1VerandaFill = c1Available ? '#E2F1E7' : '#E3DDD0';
  const c1BathFill = c1Available ? '#EDF2EE' : '#E6E0D3';

  const c2AccentColor = '#C85A32';
  const c2FillColor = c2Available ? '#FFFDF9' : '#F3EFE6';
  const c2HallFill = c2Available ? '#FAF5EC' : '#EAE4D7';
  const c2VerandaFill = c2Available ? '#F6ECE3' : '#E3DDD0';
  const c2BathFill = c2Available ? '#F2ECE1' : '#E6E0D3';

  const handleC1Click = (e) => {
    if (c1Available) {
      if (e) e.stopPropagation();
      navigate(`/flat/${unitC1.id}`);
    } else {
      triggerTapPopup('C1', e);
    }
  };

  const handleC2Click = (e) => {
    if (c2Available) {
      if (e) e.stopPropagation();
      navigate(`/flat/${unitC2.id}`);
    } else {
      triggerTapPopup('C2', e);
    }
  };

  const POPOVER_POSITIONS = {
    C1: { left: '32%', top: '53%' },
    C2: { left: '73%', top: '53%' },
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

  // Continuous L-shaped polygon for C1's two connected Drawing & Dining areas
  const c1ConnectedHallPoints = [
    '185,204',
    '432,204',
    '432,110',
    '570,110',
    '570,240',
    '432,240',
    '432,356',
    '185,356',
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
          <filter id="c1-glow" x="-5%" y="-5%" width="110%" height="112%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation={c1Hovered ? '6' : '2.5'}
              floodColor={c1AccentColor}
              floodOpacity={c1Hovered ? '0.22' : '0.1'}
            />
          </filter>

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
           =================================================================== */}
        <g
          className={`bp-unit ${c1Available ? 'bp-unit--available' : 'bp-unit--occupied'} ${
            c1Hovered ? 'bp-unit--hovered' : ''
          }`}
          filter="url(#c1-glow)"
          onClick={handleC1Click}
          onMouseEnter={() => {
            setC1Hovered(true);
            if (!c1Available) setHoveredId('C1');
          }}
          onMouseLeave={() => {
            setC1Hovered(false);
            if (!c1Available) setHoveredId(null);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleC1Click(e);
          }}
          aria-label={
            c1Available
              ? 'ইউনিট C1 — ভাড়া হবে, ছবি এবং ভিডিও দেখতে ক্লিক করুন'
              : 'ইউনিট C1 — বর্তমানে ভাড়া হয়ে গেছে'
          }
        >
          <polygon points={c1PolygonPoints} fill={c1FillColor} />
          <polygon points={c1ConnectedHallPoints} fill={c1HallFill} />

          {/* Top-Left: Far-Left Veranda (100..158, 60..126) & Bathroom (100..158, 126..204) */}
          <rect x="100" y="60" width="58" height="66" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="100" y="126" width="58" height="78" fill={c1BathFill} stroke="#1F2421" strokeWidth="2" />

          {/* Top-Left Bedroom 1 (158..286, 60..204) */}
          <rect x="158" y="60" width="128" height="144" fill={c1FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="155" y="96" width="6" height="24" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="155" y="168" width="6" height="28" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="230" y="201" width="46" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* Top-Left-Center: Veranda (286..340, 60..104), Bathroom (340..432, 60..104) & Bedroom 2 (286..432, 104..204) */}
          <rect x="286" y="60" width="54" height="44" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="340" y="60" width="92" height="44" fill={c1BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="286" y="104" width="146" height="100" fill={c1FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="292" y="101" width="26" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="348" y="101" width="28" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="429" y="140" width="6" height="38" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* Middle-Left Outer Wall: Common Toilet (100..185, 204..278) & Kitchen (100..185, 278..356) */}
          <rect x="100" y="204" width="85" height="74" fill={c1BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="182" y="218" width="6" height="34" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* Leftmost Kitchen with open path at bottom-right (x=185, y=322..356) */}
          <rect x="100" y="278" width="85" height="78" fill={c1Available ? '#F4EFE6' : '#E8E2D5'} stroke="none" />
          <path
            d="M 100,278 L 185,278 L 185,322 M 185,356 L 100,356 L 100,278"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2.2"
            strokeLinecap="square"
          />

          {/* Bottom-Left Two Side-by-Side Bedrooms + Two Verandas */}
          <rect x="100" y="356" width="166" height="144" fill={c1FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="210" y="353" width="46" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="114" y="500" width="138" height="45" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="198" y="497" width="36" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          <rect x="266" y="356" width="166" height="144" fill={c1FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="380" y="353" width="44" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="280" y="500" width="138" height="45" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="364" y="497" width="36" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* Top-Center Section (Above Staircase: x=432..570, y=60..240) */}
          <rect x="432" y="60" width="70" height="50" fill={c1Available ? '#F4EFE6' : '#E8E2D5'} stroke="none" />
          <path
            d="M 432,110 L 432,60 L 502,60 L 502,110 L 464,110"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2"
            strokeLinecap="square"
          />

          <rect x="502" y="60" width="68" height="50" fill={c1BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="536" y="107" width="28" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* Top-Right of Green Zone (Above C2's Drawing/Dining: x=570..735, y=60..204) */}
          <rect x="570" y="60" width="90" height="58" fill={c1BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="660" y="60" width="75" height="42" fill={c1VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <path
            d="M 570,118 L 660,118 L 660,102 L 735,102 L 735,204 L 570,204 Z"
            fill={c1FillColor}
            stroke="#1F2421"
            strokeWidth="2.2"
          />
          <rect x="630" y="115" width="24" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="664" y="99" width="26" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />
          <rect x="567" y="160" width="6" height="34" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.3" />

          {/* Outer Deep Leaf-Green Border of Tenant Unit C1 */}
          <polygon
            points={c1PolygonPoints}
            fill="none"
            stroke={c1AccentColor}
            strokeWidth={c1Hovered ? '5' : '4.2'}
            strokeLinejoin="round"
          />

          {/* C1 Entry Doorways from Stairs */}
          <rect x="429" y="258" width="6" height="48" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.5" />
          <rect x="518" y="237" width="40" height="6" fill="#FFFFFF" stroke={c1AccentColor} strokeWidth="1.5" />

          {/* Labels inside C1 */}
          <g fill="#1F2421" textAnchor="middle" className="bp-c1-labels">
            <rect x="166" y="68" width="96" height="25" rx="6" fill={c1AccentColor} />
            <text x="214" y="85" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট C1
            </text>

            <text x="129" y="93" transform="rotate(-90 129 93)" fontSize="11" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>
            <text x="129" y="165" transform="rotate(-90 129 165)" fontSize="11.5" fontWeight="700">বাথরুম</text>

            <text x="222" y="134" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ১</text>
            <text x="222" y="151" fontSize="10.5" fill="#5C5852" fontWeight="600">(দক্ষিণ-পশ্চিম)</text>

            <text x="313" y="86" fontSize="10.5" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>
            <text x="386" y="86" fontSize="11" fontWeight="700">বাথরুম</text>
            <text x="359" y="150" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ২</text>
            <text x="359" y="167" fontSize="10.5" fill="#5C5852" fontWeight="600">(পশ্চিম মুখী)</text>

            <text x="142" y="238" fontSize="11.5" fontWeight="700">কমন</text>
            <text x="142" y="253" fontSize="11.5" fontWeight="700">টয়লেট</text>
            <text x="142" y="316" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">কিচেন</text>
            <text x="142" y="331" fontSize="10" fill="#5C5852" fontWeight="600">(রান্নাঘর)</text>

            <text x="308" y={c1Available ? '262' : '256'} fontSize="16" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং
            </text>

            <text x="183" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৩</text>
            <text x="183" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(দক্ষিণ-পূর্ব কোণ)</text>
            <text x="183" y="527" fontSize="12" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>

            <text x="349" y="426" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৪</text>
            <text x="349" y="444" fontSize="10.5" fill="#5C5852" fontWeight="600">(পূর্ব মুখী)</text>
            <text x="349" y="527" fontSize="12" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>

            <text x="467" y="89" fontSize="12" fontWeight="700" fontFamily="var(--font-heading)" fill="#C85A32">কিচেন</text>
            <text x="536" y="82" fontSize="10.5" fontWeight="700">কমন</text>
            <text x="536" y="96" fontSize="10.5" fontWeight="700">টয়লেট</text>

            <text x="501" y="168" fontSize="13.5" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
              ড্রয়িং ও ডাইনিং
            </text>
            <text x="501" y="185" fontSize="10" fill="#5C5852" fontWeight="600">
              (২য় অংশ)
            </text>

            <text x="615" y="93" fontSize="11.5" fontWeight="700">বাথরুম</text>
            <text x="697" y="85" fontSize="11" fontWeight="700" fill={c1AccentColor}>বারান্দা</text>
            <text x="652" y="158" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৫</text>
            <text x="652" y="175" fontSize="10.5" fill="#5C5852" fontWeight="600">(পশ্চিম মুখী)</text>
          </g>

          {/* Prominent "🟢 ভাড়া হবে" Badge when C1 is Available */}
          {c1Available && (
            <AvailableStatusBadgeSvg
              x={308}
              y={226}
              availableFrom={unitC1.availableFrom}
            />
          )}

          {/* Dynamic Room Action inside C1 Main Drawing & Dining */}
          <RoomStatusActionSvg
            x={308}
            y={306}
            isAvailable={c1Available}
            accentColor={c1AccentColor}
            hoverColor="#21523C"
            isBtnHovered={c1BtnHovered}
            onMouseEnterBtn={() => setC1BtnHovered(true)}
            onMouseLeaveBtn={() => setC1BtnHovered(false)}
            onOpenMedia={handleC1Click}
          />
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
           =================================================================== */}
        <g
          className={`bp-unit ${c2Available ? 'bp-unit--available' : 'bp-unit--occupied'} ${
            c2Hovered ? 'bp-unit--hovered' : ''
          }`}
          filter="url(#c2-glow)"
          onClick={handleC2Click}
          onMouseEnter={() => {
            setC2Hovered(true);
            if (!c2Available) setHoveredId('C2');
          }}
          onMouseLeave={() => {
            setC2Hovered(false);
            if (!c2Available) setHoveredId(null);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleC2Click(e);
          }}
          aria-label={
            c2Available
              ? 'ইউনিট C2 — ভাড়া হবে, ছবি এবং ভিডিও দেখতে ক্লিক করুন'
              : 'ইউনিট C2 — বর্তমানে ভাড়া হয়ে গেছে'
          }
        >
          <polygon points={c2PolygonPoints} fill={c2FillColor} />

          {/* Top-Right Bedroom (735..848, 60..204) + Attached Veranda & Bathroom */}
          <rect x="735" y="60" width="113" height="144" fill={c2FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="848" y="60" width="52" height="62" fill={c2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="848" y="122" width="52" height="82" fill={c2BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="845" y="96" width="6" height="22" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="845" y="130" width="6" height="26" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="738" y="201" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* Central Drawing & Dining Room (570..824, 204..356) */}
          <rect x="570" y="204" width="254" height="152" fill={c2HallFill} stroke="none" />
          <path
            d="M 570,204 L 824,204 M 570,204 L 570,356 L 824,356"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2.2"
          />

          {/* Kitchen & Common Toilet */}
          <rect x="824" y="204" width="76" height="82" fill={c2Available ? '#F7EFE4' : '#E8E2D5'} stroke="none" />
          <path
            d="M 824,204 L 900,204 L 900,286 L 824,286 L 824,238"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2"
            strokeLinecap="square"
          />
          <rect x="824" y="286" width="76" height="70" fill={c2BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="821" y="316" width="6" height="32" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* Bottom-Right Two Bedrooms + East Verandas */}
          <rect x="570" y="356" width="165" height="144" fill={c2FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="574" y="353" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="584" y="500" width="136" height="45" fill={c2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="602" y="497" width="38" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

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

          {/* Labels inside C2 */}
          <g fill="#1F2421" textAnchor="middle" className="bp-c2-labels">
            <rect x="744" y="68" width="94" height="25" rx="6" fill={c2AccentColor} />
            <text x="791" y="85" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট C2
            </text>

            <text x="791" y="132" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৩</text>
            <text x="791" y="149" fontSize="10.5" fill="#5C5852" fontWeight="600">(উত্তর-পশ্চিম কোণ)</text>

            <text x="874" y="91" transform="rotate(-90 874 91)" fontSize="11" fontWeight="700" fill="#2D6A4F">বারান্দা</text>
            <text x="874" y="163" transform="rotate(-90 874 163)" fontSize="11.5" fontWeight="700">বাথরুম</text>

            <text x="697" y={c2Available ? '262' : '256'} fontSize="16" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
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

          {/* Prominent "🟢 ভাড়া হবে" Badge when C2 is Available */}
          {c2Available && (
            <AvailableStatusBadgeSvg
              x={697}
              y={226}
              availableFrom={unitC2.availableFrom}
            />
          )}

          {/* Dynamic Room Action inside C2 Drawing & Dining Room */}
          <RoomStatusActionSvg
            x={697}
            y={306}
            isAvailable={c2Available}
            accentColor={c2AccentColor}
            hoverColor="#B34B25"
            isBtnHovered={c2BtnHovered}
            onMouseEnterBtn={() => setC2BtnHovered(true)}
            onMouseLeaveBtn={() => setC2BtnHovered(false)}
            onOpenMedia={handleC2Click}
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
