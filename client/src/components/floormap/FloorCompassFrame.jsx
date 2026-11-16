/**
 * Single consolidated rectangular frame wrapping the architectural floor map.
 * All 4 directional & environmental notes sit directly inside the same box
 * along its top, bottom, left, and right margins (no separate boxes, no road
 * graphics, and no compass rose).
 */
export default function FloorCompassFrame({ surroundings, children }) {
  return (
    <section className="fmap-box" aria-label="স্থাপত্য ফ্লোর ম্যাপ ও চারপাশের পরিবেশ">
      {/* Top Edge Inside Same Box — WEST (পশ্চিম দিক) */}
      <div className="fmap-box__edge fmap-box__edge--top">
        {surroundings.westTopBn}
      </div>

      <div className="fmap-box__middle">
        {/* Left Edge Inside Same Box — SOUTH (দক্ষিণ দিক) */}
        <div className="fmap-box__edge fmap-box__edge--left">
          {surroundings.southLeftBn}
        </div>

        {/* Center — Floor Map SVG (Directly in the same box, no inner border) */}
        <div className="fmap-box__plan">
          {children}
        </div>

        {/* Right Edge Inside Same Box — NORTH (উত্তর দিক) */}
        <div className="fmap-box__edge fmap-box__edge--right">
          {surroundings.northRightBn}
        </div>
      </div>

      {/* Bottom Edge Inside Same Box — EAST / Front (সামনের রাস্তা — পূর্ব দিক) */}
      <div className="fmap-box__edge fmap-box__edge--bottom">
        {surroundings.eastBottomBn}
      </div>
    </section>
  );
}
