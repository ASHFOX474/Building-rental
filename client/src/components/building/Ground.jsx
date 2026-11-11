/** Ground line, steps and a few grass strokes under the building. */
export default function Ground() {
  return (
    <svg className="ground" viewBox="0 0 600 34" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="#1F2421" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8 Q150 5 300 8 T596 7" strokeWidth="2.6" />
        <path d="M40 16 L560 16" strokeWidth="1.2" strokeDasharray="2 9" stroke="#5C5852" />
        <g stroke="#2D6A4F" strokeWidth="1.6">
          <path d="M22 8 l-3 -6 M26 8 l1 -7 M30 8 l4 -5" />
          <path d="M572 8 l-3 -6 M576 8 l1 -7 M580 8 l4 -5" />
        </g>
      </g>
    </svg>
  );
}
