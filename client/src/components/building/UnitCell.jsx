import { Link } from 'react-router-dom';
import { formatTaka, monthBn } from '../../lib/bangla.js';
import { floorMapUrl } from '../../lib/building.js';

/**
 * One flat box inside a floor row. Three states:
 *  - available: To-Let, clickable -> Floor Map
 *  - occupied : rented, muted
 *  - owner    : landlord's own flat (বাড়িওয়ালা)
 */
export default function UnitCell({ floor, unit, side, showRentOnOccupied, dimmed }) {
  const style = { flexBasis: `${unit.widthPct}%` };
  const classes = ['unit', `unit--${unit.status}`, dimmed && 'unit--dimmed']
    .filter(Boolean)
    .join(' ');

  if (unit.status === 'available') {
    return (
      <Link
        to={floorMapUrl(floor, unit)}
        className={classes}
        style={style}
        aria-label={`ফ্ল্যাট ${unit.id}, ${floor.nameBn} — ভাড়া হবে, ${monthBn(unit.availableFrom)} থেকে। ফ্লোর ম্যাপ দেখুন`}
      >
        <div className="unit__inner">
          <span className="unit__id">{unit.id}</span>
          <span className="unit__rent">
            ভাড়া: <strong>{formatTaka(unit.rent)}/=</strong>
          </span>
          <span className="unit__from">
            খালি: <strong>{monthBn(unit.availableFrom)}</strong> হতে
          </span>
        </div>
        {/* Compact pulsing badge, replaces the outside callout on narrow phones */}
        <span className={`unit__badge unit__badge--${side}`} aria-hidden="true">
          ক্লিক করুন
        </span>
      </Link>
    );
  }

  if (unit.status === 'owner') {
    return (
      <div className={classes} style={style} aria-label={`ফ্ল্যাট ${unit.id} — বাড়িওয়ালা`}>
        <div className="unit__inner">
          <span className="unit__id">{unit.id}</span>
          <span className="unit__owner">বাড়িওয়ালা</span>
        </div>
      </div>
    );
  }

  return (
    <div className={classes} style={style} aria-label={`ফ্ল্যাট ${unit.id} — ভাড়া হয়ে গেছে`}>
      <div className="unit__inner">
        <span className="unit__id">{unit.id}</span>
        {showRentOnOccupied && unit.rent && (
          <span className="unit__rent">ভাড়া: {formatTaka(unit.rent)}/=</span>
        )}
        <span className="unit__taken">ভাড়া হয়ে গেছে</span>
      </div>
    </div>
  );
}
