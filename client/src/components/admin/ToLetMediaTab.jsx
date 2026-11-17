import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBuilding } from '../../context/BuildingContext.jsx';
import { defaultRoomMediaSections } from '../../data/mockBuilding.js';
import { isUnitAvailable } from '../floormap/UnitStatusElements.jsx';
import { formatTaka, toBanglaDigits, toAsciiDigits } from '../../lib/bangla.js';

/** Extract a clean Google Drive File ID from either a raw ID or a full Drive sharing URL. */
export function extractDriveFileId(input) {
  if (!input) return '';
  const trimmed = String(input).trim();
  const matchFromPath = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFromPath) return matchFromPath[1];
  const matchFromQuery = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchFromQuery) return matchFromQuery[1];
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) return trimmed;
  return '';
}

/** Compress an uploaded image file to a Data URL so it persists cleanly in localStorage. */
function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(URL.createObjectURL(file));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1000;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
}

const MONTH_PRESETS = [
  { key: 'january', fullBn: 'জানুয়ারি ২০২৭' },
  { key: 'february', fullBn: 'ফেব্রুয়ারি ২০২৭' },
  { key: 'march', fullBn: 'মার্চ ২০২৭' },
  { key: 'april', fullBn: 'এপ্রিল ২০২৭' },
  { key: 'may', fullBn: 'মে ২০২৭' },
  { key: 'november', fullBn: 'চলতি মাস' },
];

/** Deep-clone the default room sections tailored to a unit's bedroom count. */
function getInitialSectionsForUnit(unit) {
  if (Array.isArray(unit?.mediaSections)) {
    return unit.mediaSections;
  }
  const is2Bed = unit?.bedrooms === 2;
  return defaultRoomMediaSections
    .filter((sec) => !(is2Bed && sec.id === 'sec-bed-3'))
    .map((sec) => ({
      ...sec,
      items: sec.items.map((it) => ({ ...it })),
    }));
}

/** Count total photos and videos configured for a unit. */
function countUnitMedia(unit) {
  const sections = getInitialSectionsForUnit(unit);
  let photos = 0;
  let videos = unit?.driveVideoId || unit?.mainVideoUrl ? 1 : 0;
  sections.forEach((sec) => {
    (sec.items || []).forEach((it) => {
      if (it.type === 'video') videos += 1;
      else photos += 1;
    });
  });
  return { photos, videos };
}

/** Format the Google Drive folder hierarchy path for a floor and unit. */
function getDriveFolderHierarchyLabel(floor, unitId) {
  constengFloorOrdinal =
    floor.floorNumber === 5
      ? '4th Floor'
      : floor.floorNumber === 4
      ? '3rd Floor'
      : floor.floorNumber === 3
      ? '2nd Floor'
      : floor.floorNumber === 2
      ? '1st Floor'
      : 'Ground Floor';
  return `All flats images and video / ${thengFloorOrdinal(floor.floorNumber)} - ${floor.nameBn} (Floor ${floor.id}) / ${unitId}`;
}

function thengFloorOrdinal(floorNumber) {
  if (floorNumber === 5) return '4th Floor';
  if (floorNumber === 4) return '3rd Floor';
  if (floorNumber === 3) return '2nd Floor';
  if (floorNumber === 2) return '1st Floor';
  return 'Ground Floor';
}

/**
 * Tab 2: "🏠 ২. টু-লেট ও ছবি আপলোড"
 * Complete Live To-Let Availability Controller & Google Drive Room-by-Room Media Manager.
 */
