/** 📍 Building location: address, local landmarks and an embedded Google Map. */
export default function LocationCard({ location }) {
  return (
    <article className="info-card">
      <h2 className="info-card__title">📍 বিল্ডিংয়ের লোকেশন</h2>
      <p className="info-card__address">{location.addressBn}</p>

      <ul className="landmarks">
        {location.landmarksBn.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>

      <div className="map-frame">
        <iframe
          title="বিল্ডিংয়ের লোকেশন ম্যাপ"
          src={location.mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <a className="text-link" href={location.mapLinkUrl} target="_blank" rel="noreferrer">
        গুগল ম্যাপে বড় করে দেখুন ➔
      </a>
    </article>
  );
}
