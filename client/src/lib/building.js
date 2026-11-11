// Pure helpers that turn the floors array into what the building illustration needs.

/** Visible floors, ordered top (highest floorNumber) to bottom. */
export function stackFloors(floors) {
  return floors
    .filter((f) => f.isVisible !== false)
    .slice()
    .sort((a, b) => b.floorNumber - a.floorNumber);
}

/** Which outer wall a unit is closest to, based on its horizontal centre. */
export function unitSide(units, index) {
  const start = units.slice(0, index).reduce((sum, u) => sum + u.widthPct, 0);
  const centre = start + units[index].widthPct / 2;
  return centre < 50 ? 'left' : 'right';
}

/** URL of the Floor Map (Page 2) for a floor, highlighting one unit. */
export function floorMapUrl(floor, unit) {
  return `/floor/${floor.floorNumber}?unit=${encodeURIComponent(unit.id)}`;
}

/** Warn during development if a floor's widths don't add up to 100%. */
export function validateFloors(floors) {
  if (!import.meta.env.DEV) return;
  floors.forEach((f) => {
    const total = f.units.reduce((sum, u) => sum + u.widthPct, 0);
    if (Math.abs(total - 100) > 0.01) {
      console.warn(`Floor ${f.id}: unit widths sum to ${total}%, expected 100%.`);
    }
  });
}