export default function ToLetMediaTab({ initialUnitId = 'E1' }) {
  const { floors, updateUnit } = useBuilding();

  // Floors ordered 5th floor (E) down to 1st floor (A)
  const orderedFloors = floors
    .filter((f) => f.isVisible !== false)
    .slice()
    .sort((a, b) => b.floorNumber - a.floorNumber);

  // Default to first available unit or initialUnitId
  const [selectedUnitId, setSelectedUnitId] = useState(() => {
    if (initialUnitId && initialUnitId !== 'B1') return initialUnitId;
    const firstOpen = orderedFloors
      .flatMap((f) => f.units)
      .find((u) => isUnitAvailable(u));
    return firstOpen?.id || 'E1';
  });

  useEffect(() => {
    if (initialUnitId && initialUnitId !== 'B1') {
      setSelectedUnitId(initialUnitId);
    }
  }, [initialUnitId]);

  // Locate selected unit and its floor
  let selectedFloor = orderedFloors[0];
  let selectedUnit = orderedFloors[0]?.units[0];
  for (const f of orderedFloors) {
    const found = f.units.find((u) => u.id === selectedUnitId);
    if (found) {
      selectedFloor = f;
      selectedUnit = found;
      break;
    }
  }

  // UI states for Step 3 (Drive Sync), Step 4 (Main Video), and Step 5 (Room Sections)
  const [syncingDrive, setSyncingDrive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [replacingMainVideo, setReplacingMainVideo] = useState(false);
  const [uploadingMainVideo, setUploadingMainVideo] = useState(false);
  const [mainDriveLinkInput, setMainDriveLinkInput] = useState('');
  const [customMonthMode, setCustomMonthMode] = useState(false);

  // Room Section Creator & Editor states
  const [showCustomRoomInput, setShowCustomRoomInput] = useState(false);
  const [customRoomTitle, setCustomRoomTitle] = useState('');
  const [editingSecId, setEditingSecId] = useState(null);
  const [editingSecTitle, setEditingSecTitle] = useState('');
  const [confirmDeleteSecId, setConfirmDeleteSecId] = useState(null);
  const [uploadingSecId, setUploadingSecId] = useState(null);
  const [openLinkPanelSecId, setOpenLinkPanelSecId] = useState(null);
  const [newLinkType, setNewLinkType] = useState('image');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCaption, setNewLinkCaption] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? '' : cur));
    }, 4000);
  };

  if (!selectedUnit) return null;

  const isAvailable = isUnitAvailable(selectedUnit);
  const unitSections = getInitialSectionsForUnit(selectedUnit);
  const currentRent = Number(selectedUnit.rent) || 12000;
  const inclusiveBills = selectedUnit.inclusiveBills !== false;
  const currentFromFullBn =
    selectedUnit.availableFromFullBn || 'এপ্রিল ২০২৭';
  const hasMainVideo = Boolean(
    selectedUnit.driveVideoId || selectedUnit.mainVideoUrl
  );

  // Save updated sections array into the central store for the selected unit
  const saveUnitSections = (nextSections) => {
    updateUnit(selectedUnit.id, { mediaSections: nextSections });
  };

  // =========================================================================
  // STEP 2 HANDLERS: Availability Toggle, Month, Rent (+/- 500), Inclusive Bills
  // =========================================================================
  const handleToggleAvailability = (makeAvailable) => {
    updateUnit(selectedUnit.id, (u) => ({
      status: makeAvailable ? 'available' : 'occupied',
      is_to_let: makeAvailable,
      availableFrom: u.availableFrom || 'april',
      availableFromFullBn: u.availableFromFullBn || 'এপ্রিল ২০২৭',
      mediaSections: getInitialSectionsForUnit(u),
    }));
    showToast(
      makeAvailable
        ? `✅ ইউনিট ${selectedUnit.id}-এর টু-লেট বিজ্ঞাপন চালু হয়েছে! এখন পাবলিক পেজে দেখা যাচ্ছে।`
        : `🔒 ইউনিট ${selectedUnit.id} "ভাড়া হয়ে গেছে" হিসেবে চিহ্নিত হয়েছে এবং ছবি লুকানো হয়েছে।`
    );
  };

  const handleSelectMonthPreset = (preset) => {
    setCustomMonthMode(false);
    updateUnit(selectedUnit.id, {
      availableFrom: preset.key,
      availableFromFullBn: preset.fullBn,
    });
  };

  const handleRentStep = (delta) => {
    const nextRent = Math.max(1000, currentRent + delta);
    updateUnit(selectedUnit.id, { rent: nextRent });
  };

  const handleRentInputChange = (val) => {
    const ascii = toAsciiDigits(val).replace(/\D/g, '');
    updateUnit(selectedUnit.id, { rent: Number(ascii) || 0 });
  };

  // =========================================================================
  // STEP 3 HANDLER: 1-Click Google Drive Folder Auto-Sync
  // =========================================================================
  const handleSyncDriveFolder = () => {
    setSyncingDrive(true);
    setTimeout(() => {
      const syncedSections = getInitialSectionsForUnit({
        ...selectedUnit,
        mediaSections: null, // Re-sync fresh sections from Drive template
      });
      // Merge any custom sections the user already added while ensuring all default Drive folders exist
      const existingById = new Map(unitSections.map((s) => [s.id, s]));
      const merged = syncedSections.map((defSec) =>
        existingById.has(defSec.id) ? existingById.get(defSec.id) : defSec
      );
      unitSections.forEach((s) => {
        if (!merged.some((m) => m.id === s.id)) merged.push(s);
      });

      updateUnit(selectedUnit.id, (u) => ({
        mediaSections: merged,
        mainVideoUrl:
          u.mainVideoUrl ||
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      }));
      setSyncingDrive(false);
      showToast(
        `✅ গুগল ড্রাইভ থেকে ইউনিট ${selectedUnit.id}-এর সকল রুমের ছবি ও ভিডিও সফলভাবে সিঙ্ক হয়েছে!`
      );
    }, 900);
  };

  // =========================================================================
  // STEP 4 HANDLERS: Main Walkthrough Video (Upload / Paste Link / Delete)
  // =========================================================================
  const handleMainVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMainVideo(true);
    const objectUrl = URL.createObjectURL(file);
    setTimeout(() => {
      updateUnit(selectedUnit.id, {
        mainVideoUrl: objectUrl,
        driveVideoId: '',
        mainVideoFileName: file.name,
      });
      setUploadingMainVideo(false);
      setReplacingMainVideo(false);
      showToast(
        `✅ মেইন ভিডিও (${file.name}) সফলভাবে আপলোড ও সংযুক্ত হয়েছে!`
      );
    }, 700);
  };

  const handleSaveMainDriveLink = () => {
    const trimmed = mainDriveLinkInput.trim();
    if (!trimmed) return;
    const extractedId = extractDriveFileId(trimmed);
    if (extractedId) {
      updateUnit(selectedUnit.id, {
        driveVideoId: extractedId,
        mainVideoUrl: '',
      });
    } else {
      updateUnit(selectedUnit.id, {
        mainVideoUrl: trimmed,
        driveVideoId: '',
      });
    }
    setMainDriveLinkInput('');
    setReplacingMainVideo(false);
    showToast(`✅ গুগল ড্রাইভ মেইন ভিডিও সফলভাবে যুক্ত হয়েছে!`);
  };

  const handleDeleteMainVideo = () => {
    updateUnit(selectedUnit.id, {
      driveVideoId: '',
      mainVideoUrl: '',
      mainVideoFileName: '',
    });
    setReplacingMainVideo(false);
    showToast(`🗑️ ইউনিট ${selectedUnit.id}-এর মেইন ভিডিও মুছে ফেলা হয়েছে।`);
  };

  // =========================================================================
  // STEP 5 HANDLERS: Room-by-Room Media Sections (Add, Rename, Reorder, Delete, Upload)
  // =========================================================================
  const bedroomsCount = selectedUnit.bedrooms || 3;

  const presetRoomButtons = [
    { category: 'drawing', titleBn: 'ড্রয়িং ও ডাইনিং রুম' },
    { category: 'bed-1', titleBn: 'বেডরুম ১ (পূর্ব মুখী — বারান্দাসহ)' },
    { category: 'bed-2', titleBn: 'বেডরুম ২ (উত্তর-পূর্ব কোণ — বারান্দাসহ)' },
    ...(bedroomsCount >= 3
      ? [
          {
            category: 'bed-3',
            titleBn: 'বেডরুম ৩ (উত্তর-পশ্চিম কোণ — বাথরুম ও বারান্দাসহ)',
          },
        ]
      : []),
    ...(bedroomsCount >= 4
      ? [
          { category: 'bed-4', titleBn: 'বেডরুম ৪ (পূর্ব মুখী — বারান্দাসহ)' },
          {
            category: 'bed-5',
            titleBn: 'বেডরুম ৫ (পশ্চিম মুখী — বাথরুম ও বারান্দাসহ)',
          },
        ]
      : []),
    { category: 'kitchen', titleBn: 'কিচেন (রান্নাঘর)' },
    { category: 'toilet-bath', titleBn: 'কমন টয়লেট ও বাথরুম' },
    { category: 'veranda', titleBn: 'বারান্দা ও অন্যান্য' },
  ];

  const handleAddRoomSection = (titleBn, category = 'custom') => {
    const cleanTitle = titleBn.trim();
    if (!cleanTitle) return;
    const newSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category,
      titleBn: cleanTitle,
      items: [],
    };
    const nextSections = [...unitSections, newSection];
    saveUnitSections(nextSections);
    setCustomRoomTitle('');
    setShowCustomRoomInput(false);
    showToast(`➕ "${cleanTitle}" সেকশনটি যোগ করা হয়েছে! এখন ছবি ও ভিডিও আপলোড করুন।`);
  };

  const handleMoveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= unitSections.length) return;
    const copy = unitSections.slice();
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    saveUnitSections(copy);
  };

  const handleSaveSectionRename = (secId) => {
    if (!editingSecTitle.trim()) return;
    const next = unitSections.map((s) =>
      s.id === secId ? { ...s, titleBn: editingSecTitle.trim() } : s
    );
    saveUnitSections(next);
    setEditingSecId(null);
    setEditingSecTitle('');
  };

  const handleDeleteSection = (secId) => {
    const next = unitSections.filter((s) => s.id !== secId);
    saveUnitSections(next);
    setConfirmDeleteSecId(null);
    showToast('🗑️ রুম সেকশনটি মুছে ফেলা হয়েছে।');
  };

  const handleMultiFileUploadToSection = async (secId, fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    setUploadingSecId(secId);
    const createdItems = [];
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const previewUrl = await fileToDataUrl(file);
      createdItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: isVideo ? 'video' : 'image',
        labelBn: file.name.replace(/\.[^/.]+$/, ''),
        driveFileId: '',
        previewUrl,
      });
    }

    setTimeout(() => {
      const next = unitSections.map((sec) =>
        sec.id === secId
          ? { ...sec, items: [...sec.items, ...createdItems] }
          : sec
      );
      saveUnitSections(next);
      setUploadingSecId(null);
      showToast(
        `✅ ${toBanglaDigits(createdItems.length)}টি ফাইল সফলভাবে এই রুমে যোগ হয়েছে!`
      );
    }, 550);
  };

  const handleAddDriveLinkToSection = (secId) => {
    const trimmed = newLinkUrl.trim();
    if (!trimmed) return;
    const extractedId = extractDriveFileId(trimmed);
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: newLinkType,
      labelBn:
        newLinkCaption.trim() ||
        (newLinkType === 'video' ? 'রুমের ভিডিও' : 'রুমের ছবি'),
      driveFileId: extractedId,
      previewUrl: extractedId ? '' : trimmed,
    };
    const next = unitSections.map((sec) =>
      sec.id === secId ? { ...sec, items: [...sec.items, newItem] } : sec
    );
    saveUnitSections(next);
    setNewLinkUrl('');
    setNewLinkCaption('');
    setOpenLinkPanelSecId(null);
    showToast('✅ গুগল ড্রাইভ লিংক সফলভাবে এই রুমে যুক্ত হয়েছে!');
  };

  const handleDeleteMediaItem = (secId, itemId) => {
    const next = unitSections.map((sec) =>
      sec.id === secId
        ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) }
        : sec
    );
    saveUnitSections(next);
  };

  const handleUpdateItemCaption = (secId, itemId, newCaption) => {
    const next = unitSections.map((sec) =>
      sec.id === secId
        ? {
            ...sec,
            items: sec.items.map((it) =>
              it.id === itemId ? { ...it, labelBn: newCaption } : it
            ),
          }
        : sec
    );
    saveUnitSections(next);
  };

  return (
    <div className="adm-tolet">
      {/* Live Toast Notification Banner */}
      {toastMessage && (
        <div className="adm-toast" role="status" aria-live="polite">
          <span>{toastMessage}</span>
          <button
            type="button"
            className="adm-toast__close"
            onClick={() => setToastMessage('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* =====================================================================
          STEP 1: VISUAL UNIT SELECTOR BAR (কোন ফ্ল্যাটটি এডিট করতে চান?)
         ===================================================================== */}
      <section className="adm-puthi-card adm-selector-card" aria-label="ফ্ল্যাট নির্বাচন করুন">
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />
        <h2 className="adm-step-title">
          ১. কোন ফ্ল্যাটটির টু-লেট বা ছবি এডিট করতে চান? (এখানে চাপুন)
        </h2>

        <div className="adm-unit-selector-groups">
          {orderedFloors.map((floor) => (
            <div key={floor.id} className="adm-selector-floor-row">
              <span className="adm-selector-floor-row__label">
                {floor.nameBn} ({floor.id}):
              </span>

              <div className="adm-selector-floor-row__units">
                {floor.units.map((unit) => {
                  if (unit.status === 'owner') {
                    return (
                      <div
                        key={unit.id}
                        className="adm-unit-select-btn adm-unit-select-btn--owner"
                        title="বাড়িওয়ালার নিজস্ব বাসভবন"
                      >
                        <span className="adm-unit-select-btn__id">
                          ইউনিট {unit.id} ({floor.nameBn})
                        </span>
                        <span className="adm-unit-select-btn__status">
                          🏠 বাড়িওয়ালা
                        </span>
                      </div>
                    );
                  }

                  const open = isUnitAvailable(unit);
                  const active = unit.id === selectedUnit.id;
                  const { photos, videos } = countUnitMedia(unit);

                  return (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => setSelectedUnitId(unit.id)}
                      className={`adm-unit-select-btn ${
                        active ? 'adm-unit-select-btn--active' : ''
                      } ${open ? 'adm-unit-select-btn--open' : ''}`}
                      aria-pressed={active}
                    >
                      <span className="adm-unit-select-btn__id">
                        ইউনিট {unit.id} ({floor.nameBn})
                      </span>
                      <span
                        className={`adm-unit-select-btn__status ${
                          open
                            ? 'adm-unit-select-btn__status--open'
                            : 'adm-unit-select-btn__status--occupied'
                        }`}
                      >
                        {open ? '🟢 ভাড়া হবে (টু-লেট চালু)' : '⚪ ভাড়া হয়ে গেছে'}
                      </span>
                      <span className="adm-unit-select-btn__media">
                        📸 {toBanglaDigits(photos)}টি ছবি • 🎥 {toBanglaDigits(videos)}টি ভিডিও
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          STEP 2: GIANT LIVE "TO-LET" SWITCH & RENT TERMS BOX
         ===================================================================== */}
      <section
        className="adm-puthi-card adm-tolet-control-card"
        aria-label={`ইউনিট ${selectedUnit.id} টু-লেট স্ট্যাটাস ও ভাড়া নির্ধারণ`}
      >
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />

        <div className="adm-tolet-control-card__top">
          <div>
            <span className="adm-selected-pill">
              নির্বাচিত ফ্ল্যাট: ইউনিট {selectedUnit.id} ({selectedFloor.nameBn})
            </span>
            <h2 className="adm-step-title">
              ২. ইউনিট {selectedUnit.id} কি এখন ভাড়া হবে (টু-লেট বিজ্ঞাপন চালু করবেন)?
            </h2>
          </div>

          <Link
            to={`/flat/${selectedUnit.id}`}
            className="adm-preview-link-btn"
          >
            👁️ পাবলিক পেজে ফ্ল্যাটটি কেমন দেখাচ্ছে দেখুন ↗
          </Link>
        </div>

        {/* Giant 2-State Availability Switch */}
        <div className="adm-giant-toggle-grid">
          <button
            type="button"
            className={`adm-giant-toggle-btn adm-giant-toggle-btn--yes ${
              isAvailable ? 'adm-giant-toggle-btn--yes-active' : ''
            }`}
            onClick={() => handleToggleAvailability(true)}
            aria-pressed={isAvailable}
          >
            🟢 হ্যাঁ, ভাড়া হবে (পাবলিক সাইটে বিজ্ঞাপন ও ছবি দেখান)
          </button>

          <button
            type="button"
            className={`adm-giant-toggle-btn adm-giant-toggle-btn--no ${
              !isAvailable ? 'adm-giant-toggle-btn--no-active' : ''
            }`}
            onClick={() => handleToggleAvailability(false)}
            aria-pressed={!isAvailable}
          >
            ⚪ না, ভাড়া হয়ে গেছে (বিজ্ঞাপন ও ছবি লুকিয়ে রাখুন)
          </button>
        </div>

        {/* Reassuring Live Effect Helper Banner */}
        <div
          className={`adm-effect-banner ${
            isAvailable ? 'adm-effect-banner--open' : 'adm-effect-banner--closed'
          }`}
        >
          {isAvailable
            ? "✅ এই ফ্ল্যাটটি এখন হোম পেজে 'ক্লিক করুন' তীর চিহ্নসহ দেখাচ্ছে এবং ফ্লোর ম্যাপ ও ছবির পেজ দর্শকদের জন্য উন্মুক্ত আছে।"
            : "🔒 এই ফ্ল্যাটের সকল ছবি ও ভিডিও সাধারণ দর্শকদের কাছ থেকে লুকানো আছে এবং ফ্লোর ম্যাপে 'ভাড়া হয়ে গেছে' দেখাচ্ছে।"}
        </div>

        {/* Rent & Available Month Quick Controls (Zero-Typing Options for Parents) */}
        <div className="adm-terms-editor-grid">
          {/* কোন মাস থেকে ভাড়া শুরু হবে? */}
          <div className="adm-term-box">
            <label className="adm-term-box__label">
              📅 কোন মাস থেকে ভাড়া শুরু হবে?
            </label>
            <div className="adm-month-pills">
              {MONTH_PRESETS.map((preset) => {
                const active =
                  !customMonthMode && currentFromFullBn === preset.fullBn;
                return (
                  <button
                    key={preset.fullBn}
                    type="button"
                    className={`adm-month-pill ${
                      active ? 'adm-month-pill--active' : ''
                    }`}
                    onClick={() => handleSelectMonthPreset(preset)}
                  >
                    {preset.fullBn}
                  </button>
                );
              })}
              <button
                type="button"
                className={`adm-month-pill ${
                  customMonthMode ? 'adm-month-pill--active' : ''
                }`}
                onClick={() => setCustomMonthMode((v) => !v)}
              >
                ✍️ অন্য মাস লিখুন
              </button>
            </div>

            {customMonthMode && (
              <input
                type="text"
                value={currentFromFullBn}
                onChange={(e) =>
                  updateUnit(selectedUnit.id, {
                    availableFromFullBn: e.target.value,
                    availableFrom: e.target.value,
                  })
                }
                placeholder="যেমন: জুন ২০২৭"
                className="adm-custom-month-input"
              />
            )}
          </div>

          {/* মাসিক ভাড়া কত (৳)? */}
          <div className="adm-term-box">
            <label
              htmlFor="admin-unit-rent-input"
              className="adm-term-box__label"
            >
              💰 মাসিক ভাড়া কত (৳)? ({formatTaka(currentRent)})
            </label>
            <div className="adm-rent-stepper">
              <button
                type="button"
                className="adm-step-btn adm-step-btn--minus"
                onClick={() => handleRentStep(-500)}
              >
                ➖ ৫০০ কমান
              </button>

              <input
                id="admin-unit-rent-input"
                type="text"
                inputMode="numeric"
                value={toBanglaDigits(currentRent)}
                onChange={(e) => handleRentInputChange(e.target.value)}
                className="adm-rent-stepper__input"
              />

              <button
                type="button"
                className="adm-step-btn adm-step-btn--plus"
                onClick={() => handleRentStep(500)}
              >
                ➕ ৫০০ বাড়ান
              </button>
            </div>

            {/* Inclusive Bills Checkbox */}
            <label className="adm-inclusive-toggle">
              <input
                type="checkbox"
                checked={inclusiveBills}
                onChange={(e) =>
                  updateUnit(selectedUnit.id, {
                    inclusiveBills: e.target.checked,
                  })
                }
              />
              <span>✅ গ্যাস, পানি ও ময়লার বিল এই ভাড়ার মধ্যেই অন্তর্ভুক্ত</span>
            </label>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STEP 3: GOOGLE DRIVE FOLDER MAPPING & 1-CLICK AUTO-SYNC BANNER
         ===================================================================== */}
      <section
        className="adm-puthi-card adm-drive-sync-card"
        aria-label="গুগল ড্রাইভ ফোল্ডার কানেকশন ও অটো-সিঙ্ক"
      >
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />

        <div className="adm-drive-sync-card__header">
          <div>
            <h2 className="adm-step-title">
              ৩. 📂 গুগল ড্রাইভ ফোল্ডার কানেকশন ও অটো-সিঙ্ক
            </h2>
            <p className="adm-drive-path-badge">
              📁 <strong>ড্রাইভ ফোল্ডার পাথ:</strong>{' '}
              <code>{getDriveFolderHierarchyLabel(selectedFloor, selectedUnit.id)}</code>
            </p>
          </div>

          <button
            type="button"
            className="adm-sync-drive-btn"
            onClick={handleSyncDriveFolder}
            disabled={syncingDrive}
          >
            {syncingDrive
              ? '⏳ গুগল ড্রাইভ স্ক্যান হচ্ছে...'
              : '🔄 গুগল ড্রাইভ ফোল্ডার থেকে ছবি ও ভিডিও সিঙ্ক করুন'}
          </button>
        </div>

        <div className="adm-drive-folder-input-row">
          <label htmlFor="unit-drive-folder-url" className="adm-drive-folder-input-row__lbl">
            🔗 ইউনিট {selectedUnit.id}-এর গুগল ড্রাইভ ফোল্ডার লিংক / ID (ঐচ্ছিক):
          </label>
          <input
            id="unit-drive-folder-url"
            type="text"
            value={selectedUnit.driveFolderUrl || ''}
            onChange={(e) =>
              updateUnit(selectedUnit.id, { driveFolderUrl: e.target.value })
            }
            placeholder="https://drive.google.com/drive/folders/... (অথবা খালি রাখলে উপরের ডিফল্ট ফোল্ডার ব্যবহৃত হবে)"
            className="adm-drive-folder-input-row__input"
          />
        </div>
      </section>

      {/* =====================================================================
          STEP 4: MAIN WALKTHROUGH VIDEO MANAGER (🎥 পুরো ফ্ল্যাটের মেইন ভিডিও)
         ===================================================================== */}
      <section
        className="adm-puthi-card adm-main-video-card"
        aria-label="পুরো ফ্ল্যাটের মেইন ভিডিও নিয়ন্ত্রণ"
      >
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />

        <div className="adm-main-video-card__header">
          <div>
            <h2 className="adm-step-title">
              ৪. 🎥 পুরো ফ্ল্যাটের মেইন ভিডিও (<code>Drive/{selectedUnit.id}/full_video.mp4</code>)
            </h2>
            <p className="adm-sub-note">
              এই ভিডিওটি ফ্ল্যাটের বিস্তারিত পেজের একদম শুরুতে বড় প্লেয়ারে দেখাবে। মেইন ভিডিও না থাকলে বক্সটি স্বয়ংক্রিয়ভাবে লুকানো থাকবে।
            </p>
          </div>
        </div>

        {hasMainVideo && !replacingMainVideo ? (
          <div className="adm-main-video-preview-wrap">
            <div className="adm-main-video-player">
              {selectedUnit.driveVideoId ? (
                <iframe
                  title={`ইউনিট ${selectedUnit.id} মেইন ভিডিও`}
                  src={`https://drive.google.com/file/d/${selectedUnit.driveVideoId}/preview`}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  src={selectedUnit.mainVideoUrl}
                  controls
                  preload="metadata"
                />
              )}
            </div>

            <div className="adm-main-video-actions">
              <button
                type="button"
                className="adm-replace-video-btn"
                onClick={() => setReplacingMainVideo(true)}
              >
                🔄 ভিডিও পরিবর্তন করুন
              </button>
              <button
                type="button"
                className="adm-delete-video-btn"
                onClick={handleDeleteMainVideo}
              >
                🗑️ মেইন ভিডিও মুছে ফেলুন
              </button>
            </div>
          </div>
        ) : (
          <div className="adm-main-video-upload-box">
            <label className="adm-upload-dropzone">
              <input
                type="file"
                accept="video/*"
                onChange={handleMainVideoFileUpload}
                hidden
              />
              <span className="adm-upload-dropzone__icon" aria-hidden="true">
                📤
              </span>
              <span className="adm-upload-dropzone__title">
                {uploadingMainVideo
                  ? `⏳ Drive/${selectedUnit.id}/full_video.mp4 আপলোড হচ্ছে...`
                  : '📤 ফোন বা কম্পিউটার থেকে মেইন ভিডিও ফাইল সিলেক্ট করুন (.mp4)'}
              </span>
              <span className="adm-upload-dropzone__sub">
                এখানে চাপ দিয়ে আপনার গ্যালারি বা ফোল্ডার থেকে ভিডিওটি বেছে নিন
              </span>
            </label>

            <div className="adm-drive-link-inline">
              <label
                htmlFor="main-video-drive-link"
                className="adm-drive-link-inline__lbl"
              >
                অথবা গুগল ড্রাইভ ভিডিওর লিংক / File ID পেস্ট করুন:
              </label>
              <div className="adm-drive-link-inline__row">
                <input
                  id="main-video-drive-link"
                  type="text"
                  value={mainDriveLinkInput}
                  onChange={(e) => setMainDriveLinkInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="adm-drive-link-inline__input"
                />
                <button
                  type="button"
                  className="adm-drive-link-inline__btn"
                  onClick={handleSaveMainDriveLink}
                >
                  ➕ ভিডিও যুক্ত করুন
                </button>
                {hasMainVideo && (
                  <button
                    type="button"
                    className="adm-drive-link-inline__cancel"
                    onClick={() => setReplacingMainVideo(false)}
                  >
                    বাতিল
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          STEP 5: ROOM-BY-ROOM MEDIA SECTIONS (EXACT FLOOR-MAP ROOM NAMES)
         ===================================================================== */}
      <section
        className="adm-puthi-card adm-rooms-manager-card"
        aria-label="রুম অনুযায়ী ছবি ও ভিডিও সাজান"
      >
        <div className="adm-puthi-card__inner-rule" aria-hidden="true" />

        <h2 className="adm-step-title">
          ৫. 📸 রুম অনুযায়ী ছবি ও ভিডিও সাজান (ইউনিট {selectedUnit.id})
        </h2>
        <p className="adm-sub-note">
          ফ্লোর ম্যাপের রুমের নামের সাথে মিল রেখে নিচের যেকোনো বাটনে চাপ দিলে নতুন রুমের সেকশন তৈরি হবে। প্রতিটি রুমে একাধিক ছবি ও ভিডিও যোগ করতে পারবেন।
        </p>

        {/* A. 1-Click Preset Room Section Creator */}
        <div className="adm-preset-rooms-box">
          <span className="adm-preset-rooms-box__label">
            ➕ ১-ক্লিকে নতুন রুমের সেকশন যোগ করুন:
          </span>
          <div className="adm-preset-chips">
            {presetRoomButtons.map((preset) => (
              <button
                key={preset.titleBn}
                type="button"
                className="adm-preset-room-btn"
                onClick={() =>
                  handleAddRoomSection(preset.titleBn, preset.category)
                }
              >
                ➕ {preset.titleBn}
              </button>
            ))}

            <button
              type="button"
              className="adm-preset-room-btn adm-preset-room-btn--custom"
              onClick={() => setShowCustomRoomInput((v) => !v)}
            >
              ✍️ নিজের মতো নাম লিখে যোগ করুন
            </button>
          </div>

          {showCustomRoomInput && (
            <div className="adm-custom-room-row">
              <input
                type="text"
                value={customRoomTitle}
                onChange={(e) => setCustomRoomTitle(e.target.value)}
                placeholder="রুম বা সেকশনের নাম লিখুন (যেমন: ছাদ বা গ্যারেজ)"
                className="adm-custom-room-row__input"
              />
              <button
                type="button"
                className="adm-custom-room-row__add"
                onClick={() => handleAddRoomSection(customRoomTitle, 'custom')}
              >
                ➕ সেকশন তৈরি করুন
              </button>
            </div>
          )}
        </div>

        {/* B. Room Section Cards List */}
        <div className="adm-room-section-list">
          {unitSections.map((section, secIndex) => {
            const imgCount = section.items.filter((i) => i.type !== 'video').length;
            const vidCount = section.items.filter((i) => i.type === 'video').length;
            const isEditingTitle = editingSecId === section.id;
            const isConfirmingDelete = confirmDeleteSecId === section.id;
            const isUploadingHere = uploadingSecId === section.id;
            const isLinkPanelOpen = openLinkPanelSecId === section.id;

            return (
              <article key={section.id} className="adm-room-sec-card">
                {/* 1. Section Header Bar */}
                <div className="adm-room-sec-card__header">
                  <div className="adm-room-sec-card__title-wrap">
                    {isEditingTitle ? (
                      <div className="adm-sec-rename-row">
                        <input
                          type="text"
                          value={editingSecTitle}
                          onChange={(e) => setEditingSecTitle(e.target.value)}
                          className="adm-sec-rename-row__input"
                        />
                        <button
                          type="button"
                          className="adm-sec-rename-row__save"
                          onClick={() => handleSaveSectionRename(section.id)}
                        >
                          ✅ সেভ
                        </button>
                        <button
                          type="button"
                          className="adm-sec-rename-row__cancel"
                          onClick={() => setEditingSecId(null)}
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="adm-room-sec-card__title">
                          {toBanglaDigits(secIndex + 1)}. {section.titleBn}
                        </h3>
                        <button
                          type="button"
                          className="adm-sec-small-btn"
                          onClick={() => {
                            setEditingSecId(section.id);
                            setEditingSecTitle(section.titleBn);
                          }}
                        >
                          ✏️ নাম পরিবর্তন
                        </button>
                      </>
                    )}

                    <span className="adm-sec-count-badge">
                      🖼️ {toBanglaDigits(imgCount)}টি ছবি • 🎥 {toBanglaDigits(vidCount)}টি ভিডিও
                    </span>
                  </div>

                  {/* Reorder & Delete Section Buttons */}
                  <div className="adm-room-sec-card__controls">
                    <button
                      type="button"
                      className="adm-sec-ctrl-btn"
                      onClick={() => handleMoveSection(secIndex, -1)}
                      disabled={secIndex === 0}
                    >
                      ⬆️ উপরে নিন
                    </button>
                    <button
                      type="button"
                      className="adm-sec-ctrl-btn"
                      onClick={() => handleMoveSection(secIndex, 1)}
                      disabled={secIndex === unitSections.length - 1}
                    >
                      ⬇️ নিচে নামান
                    </button>
                    <button
                      type="button"
                      className="adm-sec-ctrl-btn adm-sec-ctrl-btn--delete"
                      onClick={() => setConfirmDeleteSecId(section.id)}
                    >
                      🗑️ পুরো রুম সেকশন মুছুন
                    </button>
                  </div>
                </div>

                {/* Section Delete Confirmation Dialog */}
                {isConfirmingDelete && (
                  <div className="adm-sec-delete-confirm" role="alert">
                    <p>
                      ⚠️ আপনি কি নিশ্চিত <strong>&ldquo;{section.titleBn}&rdquo;</strong>-এর সেকশন ও এর ভেতরের সব ছবি/ভিডিও মুছে ফেলতে চান?
                    </p>
                    <div className="adm-sec-delete-confirm__btns">
                      <button
                        type="button"
                        className="adm-reset-confirm__yes"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        হ্যাঁ, মুছে ফেলুন
                      </button>
                      <button
                        type="button"
                        className="adm-reset-confirm__no"
                        onClick={() => setConfirmDeleteSecId(null)}
                      >
                        না, থাকুক
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Grid of Existing Photos & Videos Inside This Room */}
                {section.items.length > 0 ? (
                  <div className="adm-room-media-grid">
                    {section.items.map((item) => {
                      const isVideo = item.type === 'video';
                      const thumbOrVideoSrc = item.driveFileId
                        ? isVideo
                          ? `https://drive.google.com/file/d/${item.driveFileId}/preview`
                          : `https://drive.google.com/thumbnail?id=${item.driveFileId}&sz=w1000`
                        : item.previewUrl;

                      return (
                        <div key={item.id} className="adm-media-item-card">
                          <div className="adm-media-item-card__preview">
                            {isVideo ? (
                              item.driveFileId ? (
                                <iframe
                                  title={item.labelBn || section.titleBn}
                                  src={thumbOrVideoSrc}
                                  allow="autoplay; fullscreen"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={thumbOrVideoSrc}
                                  controls
                                  preload="metadata"
                                />
                              )
                            ) : (
                              <img
                                src={thumbOrVideoSrc}
                                alt={item.labelBn || section.titleBn}
                                loading="lazy"
                              />
                            )}

                            <span
                              className={`adm-media-type-badge ${
                                isVideo
                                  ? 'adm-media-type-badge--video'
                                  : 'adm-media-type-badge--image'
                              }`}
                            >
                              {isVideo ? '🎥 ভিডিও' : '🖼️ ছবি'}
                            </span>

                            {!isVideo && (
                              <button
                                type="button"
                                className="adm-media-zoom-btn"
                                onClick={() =>
                                  setLightboxImage({
                                    src: thumbOrVideoSrc,
                                    caption: item.labelBn || section.titleBn,
                                  })
                                }
                              >
                                🔍 বড় করে দেখুন
                              </button>
                            )}

                            <button
                              type="button"
                              className="adm-media-delete-btn"
                              onClick={() =>
                                handleDeleteMediaItem(section.id, item.id)
                              }
                            >
                              🗑️ ডিলিট
                            </button>
                          </div>

                          <input
                            type="text"
                            value={item.labelBn || ''}
                            onChange={(e) =>
                              handleUpdateItemCaption(
                                section.id,
                                item.id,
                                e.target.value
                              )
                            }
                            placeholder="ছবির সংক্ষিপ্ত ক্যাপশন (ঐচ্ছিক)"
                            className="adm-media-caption-input"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="adm-empty-room-note">
                    এই রুমে এখনো কোনো ছবি বা ভিডিও যোগ করা হয়নি। নিচের বাটনে চাপ দিয়ে যোগ করুন।
                  </p>
                )}

                {/* 3. Add New Photos or Videos to This Room */}
                <div className="adm-room-add-zone">
                  <label className="adm-room-upload-btn">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => {
                        handleMultiFileUploadToSection(section.id, e.target.files);
                        e.target.value = '';
                      }}
                      hidden
                    />
                    {isUploadingHere
                      ? `⏳ গুগল ড্রাইভে (Drive/${selectedUnit.id}/${section.titleBn}) আপলোড হচ্ছে...`
                      : '📷 🎥 ফোন বা কম্পিউটার থেকে এই রুমের ছবি ও ভিডিও যোগ করুন (একাধিক সিলেক্ট করা যাবে)'}
                  </label>

                  <button
                    type="button"
                    className="adm-room-link-toggle-btn"
                    onClick={() =>
                      setOpenLinkPanelSecId(isLinkPanelOpen ? null : section.id)
                    }
                  >
                    🔗 গুগল ড্রাইভের ছবি বা ভিডিওর লিংক যোগ করুন
                  </button>
                </div>

                {isLinkPanelOpen && (
                  <div className="adm-room-link-panel">
                    <div className="adm-room-link-panel__types">
                      <button
                        type="button"
                        className={`adm-type-pill ${
                          newLinkType === 'image' ? 'adm-type-pill--active' : ''
                        }`}
                        onClick={() => setNewLinkType('image')}
                      >
                        🖼️ ছবি (Image)
                      </button>
                      <button
                        type="button"
                        className={`adm-type-pill ${
                          newLinkType === 'video' ? 'adm-type-pill--active' : ''
                        }`}
                        onClick={() => setNewLinkType('video')}
                      >
                        🎥 ভিডিও (Video)
                      </button>
                    </div>

                    <div className="adm-room-link-panel__inputs">
                      <input
                        type="text"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="গুগল ড্রাইভ শেয়ার লিংক বা File ID পেস্ট করুন..."
                        className="adm-room-link-panel__url"
                      />
                      <input
                        type="text"
                        value={newLinkCaption}
                        onChange={(e) => setNewLinkCaption(e.target.value)}
                        placeholder="ক্যাপশন (ঐচ্ছিক)"
                        className="adm-room-link-panel__caption"
                      />
                      <button
                        type="button"
                        className="adm-room-link-panel__submit"
                        onClick={() => handleAddDriveLinkToSection(section.id)}
                      >
                        ➕ এই রুমে যুক্ত করুন
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Lightbox Modal for Previewing Room Photos inside Admin */}
      {lightboxImage && (
        <div
          className="adm-modal-backdrop"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="adm-lightbox-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="adm-lightbox-box__close"
              onClick={() => setLightboxImage(null)}
            >
              ✕ বন্ধ করুন
            </button>
            <img src={lightboxImage.src} alt={lightboxImage.caption} />
            <p>{lightboxImage.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
