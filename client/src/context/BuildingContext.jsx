import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  STORAGE_SCHEMA_VERSION,
  building as initialBuilding,
  floors as initialFloors,
  initialPaymentsByMonth,
} from '../data/mockBuilding.js';
import { toBanglaDigits } from '../lib/bangla.js';
import {
  fetchDriveStatus,
  syncAllUnitsFromDriveApi,
  syncUnitFromDriveApi,
} from '../api/driveApi.js';

const BUILDING_STORAGE_KEY = 'moni_lodge_building_v1';
const FLOORS_STORAGE_KEY = 'moni_lodge_floors_v1';
const PAYMENTS_STORAGE_KEY = 'moni_lodge_payments_v1';
const PIN_STORAGE_KEY = 'moni_lodge_admin_pin_v1';
const VERSION_STORAGE_KEY = 'moni_lodge_schema_version';

const BANGLA_FLOOR_ORDINALS = {
  1: '১ম তলা',
  2: '২য় তলা',
  3: '৩য় তলা',
  4: '৪র্থ তলা',
  5: '৫ম তলা',
  6: '৬ষ্ঠ তলা',
  7: '৭ম তলা',
  8: '৮ম তলা',
  9: '৯ম তলা',
  10: '১০ম তলা',
};

export function getBanglaFloorOrdinal(num) {
  return BANGLA_FLOOR_ORDINALS[num] || `${toBanglaDigits(num)}তম তলা`;
}

const BuildingContext = createContext(null);

