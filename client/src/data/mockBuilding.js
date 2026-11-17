// Central initial data for the public website and the private family Admin Panel (/admin).
// Persisted in localStorage via BuildingContext so any change in /admin immediately
// updates Page 1 (/), Page 2 (/floor/:id), and Page 3 (/flat/:unitId).

export const STORAGE_SCHEMA_VERSION = 'moni-lodge-v2';

export const building = {
  name: 'মনি লজ',
  area: 'নোয়াখালী',
  perks: [
    'নিরাপদ আবাসিক পরিবেশ',
    '২৪ ঘণ্টা পানি ও সিসিটিভি নিরাপত্তা',
    'বর্ষায় জলাবদ্ধতামুক্ত রাস্তা',
  ],
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
        availableFromFullBn: 'এপ্রিল ২০২৭',
        inclusiveBills: true,
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
        driveVideoId: '',
        mainVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        driveFolderUrl: '',
        renterNameBn: '',
        renterPhone: '',
        roomsSummaryBn: '৩টি বেডরুম • ড্রয়িং-ডাইনিং • ২টি বাথরুম • ৩টি বারান্দা • কিচেন',
        facingBn: 'দক্ষিণ-পূর্ব মুখী (প্রচুর আলো-বাতাস)',
      },
      {
        id: 'E2',
        widthPct: 24,
        status: 'occupied',
        rent: 9500,
        bedrooms: 2,
        washrooms: 2,
        balconies: 2,
        renterNameBn: 'জনাব তানভীর আহমেদ',
        renterPhone: '01712345678',
      },
      {
        id: 'E3',
        widthPct: 38,
        status: 'occupied',
        rent: 12000,
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
        renterNameBn: 'জনাব মো. কামরুল হাসান',
        renterPhone: '01819223344',
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
        renterNameBn: 'জনাব ডা. মাহবুবুর রহমান',
        renterPhone: '01711889900',
      },
      {
        id: 'D2',
        widthPct: 24,
        status: 'occupied',
        rent: 9500,
        bedrooms: 2,
        washrooms: 2,
        balconies: 2,
        renterNameBn: 'জনাব সাইফুল ইসলাম',
        renterPhone: '01814556677',
      },
      {
        id: 'D3',
        widthPct: 38,
        status: 'available',
        rent: 12000,
        availableFrom: 'may',
        availableFromFullBn: 'মে ২০২৭',
        inclusiveBills: true,
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
        driveVideoId: '',
        mainVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        driveFolderUrl: '',
        renterNameBn: '',
        renterPhone: '',
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
        rent: 15000,
        bedrooms: 5,
        washrooms: 4,
        balconies: 4,
        renterNameBn: 'জনাব আলহাজ্ব আবদুল করিম',
        renterPhone: '01715667788',
      },
      {
        id: 'C2',
        widthPct: 38,
        status: 'occupied',
        rent: 12000,
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
        renterNameBn: 'জনাব মো. রফিকুল ইসলাম',
        renterPhone: '01817445566',
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
        renterNameBn: 'জনাব আনোয়ার হোসেন',
        renterPhone: '01911223344',
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
      {
        id: 'A1',
        widthPct: 45,
        status: 'occupied',
        rent: 11000,
        bedrooms: 3,
        washrooms: 2,
        balconies: 2,
        renterNameBn: 'জনাব নাজমুল হুদা',
        renterPhone: '01716778899',
      },
      {
        id: 'A2',
        widthPct: 55,
        status: 'occupied',
        rent: 12000,
        bedrooms: 3,
        washrooms: 2,
        balconies: 3,
        renterNameBn: 'জনাব মো. জহির উদ্দিন',
        renterPhone: '01818990011',
      },
    ],
  },
];

