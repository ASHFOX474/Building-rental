import UnitCell from './UnitCell.jsx';
import Callout from './Callout.jsx';
import Roof from './Roof.jsx';
import Ground from './Ground.jsx';
import { stackFloors, unitSide, validateFloors } from '../../lib/building.js';
import './building.css';

/**
 * The hand-drawn building. Layout is a 3-column grid:
 *   [left margin callouts] [building body] [right margin callouts]
 * with one grid row per floor, so callouts line up with their floor.
 */
export default function Building({ floors, showRentOnOccupied, onlyAvailable }) {
  validateFloors(floors);
  const stacked = stackFloors(floors);

  const callouts = [];
  stacked.forEach((floor, rowIndex) => {
    floor.units.forEach((unit, i) => {
      if (unit.status === 'available') {
        callouts.push({ floor, unit, side: unitSide(floor.units, i), row: rowIndex + 1 });
      }
    });
  });

  return (
    <section className="bldg" aria-label="ভবনের ফ্ল্যাটসমূহ" style={{ '--floors': stacked.length }}>
      <Roof />

      <div className="bldg__grid">
        <div className="bldg__sketch" aria-hidden="true" />
        <div className="bldg__body">
          {stacked.map((floor) => (
            <div className="floor" key={floor.id} role="group" aria-label={floor.nameBn}>
              {floor.units.map((unit, i) => (
                <UnitCell
                  key={unit.id}
                  floor={floor}
                  unit={unit}
                  side={unitSide(floor.units, i)}
                  showRentOnOccupied={showRentOnOccupied}
                  dimmed={onlyAvailable && unit.status !== 'available'}
                />
              ))}
            </div>
          ))}
        </div>

        {callouts.map((c) => (
          <Callout key={c.unit.id} {...c} />
        ))}
      </div>

      <Ground />
    </section>
  );
}
