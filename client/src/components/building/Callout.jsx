import { Link } from 'react-router-dom';
import { floorMapUrl } from '../../lib/building.js';

/**
 * Bent (elbow) leader line in the margin outside the building, pointing at an
 * available flat's outer wall, with a hand-written "ক্লিক করুন" label.
 *
 * Drawn for the LEFT side (label on the far left, arrowhead touching the wall
 * on the right); the right-side version is mirrored with CSS.
 * Coordinates are percentages so the line stretches with the margin width.
 */
export default function Callout({ floor, unit, side, row }) {
  const markerId = `arrow-${unit.id}`;
  return (
    <Link
      to={floorMapUrl(floor, unit)}
      className={`callout callout--${side}`}
      style={{ gridRow: row }}
      aria-label={`ক্লিক করুন — ফ্ল্যাট ${unit.id} দেখুন`}
    >
      <svg className="callout__line" width="100%" height="100%" aria-hidden="true">
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M1 1 L9 5 L1 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {/* underline beneath the label */}
        <line x1="4%" y1="34%" x2="46%" y2="34%" />
        {/* diagonal bend down toward the flat's mid-height */}
        <line x1="46%" y1="34%" x2="62%" y2="56%" />
        {/* horizontal run into the wall, ending in an arrowhead */}
        <line x1="62%" y1="56%" x2="98%" y2="56%" markerEnd={`url(#${markerId})`} />
      </svg>
      <span className="callout__label">
        <span className="callout__dot" aria-hidden="true" />
        ক্লিক করুন
      </span>
    </Link>
  );
}
