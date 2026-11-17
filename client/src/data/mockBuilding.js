// Mock data for the public website. Will be replaced by GET /api/public/building.
//
// Floors are a dynamic array: add / remove / hide a floor here (later: from the
// Admin Panel) and the building illustration re-stacks itself automatically.
// Each floor's `units[].widthPct` must sum to 100. Matching cumulative
// percentages on different floors makes their divider lines align vertically:
//   E1+E2 = D1+D2 = C1 = B1 = 62%  ->  one continuous line down the building.
//
// Unit `status`:
//   'available' -> To-Let (clickable, gets a "ক্লিক করুন" callout)
//   'occupied'  -> rented by a tenant
//   'owner'     -> landlord's own flat (বাড়িওয়ালা), never for rent

export const building = {
  name: 'মনি লজ',
  area: 'নোয়াখালী',
  perks: [
    'নিরাপদ আবাসিক পরিবেশ',
    '২৪ ঘণ্টা পানি ও সিসিটিভি নিরাপত্তা',
    'বর্ষায় জলাবদ্ধতামুক্ত রাস্তা',
  ],
  // Owner setting: show rent amount on occupied flats too, or only "ভাড়া হয়ে গেছে".
  showRentOnOccupied: true,

  location: {
    addressBn: 'জহিরুল হক মিয়ার গ্যারেজ, জান্নাত প্লাজার পাশে।',
    conciseAddressBn:
      'জহিরুল হক মিয়ার গ্যারেজ (জান্নাত প্লাজা ও মারকাজুল হেকমাহ মাদ্রাসার পাশে)',
    fullAddressBn:
      'জহিরুল হক মিয়ার গ্যারেজ, জান্নাত প্লাজার পাশে (আলিপুরের দিকে রাস্তা ধরে মাত্র ৩–৪ মিনিট হাঁটার দূরত্বে, মারকাজুল হেকমাহ ইন্টারন্যাশনাল মাদ্রাসার পাশে)।',
    landmarksBn: [
      'আলিপুরের দিকে রাস্তা ধরে মাত্র ৩–৪ মিনিট হাঁটার দূরত্বে।',
      'মারকাজুল হেকমাহ ইন্টারন্যাশনাল মাদ্রাসার পাশে।',
    ],
    // Plain Google Maps embed (no API key needed), pinned via the Plus Code of "Moni Lodge".
    mapEmbedUrl: 'https://www.google.com/maps?q=Moni+Lodge,+V34V%2B4RG,+Noakhali&output=embed',
    mapLinkUrl: 'https://maps.app.goo.gl/ftChnHJmQ6modLxo9',
  },

  contact: {
    personBn: 'বাড়িওয়ালা / কেয়ারটেকার',
    phone: '01817526285',
    phoneSecondary: '01815023898',
    phones: [
      { raw: '01817526285', display: '01817-526285', displayBn: '০১৮১৭-৫২৬২৮৫' },
      { raw: '01815023898', display: '01815-023898', displayBn: '০১৮১৫-০২৩৮৯৮' },
    ],
    whatsapp: '8801815023898',
    externalMediaUrl: 'http://tiny.cc/FlatsPhotosAndVideo',
  },

  // Surrounding environment context for the architectural floor map (Top = West)
  surroundings: {
    westTopBn: '⬅️ পশ্চিম দিক — আমাদের নিজস্ব খালি জায়গা (খোলামেলা পরিবেশ)',
    eastBottomBn: '🛣️ সামনের রাস্তা (পূর্ব দিক) — রাস্তার ওপারে ভবন',
    northRightBn: '🛣️ উত্তর পাশের রাস্তা ও খোলা প্লট (কোনো বিল্ডিং নেই — প্রচুর আলো-বাতাস 🍃)',
    southLeftBn: '☀️ দক্ষিণ দিক (দক্ষিণা বাতাস)',
  },
};