// Initial monthly rent ledger records (keyed by 'YYYY-MM' -> unitId).
// Pre-populated with varied states (ON_TIME, LATE, PARTIAL, and UNPAID) for 2026-11.
export const initialPaymentsByMonth = {
  '2026-11': {
    E3: {
      paidAmount: 12000,
      paymentDate: '2026-11-06',
      method: 'bKash',
      paidOnTime: true,
      note: '',
    },
    E2: {
      paidAmount: 6000,
      paymentDate: '2026-11-05',
      method: 'Cash',
      paidOnTime: true,
      note: 'প্রথম কিস্তি জমা, বাকি ৩,৫০০ টাকা ২০ তারিখে দেবেন',
    },
    D1: {
      paidAmount: 12000,
      paymentDate: '2026-11-05',
      method: 'Bank',
      paidOnTime: true,
      note: '',
    },
    // D2 is UNPAID (৳ ৯,৫০০ বাকি)
    C1: {
      paidAmount: 15000,
      paymentDate: '2026-11-08',
      method: 'Cash',
      paidOnTime: true,
      note: '',
    },
    // C2 is UNPAID (৳ ১২,০০০ বাকি)
    B2: {
      paidAmount: 12000,
      paymentDate: '2026-11-15',
      method: 'Cash',
      paidOnTime: false,
      note: '১০ তারিখের পরে দিয়েছেন',
    },
    A1: {
      paidAmount: 8000,
      paymentDate: '2026-11-07',
      method: 'bKash',
      paidOnTime: true,
      note: 'প্রথম কিস্তি বিকাশে দিয়েছেন',
    },
    A2: {
      paidAmount: 12000,
      paymentDate: '2026-11-09',
      method: 'bKash',
      paidOnTime: true,
      note: '',
    },
  },
  '2026-10': {
    E2: { paidAmount: 9500, paymentDate: '2026-10-07', method: 'Cash', paidOnTime: true, note: '' },
    E3: { paidAmount: 12000, paymentDate: '2026-10-06', method: 'bKash', paidOnTime: true, note: '' },
    D1: { paidAmount: 12000, paymentDate: '2026-10-04', method: 'Bank', paidOnTime: true, note: '' },
    D2: { paidAmount: 9500, paymentDate: '2026-10-14', method: 'Cash', paidOnTime: false, note: '' },
    C1: { paidAmount: 15000, paymentDate: '2026-10-08', method: 'Cash', paidOnTime: true, note: '' },
    C2: { paidAmount: 12000, paymentDate: '2026-10-09', method: 'bKash', paidOnTime: true, note: '' },
    B2: { paidAmount: 12000, paymentDate: '2026-10-05', method: 'Cash', paidOnTime: true, note: '' },
    A1: { paidAmount: 11000, paymentDate: '2026-10-10', method: 'Cash', paidOnTime: true, note: '' },
    A2: { paidAmount: 12000, paymentDate: '2026-10-07', method: 'bKash', paidOnTime: true, note: '' },
  },
};

// Default Admin-Organized Room-by-Room Media Sections using exact Floor-Map room names.
// Supports both 'image' and 'video' items inside every room section.
export const defaultRoomMediaSections = [
  {
    id: 'sec-drawing',
    category: 'drawing',
    titleBn: 'ড্রয়িং ও ডাইনিং রুম',
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
        id: 'dd-vid-1',
        type: 'video',
        labelBn: 'ড্রয়িং ও ডাইনিং রুমের সংক্ষিপ্ত ভিডিও',
        driveFileId: '',
        previewUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4',
      },
    ],
  },
  {
    id: 'sec-bed-1',
    category: 'bed-1',
    titleBn: 'বেডরুম ১ (পূর্ব মুখী — বারান্দাসহ)',
    items: [
      {
        id: 'b1-1',
        type: 'image',
        labelBn: 'বেডরুম ১ (দক্ষিণ-পূর্ব আলো-বাতাস ও জানালা)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'b1-2',
        type: 'image',
        labelBn: 'বেডরুম ১-এর সাথে সংযুক্ত পূর্বমুখী বারান্দা',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
      },
    ],
  },
  {
    id: 'sec-bed-2',
    category: 'bed-2',
    titleBn: 'বেডরুম ২ (উত্তর-পূর্ব কোণ — বারান্দাসহ)',
    items: [
      {
        id: 'b2-1',
        type: 'image',
        labelBn: 'বেডরুম ২ (দুই দিকে খোলামেলা জানালা)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1540518614846-7ede433c457?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'b2-2',
        type: 'image',
        labelBn: 'বেডরুম ২-এর সংযুক্ত বারান্দা',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      },
    ],
  },
  {
    id: 'sec-bed-3',
    category: 'bed-3',
    titleBn: 'বেডরুম ৩ (উত্তর-পশ্চিম কোণ — বাথরুম ও বারান্দাসহ)',
    items: [
      {
        id: 'b3-1',
        type: 'image',
        labelBn: 'বেডরুম ৩ ও সংযুক্ত বারান্দা',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'b3-2',
        type: 'image',
        labelBn: 'বেডরুম ৩-এর এটাচড হাই-কমোড বাথরুম',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      },
    ],
  },
  {
    id: 'sec-kitchen-bath',
    category: 'kitchen-bath',
    titleBn: 'কিচেন ও কমন টয়লেট',
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
        labelBn: 'কমন টয়লেট ও বাথরুম (সার্বক্ষণিক পানির সুবিধা)',
        driveFileId: '',
        previewUrl:
          'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=80',
      },
    ],
  },
];