function loadFromStorage(key, fallback) {
  try {
    const savedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    if (savedVersion !== STORAGE_SCHEMA_VERSION) {
      return fallback;
    }
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function BuildingProvider({ children }) {
  const [building, setBuilding] = useState(() =>
    loadFromStorage(BUILDING_STORAGE_KEY, initialBuilding)
  );
  const [floors, setFloors] = useState(() =>
    loadFromStorage(FLOORS_STORAGE_KEY, initialFloors)
  );
  const [paymentsByMonth, setPaymentsByMonth] = useState(() =>
    loadFromStorage(PAYMENTS_STORAGE_KEY, initialPaymentsByMonth)
  );
  const [adminPin, setAdminPinState] = useState(() => {
    try {
      const saved = localStorage.getItem(PIN_STORAGE_KEY);
      return saved && /^\d{4}$/.test(saved) ? saved : '1234';
    } catch {
      return '1234';
    }
  });

  const [driveStatus, setDriveStatus] = useState({
    loading: true,
    connected: false,
    authMode: 'service-account',
    serviceAccountEmail: null,
    rootFolderId: '',
    rootFolderName: '',
    rootFolderUrl: '',
    lastSyncedAt: null,
    error: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem(VERSION_STORAGE_KEY, STORAGE_SCHEMA_VERSION);
      localStorage.setItem(BUILDING_STORAGE_KEY, JSON.stringify(building));
    } catch {
      // Ignore storage quota errors
    }
  }, [building]);

  useEffect(() => {
    try {
      localStorage.setItem(VERSION_STORAGE_KEY, STORAGE_SCHEMA_VERSION);
      localStorage.setItem(FLOORS_STORAGE_KEY, JSON.stringify(floors));
    } catch {
      // Ignore storage quota errors
    }
  }, [floors]);

  useEffect(() => {
    try {
      localStorage.setItem(VERSION_STORAGE_KEY, STORAGE_SCHEMA_VERSION);
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(paymentsByMonth));
    } catch {
      // Ignore storage quota errors
    }
  }, [paymentsByMonth]);

  const setAdminPin = useCallback((nextPin) => {
    const clean = String(nextPin || '').trim();
    if (!/^\d{4}$/.test(clean)) return false;
    setAdminPinState(clean);
    try {
      localStorage.setItem(PIN_STORAGE_KEY, clean);
    } catch {
      // ignore
    }
    return true;
  }, []);

  /** Update public contact numbers (primary phone, secondary phone, whatsapp). */
  const updateContactInfo = useCallback((contactChanges) => {
    setBuilding((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        ...contactChanges,
      },
    }));
  }, []);

  /** Record or update a unit's rent payment for a given 'YYYY-MM' month. */
  const recordRentPayment = useCallback((monthKey, unitId, paymentRecord) => {
    setPaymentsByMonth((prev) => ({
      ...prev,
      [monthKey]: {
        ...(prev[monthKey] || {}),
        [unitId]: paymentRecord,
      },
    }));
  }, []);

  /** Remove/reset a unit's rent payment record for a given 'YYYY-MM' month (marks it UNPAID). */
  const clearRentPayment = useCallback((monthKey, unitId) => {
    setPaymentsByMonth((prev) => {
      const monthObj = { ...(prev[monthKey] || {}) };
      delete monthObj[unitId];
      return {
        ...prev,
        [monthKey]: monthObj,
      };
    });
  }, []);

  /** Update properties of a specific unit (e.g. status, rent, renterNameBn, mediaSections). */
  const updateUnit = useCallback((unitId, changes) => {
    setFloors((prevFloors) =>
      prevFloors.map((floor) => ({
        ...floor,
        units: floor.units.map((unit) =>
          unit.id === unitId
            ? {
                ...unit,
                ...(typeof changes === 'function' ? changes(unit) : changes),
              }
            : unit
        ),
      }))
    );
  }, []);

  /** Scan all floors & units from Google Drive and update matching units in state. */
  const syncAllFromDrive = useCallback(async ({ overwriteEmpty = true } = {}) => {
    try {
      const statusRes = await fetchDriveStatus();
      const syncRes = await syncAllUnitsFromDriveApi();

      setFloors((prevFloors) =>
        prevFloors.map((floor) => ({
          ...floor,
          units: floor.units.map((unit) => {
            const driveUnit = syncRes.units?.[unit.id];
            if (!driveUnit) return unit;

            const hasDriveContent =
              driveUnit.mediaSections.length > 0 || Boolean(driveUnit.driveVideoId);

            if (!overwriteEmpty && !hasDriveContent) {
              return {
                ...unit,
                driveFolderId: driveUnit.driveFolderId,
                driveFolderUrl: driveUnit.driveFolderUrl,
              };
            }

            return {
              ...unit,
              driveFolderId: driveUnit.driveFolderId,
              driveFolderUrl: driveUnit.driveFolderUrl,
              driveVideoId: driveUnit.driveVideoId,
              mainVideoFileName: driveUnit.mainVideoFileName,
              mainVideoUrl: '',
              mediaSections: driveUnit.mediaSections,
            };
          }),
        }))
      );

      setDriveStatus({
        loading: false,
        connected: true,
        authMode: statusRes.authMode,
        serviceAccountEmail: statusRes.serviceAccountEmail,
        rootFolderId: statusRes.rootFolderId,
        rootFolderName: statusRes.rootFolderName,
        rootFolderUrl: statusRes.rootFolderUrl,
        lastSyncedAt: syncRes.syncedAt,
        error: '',
      });

      return syncRes;
    } catch (err) {
      setDriveStatus((prev) => ({
        ...prev,
        loading: false,
        connected: false,
        error: err.message || 'Google Drive connection failed',
      }));
      throw err;
    }
  }, []);

  /** Scan a single unit folder from Google Drive and apply its live folders/files. */
  const syncUnitFromDrive = useCallback(async (unitId, explicitFolderId = '') => {
    const data = await syncUnitFromDriveApi(unitId, explicitFolderId);
    updateUnit(unitId, {
      driveFolderId: data.driveFolderId,
      driveFolderUrl: data.driveFolderUrl,
      driveVideoId: data.driveVideoId,
      mainVideoFileName: data.mainVideoFileName,
      mainVideoUrl: '',
      mediaSections: data.mediaSections,
    });
    setDriveStatus((prev) => ({
      ...prev,
      connected: true,
      authMode: data.authMode || prev.authMode,
      lastSyncedAt: data.syncedAt,
      error: '',
    }));
    return data;
  }, [updateUnit]);

  // Quietly connect & sync existing Google Drive media on app load
  useEffect(() => {
    syncAllFromDrive({ overwriteEmpty: false }).catch(() => {
      // Backend might be offline during static preview; fallback cleanly
    });
  }, [syncAllFromDrive]);

  /** Toggle whether a floor is visible on the Public Website (`isVisible`). */
  const toggleFloorVisibility = useCallback((floorId) => {
    setFloors((prevFloors) =>
      prevFloors.map((floor) =>
        floor.id === floorId
          ? { ...floor, isVisible: floor.isVisible === false ? true : false }
          : floor
      )
    );
  }, []);

  /**
   * Dynamically add the next story (e.g., 6th Floor - Floor F with 3 symmetrical units F1, F2, F3)
   * right at the top of the building stack.
   */
  const addNextStory = useCallback(() => {
    let createdFloor = null;
    setFloors((prevFloors) => {
      const maxFloorNum = prevFloors.reduce(
        (max, f) => Math.max(max, f.floorNumber),
        0
      );
      const nextNum = maxFloorNum + 1;
      const nextLetter = String.fromCharCode(64 + nextNum); // 6 -> 'F', 7 -> 'G'
      const nameBn = getBanglaFloorOrdinal(nextNum);
      const u1 = `${nextLetter}1`;
      const u2 = `${nextLetter}2`;
      const u3 = `${nextLetter}3`;

      createdFloor = {
        id: nextLetter,
        floorNumber: nextNum,
        nameBn,
        titleBn: `${nameBn} (ফ্লোর ${nextLetter}: ইউনিট ${u1}, ${u2} ও ${u3})`,
        blueprintReady: true,
        isVisible: true,
        legendPills: [
          { swatch: 'green', textBn: `ইউনিট ${u1} (বাম পাশ)` },
          { swatch: 'ochre', textBn: `ইউনিট ${u2} (মাঝখান)` },
          { swatch: 'tenant', textBn: `ইউনিট ${u3} (ডান পাশ)` },
          { swatch: 'stairs', textBn: 'সিঁড়ি ঘর' },
        ],
        units: [
          {
            id: u1,
            widthPct: 38,
            status: 'available',
            rent: 12000,
            availableFrom: 'january',
            availableFromFullBn: 'জানুয়ারি ২০২৭',
            inclusiveBills: true,
            bedrooms: 3,
            washrooms: 2,
            balconies: 3,
            renterNameBn: '',
            renterPhone: '',
            roomsSummaryBn: '৩টি বেডরুম • ড্রয়িং-ডাইনিং • ২টি বাথরুম • ৩টি বারান্দা • কিচেন',
            facingBn: 'দক্ষিণ-পূর্ব মুখী (প্রচুর আলো-বাতাস)',
          },
          {
            id: u2,
            widthPct: 24,
            status: 'occupied',
            rent: 9500,
            bedrooms: 2,
            washrooms: 2,
            balconies: 2,
            renterNameBn: 'নতুন ভাড়াটিয়া',
            renterPhone: '01700000000',
          },
          {
            id: u3,
            widthPct: 38,
            status: 'occupied',
            rent: 12000,
            bedrooms: 3,
            washrooms: 2,
            balconies: 3,
            renterNameBn: 'নতুন ভাড়াটিয়া',
            renterPhone: '01800000000',
          },
        ],
      };

      return [createdFloor, ...prevFloors];
    });
    return createdFloor;
  }, []);

  /** Remove a dynamically added top story (floorNumber > 5). */
  const removeFloor = useCallback((floorId) => {
    setFloors((prevFloors) => prevFloors.filter((f) => f.id !== floorId));
  }, []);

  /** Restore full building state & rent ledger from an uploaded JSON backup object. */
  const restoreBackupData = useCallback((backupObj) => {
    if (!backupObj || !Array.isArray(backupObj.floors)) {
      return false;
    }
    setFloors(backupObj.floors);
    if (backupObj.paymentsByMonth && typeof backupObj.paymentsByMonth === 'object') {
      setPaymentsByMonth(backupObj.paymentsByMonth);
    }
    if (backupObj.building && typeof backupObj.building === 'object') {
      setBuilding(backupObj.building);
    }
    return true;
  }, []);

  const resetToDefaults = useCallback(() => {
    setBuilding(initialBuilding);
    setFloors(initialFloors);
    setPaymentsByMonth(initialPaymentsByMonth);
    setAdminPinState('1234');
    try {
      localStorage.removeItem(BUILDING_STORAGE_KEY);
      localStorage.removeItem(FLOORS_STORAGE_KEY);
      localStorage.removeItem(PAYMENTS_STORAGE_KEY);
      localStorage.removeItem(PIN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <BuildingContext.Provider
      value={{
        building,
        updateContactInfo,
        floors,
        setFloors,
        paymentsByMonth,
        recordRentPayment,
        clearRentPayment,
        updateUnit,
        driveStatus,
        syncAllFromDrive,
        syncUnitFromDrive,
        toggleFloorVisibility,
        addNextStory,
        removeFloor,
        adminPin,
        setAdminPin,
        restoreBackupData,
        resetToDefaults,
      }}
    >
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuilding() {
  const ctx = useContext(BuildingContext);
  if (!ctx) {
    throw new Error('useBuilding must be used inside a <BuildingProvider>');
  }
  return ctx;
}
