/** Hand-drawn roof: stair room (সিঁড়ি ঘর), water tank and parapet, sitting on the building. */
export default function Roof() {
  return (
    <svg
      className="roof"
      viewBox="0 0 400 92"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <g fill="none" stroke="#1F2421" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Stair room */}
        <path d="M232 90 L233 44 L318 43 L317 90" fill="#F0EBE1" />
        <path d="M226 45 L325 43" stroke="#C85A32" strokeWidth="3" />
        <path d="M262 90 L262 62 Q263 56 270 56 L280 56 Q287 56 287 62 L287 90" />

        {/* Water tank on top of the stair room */}
        <path d="M246 43 L246 14 Q246 8 252 8 L298 8 Q304 8 304 14 L304 43" fill="#FFFFFF" />
        <path d="M246 20 L304 20 M246 31 L304 31" stroke="#C85A32" strokeWidth="1.6" />
        <path d="M270 8 L270 3 L281 3 L281 8" />

        {/* Parapet railing */}
        <path d="M30 90 L30 70 M30 72 L224 71" />
        <path d="M62 90 L62 72 M98 90 L98 72 M134 90 L134 72 M170 90 L170 72 M206 90 L206 72" strokeWidth="1.6" />
        <path d="M326 71 L370 72 L370 90 M348 90 L348 72" />

        {/* Small terracotta pennant for a homely touch */}
        <path d="M86 70 L86 40" strokeWidth="1.8" />
        <path d="M87 41 L108 47 L87 54 Z" fill="#C85A32" stroke="#C85A32" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