export const floors = [
  {
    id: 'E',
    floorNumber: 5,
    nameBn: '৫ম তলা',
    titleBn: '৫ম তলা (ফ্লোর E: ইউনিট E1, E2 ও E3)',
    blueprintReady: true,
    isVisible: true,
    legendPills: [
      { swatch: 'green', textBn: 'ইউনিট E1 (বাম পাশ)' },
      { swatch: 'ochre', textBn: 'ইউনিট E2 (মাঝখান)' },
      { swatch: 'tenant', textBn: 'ইউনিট E3 (ডান পাশ)' },
      { swatch: 'stairs', textBn: 'সিঁড়ি ঘর' },
    ],
    units: [
      {
        id: 'E1',
        widthPct: 38,
        status: 'available',
        rent: 12000,
        availableFrom: 'april',
        availableFromFullBn: 'এপ্রিল ২০২৭ থেকে',
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
        driveVideoId: '',
        roomsSummaryBn: '৩টি বেডরুম • ড্রয়িং-ডাইনিং • ২টি বাথরুম • ৩টি বারান্দা • কিচেন',
        facingBn: 'দক্ষিণ-পূর্ব মুখী (প্রচুর আলো-বাতাস)',
      },
      {
        id: 'E2',
        widthPct: 24,
        status: 'occupied',
        rent: 8500,
        bedrooms: 2,
        washrooms: 2,
        balconies: 2,
      },
      {
        id: 'E3',
        widthPct: 38,
        status: 'occupied',
        rent: 12000,
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
      },
    ],
  },
  {
    id: 'D',
    floorNumber: 4,
    nameBn: '৪র্থ তলা',
    titleBn: '৪র্থ তলা (ফ্লোর D: ইউনিট D1, D2 ও D3)',
    blueprintReady: true,
    isVisible: true,
    legendPills: [
      { swatch: 'green', textBn: 'ইউনিট D1 (বাম পাশ)' },
      { swatch: 'ochre', textBn: 'ইউনিট D2 (মাঝখান)' },
      { swatch: 'tenant', textBn: 'ইউনিট D3 (ডান পাশ)' },
      { swatch: 'stairs', textBn: 'সিঁড়ি ঘর' },
    ],
    units: [
      {
        id: 'D1',
        widthPct: 38,
        status: 'occupied',
        rent: 12000,
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
      },
      {
        id: 'D2',
        widthPct: 24,
        status: 'occupied',
        rent: 8500,
        bedrooms: 2,
        washrooms: 2,
        balconies: 2,
      },
      {
        id: 'D3',
        widthPct: 38,
        status: 'available',
        rent: 12000,
        availableFrom: 'may',
        availableFromFullBn: 'মে ২০২৭ থেকে',
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
        driveVideoId: '',
        roomsSummaryBn: '৩টি বেডরুম • ড্রয়িং-ডাইনিং • ২টি বাথরুম • ৩টি বারান্দা • কিচেন',
        facingBn: 'উত্তর-পূর্ব মুখী (দুই দিকেই রাস্তা ও খোলা জায়গা)',
      },
    ],
  },
  {
    id: 'C',
    floorNumber: 3,
    nameBn: '৩য় তলা',
    titleBn: '৩য় তলা (ফ্লোর C: ইউনিট C1 ও C2)',
    blueprintReady: true,
    isVisible: true,
    legendPills: [
      {
        swatch: 'green',
        textBn: 'ইউনিট C1: ভাড়াটিয়ার ইউনিট — বড় ফ্ল্যাট (ছবি ও ভিডিও দেখতে ক্লিক করুন)',
      },
      {
        swatch: 'tenant',
        textBn: 'ইউনিট C2: ভাড়াটিয়ার ইউনিট (ছবি ও ভিডিও দেখতে ক্লিক করুন)',
      },
      {
        swatch: 'stairs',
        textBn: 'সিঁড়ি ঘর ও প্রবেশপথ',
      },
    ],
    units: [
      {
        id: 'C1',
        widthPct: 62,
        status: 'occupied',
        rent: 16000,
        bedrooms: 5,
        washrooms: 4,
        balconies: 4,
      },
      {
        id: 'C2',
        widthPct: 38,
        status: 'occupied',
        rent: 12000,
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
      },
    ],
  },
  {
    id: 'B',
    floorNumber: 2,
    nameBn: '২য় তলা',
    titleBn: '২য় তলা (ফ্লোর B: ইউনিট B1 ও B2)',
    blueprintReady: true,
    isVisible: true,
    legendPills: [
      {
        swatch: 'owner',
        textBn: 'ইউনিট B1: বাড়িওয়ালা (মালিকের নিজস্ব বাসস্থান)',
      },
      {
        swatch: 'tenant',
        textBn: 'ইউনিট B2: ভাড়াটিয়ার ইউনিট (ছবি ও ভিডিও দেখতে ক্লিক করুন)',
      },
      {
        swatch: 'stairs',
        textBn: 'সিঁড়ি ঘর ও প্রবেশপথ',
      },
    ],
    units: [
      {
        id: 'B1',
        widthPct: 62,
        status: 'owner',
        ownerLabelBn: 'ইউনিট B1 — বাড়িওয়ালা',
        ownerSubtextBn: '(মালিকের নিজস্ব বাসভবন)',
        roomsSummaryBn: '৪টি বেডরুম • বড় ড্রয়িং ও ডাইনিং • ৪টি বাথরুম • ৬টি বারান্দা • কিচেন',
      },
      {
        id: 'B2',
        widthPct: 38,
        status: 'occupied',
        rent: 12000,
        availableFrom: 'june',
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
        roomsSummaryBn: '৩টি বেডরুম • ড্রয়িং-ডাইনিং • ২টি বাথরুম • ৩টি বারান্দা • কিচেন',
        facingBn: 'উত্তর-পূর্ব মুখী (দুই দিকেই রাস্তা ও খোলা জায়গা)',
        tenantTypeBn: 'শুধুমাত্র ফ্যামিলি',
      },
    ],
  },
  {
    id: 'A',
    floorNumber: 1,
    nameBn: '১ম তলা',
    titleBn: '১ম তলা (ফ্লোর A: ইউনিট A1 ও A2)',
    blueprintReady: false,
    isVisible: true,
    units: [
      { id: 'A1', widthPct: 45, status: 'occupied', rent: 11000, bedrooms: 3, washrooms: 2, balconies: 2 },
      { id: 'A2', widthPct: 55, status: 'occupied', rent: 12000, bedrooms: 3, washrooms: 2, balconies: 3 },
    ],
  },
];

