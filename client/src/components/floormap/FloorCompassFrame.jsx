/**
 * Reusable L-shaped Kantajew terracotta & Shantiniketani floral alpana corner motif.
 * Rendered at max 48×48px in the 4 inner corners of the single floor map frame.
 */
function AlpanaCorner({ position }) {
  return (
    <span
      className={`alpana-corner alpana-corner--${position}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="alpana-corner__svg" fill="none">
        <g stroke="#C85A32" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer L-frame double terracotta rule */}
          <path d="M 2,44 L 2,2 L 44,2" strokeWidth="1.6" />
          <path d="M 6,40 L 6,6 L 40,6" strokeWidth="0.9" strokeDasharray="2 2" />

          {/* Corner junction diamond plaque (টেরাকোটা ফলক) */}
          <path d="M 2,2 L 10,6 L 6,10 Z" fill="#C85A32" fillOpacity="0.25" strokeWidth="1" />

          {/* Shantiniketani lotus & kalka (পদ্ম ও কলকা) blooming from the corner */}
          <path
            d="M 7,7 C 15,7 21,12 22,20 C 14,19 9,14 7,7 Z"
            fill="#C85A32"
            fillOpacity="0.14"
            strokeWidth="1.2"
          />
          <path
            d="M 8,7 C 13,13 13,13 19,18"
            strokeWidth="0.85"
          />

          {/* Upper horizontal vine tendril & scalloped terracotta arches */}
          <path d="M 12,6 Q 17,12 22,6 Q 27,12 32,6 Q 36,10 40,6" strokeWidth="1" />
          <path d="M 19,12 C 25,11 29,14 33,10" strokeWidth="0.9" />

          {/* Left vertical vine tendril & scalloped terracotta arches */}
          <path d="M 6,12 Q 12,17 6,22 Q 12,27 6,32 Q 10,36 6,40" strokeWidth="1" />
          <path d="M 12,19 C 11,25 14,29 10,33" strokeWidth="0.9" />

          {/* Delicate bindu dots (আলপনা বিন্দু) */}
          <circle cx="24" cy="24" r="1.3" fill="#C85A32" stroke="none" />
          <circle cx="15" cy="23" r="1" fill="#C85A32" stroke="none" />
          <circle cx="23" cy="15" r="1" fill="#C85A32" stroke="none" />
          <circle cx="44" cy="2" r="1.2" fill="#C85A32" stroke="none" />
          <circle cx="2" cy="44" r="1.2" fill="#C85A32" stroke="none" />
        </g>
      </svg>
    </span>
  );
}

/** Faint hand-drawn coconut & bamboo foliage sketch for West (Top) edge. */
function FoliageSketch({ flip = false }) {
  return (
    <svg
      className={`nature-motif nature-motif--foliage ${flip ? 'nature-motif--flip' : ''}`}
      viewBox="0 0 54 18"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
        {/* Gently arching palm/bamboo stem */}
        <path d="M 4,15 Q 24,5 48,9" />
        {/* Bamboo / coconut leaflets */}
        <path d="M 12,12 C 15,7 20,6 22,9 C 18,11 15,12 12,12 Z" />
        <path d="M 24,9 C 28,4 33,4 35,7 C 31,9 27,9 24,9 Z" />
        <path d="M 36,8 C 40,4 45,5 47,8" />
        <path d="M 18,11 C 21,14 26,15 29,12" />
      </g>
    </svg>
  );
}

/** Gentle curved hand-drawn breeze wave lines (দক্ষিণা বাতাস) for South (Left) edge. */
function BreezeWaves() {
  return (
    <svg
      className="nature-motif nature-motif--breeze"
      viewBox="0 0 72 20"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M 4,6 C 16,1 28,11 40,6 C 50,2 60,9 68,5" />
        <path d="M 10,12 C 22,7 34,17 46,12 C 54,9 61,13 66,11" opacity="0.8" />
        <path d="M 18,17 C 28,14 38,19 48,16" opacity="0.55" />
      </g>
    </svg>
  );
}

/** Subtle dotted/patterned Puthichitro linear flourish (-·- ❖ -·-) for street tags. */
function StreetFlourish() {
  return (
    <svg
      className="nature-motif nature-motif--flourish"
      viewBox="0 0 46 12"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <line x1="2" y1="6" x2="14" y2="6" />
        <circle cx="18" cy="6" r="1.2" fill="currentColor" stroke="none" />
        <path d="M 23,2 L 27,6 L 23,10 L 19,6 Z" fill="currentColor" fillOpacity="0.2" />
        <circle cx="28" cy="6" r="1.2" fill="currentColor" stroke="none" />
        <line x1="32" y1="6" x2="44" y2="6" />
      </g>
    </svg>
  );
}

/**
 * Single consolidated rectangular frame wrapping the architectural floor map.
 * Infused with traditional Bangladeshi Puthichitro double-line border,
 * 4 L-shaped Kantajew/Alpana corner motifs, and whispering nature flourishes.
 */
export default function FloorCompassFrame({ surroundings, hasAvailableUnit = true, children }) {
  return (
    <section
      className={`fmap-box ${hasAvailableUnit ? 'fmap-box--has-available' : ''}`}
      aria-label="স্থাপত্য ফ্লোর ম্যাপ ও চারপাশের পরিবেশ"
    >
      {/* Antique Puthichitro Inner Rule with tiny corner junction florets (❖) */}
      <div className="fmap-box__puthi-inner" aria-hidden="true">
        <span className="puthi-junction puthi-junction--tl">❖</span>
        <span className="puthi-junction puthi-junction--tr">❖</span>
        <span className="puthi-junction puthi-junction--bl">❖</span>
        <span className="puthi-junction puthi-junction--br">❖</span>
      </div>

      {/* 4 L-Shaped Ornamental Corner Motifs (Kantajew Terracotta & Alpana) */}
      <AlpanaCorner position="tl" />
      <AlpanaCorner position="tr" />
      <AlpanaCorner position="bl" />
      <AlpanaCorner position="br" />

      {/* Top Edge Inside Same Box — WEST (পশ্চিম দিক) with whispering foliage sketches */}
      <div className="fmap-box__edge fmap-box__edge--top">
        <FoliageSketch />
        <span>{surroundings.westTopBn}</span>
        <FoliageSketch flip />
      </div>

      <div className="fmap-box__middle">
        {/* Left Edge Inside Same Box — SOUTH (দক্ষিণ দিক) with hand-drawn breeze waves */}
        <div className="fmap-box__edge fmap-box__edge--left">
          <span>{surroundings.southLeftBn}</span>
          <BreezeWaves />
        </div>

        {/* Center — Floor Map SVG (Directly in the same box) */}
        <div className="fmap-box__plan">
          {children}
        </div>

        {/* Right Edge Inside Same Box — NORTH (উত্তর দিক) with subtle street flourish */}
        <div className="fmap-box__edge fmap-box__edge--right">
          <StreetFlourish />
          <span>{surroundings.northRightBn}</span>
          <StreetFlourish />
        </div>
      </div>

      {/* Bottom Edge Inside Same Box — EAST / Front (সামনের রাস্তা — পূর্ব দিক) */}
      <div className="fmap-box__edge fmap-box__edge--bottom">
        <StreetFlourish />
        <span>{surroundings.eastBottomBn}</span>
        <StreetFlourish />
      </div>
    </section>
  );
}
