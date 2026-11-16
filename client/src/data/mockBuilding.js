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
    phone: '01815023898',
    whatsapp: '8801815023898',
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
    blueprintReady: false,
    isVisible: true,
    units: [
      {
        id: 'E1',
        widthPct: 38,
        status: 'available',
        rent: 10500,
        availableFrom: 'april',
        roomsSummaryBn: '৩টি বেডরুম • ড্রয়িং-ডাইনিং • ২টি বাথরুম • ২টি বারান্দা • কিচেন',
        facingBn: 'দক্ষিণ-পূর্ব মুখী (প্রচুর আলো-বাতাস)',
      },
      { id: 'E2', widthPct: 24, status: 'occupied', rent: 6500 },
      { id: 'E3', widthPct: 38, status: 'occupied', rent: 10500 },
    ],
  },
  {
    id: 'D',
    floorNumber: 4,
    nameBn: '৪র্থ তলা',
    titleBn: '৪র্থ তলা (ফ্লোর D: ইউনিট D1, D2 ও D3)',
    blueprintReady: false,
    isVisible: true,
    units: [
      { id: 'D1', widthPct: 38, status: 'occupied', rent: 10500 },
      { id: 'D2', widthPct: 24, status: 'occupied', rent: 6500 },
      {
        id: 'D3',
        widthPct: 38,
        status: 'available',
        rent: 10500,
        availableFrom: 'may',
        roomsSummaryBn: '৩টি বেডরুম • ড্রয়িং-ডাইনিং • ২টি বাথরুম • ৩টি বারান্দা • কিচেন',
        facingBn: 'উত্তর-পূর্ব মুখী (দুই দিকেই রাস্তা ও খোলা জায়গা)',
      },
    ],
  },
  {
    id: 'C',
    floorNumber: 3,
    nameBn: '৩য় তলা',
    titleBn: '৩য় তলা (ফ্লোর C: ইউনিট C1 ও C2)',
    blueprintReady: false,
    isVisible: true,
    units: [
      { id: 'C1', widthPct: 62, status: 'occupied', rent: 15000 },
      { id: 'C2', widthPct: 38, status: 'occupied', rent: 10500 },
    ],
  },
  {
    id: 'B',
    floorNumber: 2,
    nameBn: '২য় তলা',
    titleBn: '২য় তলা (ফ্লোর B: ইউনিট B1 ও B2)',
    blueprintReady: true,
    isVisible: true,
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
        rent: 10500,
        availableFrom: 'june',
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
      { id: 'A1', widthPct: 45, status: 'occupied', rent: 11000 },
      { id: 'A2', widthPct: 55, status: 'occupied', rent: 13000 },
    ],
  },
];