// Default Admin-Organized Room-by-Room Media Sections for available flats.
// When a real `driveFileId` is set from the Admin Panel, the frontend loads:
//   https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1000
export const defaultRoomMediaSections = [
  {
    id: 'sec-drawing',
    category: 'drawing',
    titleBn: '১. ড্রয়িং ও ডাইনিং রুম',
    items: [
      {
        id: 'dd-1',
        type: 'image',
        labelBn: 'প্রশস্ত ড্রয়িং ও ডাইনিং রুম (দেয়ালে টাইলস ফিনিশিং)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'dd-2',
        type: 'image',
        labelBn: 'ডাইনিং স্পেস ও প্রাকৃতিক আলো-বাতাস',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'dd-3',
        type: 'image',
        labelBn: 'ড্রয়িং রুমের মেইন এন্ট্রি ও ফ্লোর টাইলস',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
      },
    ],
  },
  {
    id: 'sec-master',
    category: 'master',
    titleBn: '২. মাস্টার বেডরুম ও এটাচড বাথরুম',
    items: [
      {
        id: 'mb-1',
        type: 'image',
        labelBn: 'মাস্টার বেডরুম (দক্ষিণ-পূর্ব মুখী জানালা ও বারান্দা)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'mb-2',
        type: 'image',
        labelBn: 'মাস্টার বেডরুমের সাথে সংযুক্ত বারান্দা',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'mb-3',
        type: 'image',
        labelBn: 'এটাচড বাথরুম (হাই-কমোড ও আধুনিক ফিটিংস)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      },
    ],
  },
  {
    id: 'sec-other-beds',
    category: 'other-bedrooms',
    titleBn: '৩. ২য় ও ৩য় বেডরুম ও বারান্দা',
    items: [
      {
        id: 'ob-1',
        type: 'image',
        labelBn: '২য় বেডরুম (পর্যাপ্ত আলো-বাতাস ও সংযুক্ত বারান্দা)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1540518614846-7ede433c457?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'ob-2',
        type: 'image',
        labelBn: '৩য় বেডরুম (উত্তর-পূর্ব কোণ)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'ob-3',
        type: 'image',
        labelBn: 'খোলামেলা বারান্দা ও বাইরের ভিউ',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      },
    ],
  },
  {
    id: 'sec-kitchen-bath',
    category: 'kitchen-bath',
    titleBn: '৪. কিচেন ও কমন বাথরুম',
    items: [
      {
        id: 'kb-1',
        type: 'image',
        labelBn: 'আধুনিক ও সুপরিকল্পিত কিচেন (লাইনের গ্যাস ও সিঙ্ক)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'kb-2',
        type: 'image',
        labelBn: 'কিচেন কেবিনেট ও দেয়ালের টাইলস',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'kb-3',
        type: 'image',
        labelBn: 'কমন বাথরুম (সার্বক্ষণিক পানির সুবিধা)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=80',
      },
    ],
  },
];
