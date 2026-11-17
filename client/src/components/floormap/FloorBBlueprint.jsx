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
 * Exact architectural floorplate for Row B (2nd Floor / ২য় তলা: Units B1 & B2)
 * reconstructed directly from the building's AutoCAD blueprint.
 *
 * - Unit B1 (Left L-shape): Owner's residence (বাড়িওয়ালা) — watermarked & non-clickable.
 * - Unit B2 (Right): Dynamic Availability (`ভাড়া হবে`) vs. Occupied Privacy (`ভাড়া হয়ে গেছে`).
 */
export default function FloorBBlueprint({ floor }) {
  const navigate = useNavigate();
  const [b2Hovered, setB2Hovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const { activePopupUnitId, setHoveredId, triggerTapPopup } = useOccupiedPopup();

  const unitB2 = floor.units.find((u) => u.id === 'B2') || { id: 'B2', status: 'occupied' };
  const b2Available = isUnitAvailable(unitB2);

  const b2AccentColor = '#C85A32';
  const b2FillColor = b2Available ? '#FFFDF9' : '#F3EFE6';
  const b2HallFill = b2Available ? '#FAF5EC' : '#EAE4D7';
  const b2VerandaFill = b2Available ? '#F6ECE3' : '#E3DDD0';
  const b2BathFill = b2Available ? '#F2ECE1' : '#E6E0D3';

  const handleB2Click = (e) => {
    if (b2Available) {
      if (e) e.stopPropagation();
      navigate(`/flat/${unitB2.id}`);
    } else {
      triggerTapPopup('B2', e);
    }
  };

  const POPOVER_POSITIONS = {
    B2: { left: '73%', top: '53%' },
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
               & labels (opacity: 0.3), with gentle centered overlay text.
           =================================================================== */}
        <g className="bp-unit bp-unit--owner" aria-label="ইউনিট B1 — বাড়িওয়ালা (মালিকের নিজস্ব বাসভবন)">
          <polygon points={b1PolygonPoints} fill="#EAE3D5" />

          <g className="bp-b1-internals" opacity="0.3" stroke="#1F2421" fill="none">
            <rect x="100" y="60" width="58" height="68" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="100" y="128" width="58" height="84" fill="#E5DECF" strokeWidth="1.6" />
            <rect x="155" y="102" width="6" height="22" fill="#EAE3D5" strokeWidth="1" />
            <rect x="155" y="182" width="6" height="24" fill="#EAE3D5" strokeWidth="1" />

            <path d="M 158,60 L 286,60 L 286,188 L 225,212 L 158,212 Z" strokeWidth="1.8" />
            <line x1="227" y1="215" x2="285" y2="192" strokeWidth="1.2" />

            <rect x="286" y="60" width="54" height="44" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="340" y="60" width="92" height="44" fill="#E5DECF" strokeWidth="1.6" />
            <rect x="292" y="101" width="24" height="5" fill="#EAE3D5" strokeWidth="1" />
            <rect x="352" y="101" width="26" height="5" fill="#EAE3D5" strokeWidth="1" />

            <rect x="286" y="104" width="146" height="84" strokeWidth="1.8" />
            <rect x="296" y="185" width="52" height="6" fill="#EAE3D5" strokeWidth="1" />

            <rect x="432" y="60" width="138" height="50" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="526" y="107" width="38" height="5" fill="#EAE3D5" strokeWidth="1" />
            <path d="M 432,110 L 570,110 L 570,240 L 432,240" strokeWidth="1.8" />

            <rect x="570" y="60" width="90" height="58" fill="#E5DECF" strokeWidth="1.6" />
            <rect x="632" y="115" width="22" height="5" fill="#EAE3D5" strokeWidth="1" />
            <rect x="660" y="60" width="75" height="42" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="662" y="99" width="24" height="5" fill="#EAE3D5" strokeWidth="1" />
            <path d="M 570,118 L 660,118 L 660,102 L 735,102 L 735,204 L 570,204 Z" strokeWidth="1.8" />
            <rect x="567" y="164" width="6" height="32" fill="#EAE3D5" strokeWidth="1" />

            <rect x="100" y="212" width="85" height="96" fill="#E5DECF" strokeWidth="1.8" />
            <rect x="182" y="238" width="6" height="34" fill="#EAE3D5" strokeWidth="1" />

            <rect x="100" y="356" width="166" height="144" strokeWidth="1.8" />
            <rect x="210" y="353" width="48" height="6" fill="#EAE3D5" strokeWidth="1" />

            <rect x="114" y="500" width="138" height="45" fill="#DFD7C6" strokeWidth="1.6" />
            <rect x="196" y="497" width="32" height="6" fill="#EAE3D5" strokeWidth="1" />
            <rect x="280" y="500" width="138" height="45" fill="#DFD7C6" strokeWidth="1.6" />

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

          <polygon
            points={b1PolygonPoints}
            fill="none"
            stroke="#7A736A"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          <line x1="432" y1="258" x2="432" y2="306" stroke="#8C857B" strokeWidth="3.5" strokeDasharray="5 4" />
          <line x1="518" y1="240" x2="558" y2="240" stroke="#8C857B" strokeWidth="3.5" strokeDasharray="5 4" />

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
              ইউনিট B1 — বাড়িওয়ালা
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
           =================================================================== */}
        <g
          className={`bp-unit ${b2Available ? 'bp-unit--available' : 'bp-unit--occupied'} ${
            b2Hovered ? 'bp-unit--hovered' : ''
          }`}
          filter="url(#b2-glow)"
          onClick={handleB2Click}
          onMouseEnter={() => {
            setB2Hovered(true);
            if (!b2Available) setHoveredId('B2');
          }}
          onMouseLeave={() => {
            setB2Hovered(false);
            if (!b2Available) setHoveredId(null);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleB2Click(e);
          }}
          aria-label={
            b2Available
              ? 'ইউনিট B2 — ভাড়া হবে, ছবি এবং ভিডিও দেখতে ক্লিক করুন'
              : 'ইউনিট B2 — বর্তমানে ভাড়া হয়ে গেছে'
          }
        >
          <polygon points={b2PolygonPoints} fill={b2FillColor} />

          {/* Top-Right Bedroom (735..848, 60..204) + Attached Veranda & Bathroom */}
          <rect x="735" y="60" width="113" height="144" fill={b2FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="848" y="60" width="52" height="62" fill={b2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="848" y="122" width="52" height="82" fill={b2BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="845" y="96" width="6" height="22" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="845" y="130" width="6" height="26" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="738" y="201" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* Central Drawing & Dining Room (570..824, 204..356) */}
          <rect x="570" y="204" width="254" height="152" fill={b2HallFill} stroke="none" />
          <path
            d="M 570,204 L 824,204 M 570,204 L 570,356 L 824,356"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2.2"
          />

          {/* Kitchen & Common Toilet */}
          <rect x="824" y="204" width="76" height="82" fill={b2Available ? '#F7EFE4' : '#E8E2D5'} stroke="none" />
          <path
            d="M 824,204 L 900,204 L 900,286 L 824,286 L 824,238"
            fill="none"
            stroke="#1F2421"
            strokeWidth="2"
            strokeLinecap="square"
          />
          <rect x="824" y="286" width="76" height="70" fill={b2BathFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="821" y="316" width="6" height="32" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          {/* Bottom-Right Two Bedrooms + East Verandas */}
          <rect x="570" y="356" width="165" height="144" fill={b2FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="574" y="353" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="584" y="500" width="136" height="45" fill={b2VerandaFill} stroke="#1F2421" strokeWidth="2" />
          <rect x="602" y="497" width="38" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />

          <rect x="735" y="356" width="165" height="144" fill={b2FillColor} stroke="#1F2421" strokeWidth="2.2" />
          <rect x="738" y="353" width="44" height="6" fill="#FFFDF9" stroke="#C85A32" strokeWidth="1.3" />
          <rect x="748" y="500" width="136" height="45" fill={b2VerandaFill} stroke="#1F2421" strokeWidth="2" />
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

          {/* Labels inside B2 */}
          <g fill="#1F2421" textAnchor="middle" className="bp-b2-labels">
            <rect x="744" y="68" width="94" height="25" rx="6" fill={b2AccentColor} />
            <text x="791" y="85" fill="#FFFFFF" fontSize="12.5" fontWeight="700" fontFamily="var(--font-heading)">
              ইউনিট B2
            </text>

            <text x="791" y="132" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">বেডরুম ৩</text>
            <text x="791" y="149" fontSize="10.5" fill="#5C5852" fontWeight="600">(উত্তর-পশ্চিম কোণ)</text>

            <text x="874" y="91" transform="rotate(-90 874 91)" fontSize="11" fontWeight="700" fill="#2D6A4F">বারান্দা</text>
            <text x="874" y="163" transform="rotate(-90 874 163)" fontSize="11.5" fontWeight="700">বাথরুম</text>

            <text x="697" y={b2Available ? '262' : '256'} fontSize="16" fontWeight="700" fontFamily="var(--font-heading)" fill="#1F2421">
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

          {/* Prominent "🟢 ভাড়া হবে" Badge when B2 is Available */}
          {b2Available && (
            <AvailableStatusBadgeSvg
              x={697}
              y={226}
              availableFrom={unitB2.availableFrom}
            />
          )}

          {/* Dynamic Room Action inside B2 Drawing & Dining Room */}
          <RoomStatusActionSvg
            x={697}
            y={306}
            isAvailable={b2Available}
            accentColor={b2AccentColor}
            hoverColor="#B34B25"
            isBtnHovered={btnHovered}
            onMouseEnterBtn={() => setBtnHovered(true)}
            onMouseLeaveBtn={() => setBtnHovered(false)}
            onOpenMedia={handleB2Click}
          />
        </g>
      </svg>

      {/* Floating Hover (Desktop) & Tap (Mobile) Popover for Occupied Unit B2 */}
      <OccupiedUnitPopover
        activeUnit={activePopupUnitId}
        position={POPOVER_POSITIONS[activePopupUnitId]}
      />
    </div>
  );
}
