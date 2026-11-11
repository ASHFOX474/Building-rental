import { toBanglaDigits } from '../../lib/bangla.js';

const WHATSAPP_TEXT =
  'আসসালামু আলাইকুম, আমি ওয়েবসাইটে আপনার বিল্ডিংয়ের টু-লেট দেখেছি। খালি ফ্ল্যাট সম্পর্কে জানতে চাই।';

/** 📞 Direct contact: 1-tap phone call and WhatsApp with pre-filled Bangla text. */
export default function ContactCard({ contact }) {
  const waUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;
  const phoneBn = toBanglaDigits(contact.phone.replace(/^(\d{5})(\d{6})$/, '$1-$2'));

  return (
    <article className="info-card info-card--contact">
      <h2 className="info-card__title">📞 সরাসরি যোগাযোগ</h2>
      <p className="info-card__muted">{contact.personBn}</p>
      <p className="contact__phone">{phoneBn}</p>
      <p className="info-card__muted">
        ফ্ল্যাট দেখতে চাইলে আগে ফোন করে সময় ঠিক করে নিন। সকাল ৯টা থেকে রাত ৯টা পর্যন্ত কল করতে পারেন।
      </p>

      <div className="contact__actions">
        <a className="btn btn--primary" href={`tel:${contact.phone}`}>
          📞 কল করুন
        </a>
        <a className="btn btn--whatsapp" href={waUrl} target="_blank" rel="noreferrer">
          💬 হোয়াটসঅ্যাপে মেসেজ দিন
        </a>
      </div>
    </article>
  );
}
