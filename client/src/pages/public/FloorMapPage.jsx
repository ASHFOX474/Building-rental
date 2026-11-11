import { Link, useParams, useSearchParams } from 'react-router-dom';
import { toBanglaDigits } from '../../lib/bangla.js';

/** Page 2 placeholder — the Floor Map blueprint view will be built next. */
export default function FloorMapPage() {
  const { floorNumber } = useParams();
  const [params] = useSearchParams();
  const unit = params.get('unit');

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px' }}>
      <Link to="/" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>
        ⬅ হোম পেজে ফিরে যান
      </Link>
      <h1>{toBanglaDigits(floorNumber)} তলার ফ্লোর ম্যাপ</h1>
      {unit && <p>নির্বাচিত ফ্ল্যাট: <strong>{unit}</strong></p>}
      <p style={{ color: 'var(--text-muted)' }}>এই পেজটি শীঘ্রই তৈরি হবে।</p>
    </div>
  );
}
