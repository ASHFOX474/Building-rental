import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
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
import {
  fetchDbState,
  patchDbUnit,
  upsertDbPayment,
  deleteDbPayment,
  upsertDbExpense,
  createDbFloor,
  patchDbFloor,
  deleteDbFloor,
  patchDbSettings,
  restoreDbBackup,
} from '../api/dbApi.js';

const DEFAULT_EXPENSES_INITIAL = {
  caretaker_cost: 12200,
  electricity_bill: 3000,
  gas_bill: 5400,
};

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

const SAVE_ERROR_MSG_BN = '⚠️ ইন্টারনেট সংযোগ চেক করুন, ডাটা সেভ হয়নি';

export function getBanglaFloorOrdinal(num) {
  return BANGLA_FLOOR_ORDINALS[num] || `${toBanglaDigits(num)}তম তলা`;
}

const BuildingContext = createContext(null);

export function BuildingProvider({ children }) {
  const [building, setBuilding] = useState(initialBuilding);
  const [floors, setFloors] = useState(initialFloors);
  const [paymentsByMonth, setPaymentsByMonth] = useState(initialPaymentsByMonth);
  const [expensesByMonth, setExpensesByMonth] = useState({});
  const [defaultExpenses, setDefaultExpenses] = useState(DEFAULT_EXPENSES_INITIAL);
  const [adminPin, setAdminPinState] = useState('1234');

  const [dbStatus, setDbStatus] = useState({
    loading: true,
    connected: false,
    error: '',
  });

  const [saveErrorToast, setSaveErrorToast] = useState('');
  const saveErrorTimerRef = useRef(null);

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

  // Always keep latest floors accessible for optimistic patch calculation
  const floorsRef = useRef(floors);
  useEffect(() => {
    floorsRef.current = floors;
  }, [floors]);

  // Per-unit coalesced debounce queue so rapid typing never races out-of-order PATCH calls
  const unitPatchQueueRef = useRef({});
  const unitPatchTimersRef = useRef({});

  const showSaveError = useCallback((customMsg = SAVE_ERROR_MSG_BN) => {
    setSaveErrorToast(customMsg);
    if (saveErrorTimerRef.current) clearTimeout(saveErrorTimerRef.current);
    saveErrorTimerRef.current = setTimeout(() => {
      setSaveErrorToast('');
    }, 5000);
  }, []);

  /** Apply a full hydrated Neon state payload into React state. */
  const applyHydratedState = useCallback((state) => {
    if (!state) return;
    if (state.building) setBuilding(state.building);
    if (Array.isArray(state.floors) && state.floors.length > 0) {
      setFloors(state.floors);
      floorsRef.current = state.floors;
    }
    if (state.paymentsByMonth && typeof state.paymentsByMonth === 'object') {
      setPaymentsByMonth(state.paymentsByMonth);
    }
    if (state.expensesByMonth && typeof state.expensesByMonth === 'object') {
      setExpensesByMonth(state.expensesByMonth);
    }
    if (state.defaultExpenses && typeof state.defaultExpenses === 'object') {
      setDefaultExpenses({
        caretaker_cost: Number(
          state.defaultExpenses.caretaker_cost ?? DEFAULT_EXPENSES_INITIAL.caretaker_cost
        ),
        electricity_bill: Number(
          state.defaultExpenses.electricity_bill ?? DEFAULT_EXPENSES_INITIAL.electricity_bill
        ),
        gas_bill: Number(
          state.defaultExpenses.gas_bill ?? DEFAULT_EXPENSES_INITIAL.gas_bill
        ),
      });
    }
    if (state.settings?.adminPin && /^\d{4}$/.test(state.settings.adminPin)) {
      setAdminPinState(state.settings.adminPin);
    }
  }, []);

  /** Refresh complete state from Neon PostgreSQL. */
  const refreshFromDb = useCallback(async () => {
    const state = await fetchDbState();
    applyHydratedState(state);
    setDbStatus({ loading: false, connected: true, error: '' });
    return state;
  }, [applyHydratedState]);

  /** Scan all floors & units from Google Drive and update matching units in state + Neon. */
  const syncAllFromDrive = useCallback(async ({ overwriteEmpty = true } = {}) => {
    try {
      const statusRes = await fetchDriveStatus();
      const syncRes = await syncAllUnitsFromDriveApi({ overwriteEmpty });

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

  /** Hydrate state from Neon PostgreSQL on app load, then check Google Drive status. */
  useEffect(() => {
    let active = true;

    async function bootstrap() {
      let hydratedFloors = null;
      try {
        const state = await fetchDbState();
        if (!active) return;
        applyHydratedState(state);
        hydratedFloors = state.floors;
        setDbStatus({ loading: false, connected: true, error: '' });
      } catch (err) {
        if (!active) return;
        setDbStatus({
          loading: false,
          connected: false,
          error: err.message || 'Neon PostgreSQL unavailable',
        });
      }

      // Check Google Drive status; if DB has never been Drive-synced yet, auto-sync once
      const hasAnyMappedDriveFolder = Array.isArray(hydratedFloors)
        ? hydratedFloors.some((f) => (f.units || []).some((u) => Boolean(u.driveFolderId)))
        : false;

      if (!hasAnyMappedDriveFolder) {
        syncAllFromDrive({ overwriteEmpty: true }).catch(() => {
          // Drive optional during offline preview
        });
      } else {
        try {
          const statusRes = await fetchDriveStatus();
          if (!active) return;
          setDriveStatus((prev) => ({
            ...prev,
            loading: false,
            connected: Boolean(statusRes.connected),
            authMode: statusRes.authMode,
            serviceAccountEmail: statusRes.serviceAccountEmail,
            rootFolderId: statusRes.rootFolderId,
            rootFolderName: statusRes.rootFolderName,
            rootFolderUrl: statusRes.rootFolderUrl,
            error: '',
          }));
        } catch (err) {
          if (!active) return;
          setDriveStatus((prev) => ({
            ...prev,
            loading: false,
            connected: false,
            error: err.message || 'Google Drive connection failed',
          }));
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
      Object.values(unitPatchTimersRef.current).forEach((t) => clearTimeout(t));
    };
  }, [applyHydratedState, syncAllFromDrive]);

  /** Update Admin 4-digit PIN (optimistic + Neon). */
  const setAdminPin = useCallback(
    (nextPin) => {
      const clean = String(nextPin || '').trim();
      if (!/^\d{4}$/.test(clean)) return false;
      setAdminPinState(clean);

      patchDbSettings({ admin_pin: clean }).catch(() => {
        showSaveError();
      });
      return true;
    },
    [showSaveError]
  );

  /** Update public contact numbers (primary phone, secondary phone, whatsapp). */
  const updateContactInfo = useCallback(
    (contactChanges) => {
      setBuilding((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          ...contactChanges,
        },
      }));

      patchDbSettings({
        phone: contactChanges.phone,
        phoneSecondary: contactChanges.phoneSecondary,
        whatsapp: contactChanges.whatsapp,
      }).catch(() => {
        showSaveError();
      });
    },
    [showSaveError]
  );

  /** Record or update a unit's rent payment for a given 'YYYY-MM' month. */
  const recordRentPayment = useCallback(
    (monthKey, unitId, paymentRecord) => {
      setPaymentsByMonth((prev) => ({
        ...prev,
        [monthKey]: {
          ...(prev[monthKey] || {}),
          [unitId]: paymentRecord,
        },
      }));

      const unitObj = floorsRef.current
        .flatMap((f) => f.units || [])
        .find((u) => u.id === unitId);

      upsertDbPayment({
        unit_code: unitId,
        month_key: monthKey,
        expected_amount: paymentRecord.expectedAmount ?? unitObj?.rent ?? 0,
        paid_amount: paymentRecord.paidAmount ?? 0,
        payment_method: paymentRecord.method || 'Cash',
        paid_date: paymentRecord.paymentDate || '',
        is_on_time: paymentRecord.paidOnTime !== false,
        note: paymentRecord.note || '',
      }).catch(() => {
        showSaveError();
      });
    },
    [showSaveError]
  );

  /** Remove/reset a unit's rent payment record for a given 'YYYY-MM' month (marks it UNPAID). */
  const clearRentPayment = useCallback(
    (monthKey, unitId) => {
      setPaymentsByMonth((prev) => {
        const monthObj = { ...(prev[monthKey] || {}) };
        delete monthObj[unitId];
        return {
          ...prev,
          [monthKey]: monthObj,
        };
      });

      deleteDbPayment(unitId, monthKey).catch(() => {
        showSaveError();
      });
    },
    [showSaveError]
  );

  /** Save monthly building expenses for a 'YYYY-MM' month (optimistic + Neon PostgreSQL). */
  const saveMonthlyExpense = useCallback(
    (monthKey, expenseData, updateDefaults = false) => {
      const normalized = {
        month_key: monthKey,
        caretaker_cost: Math.max(0, Math.round(Number(expenseData.caretaker_cost) || 0)),
        electricity_bill: Math.max(0, Math.round(Number(expenseData.electricity_bill) || 0)),
        gas_bill: Math.max(0, Math.round(Number(expenseData.gas_bill) || 0)),
        misc_cost: Math.max(0, Math.round(Number(expenseData.misc_cost) || 0)),
        misc_note: String(expenseData.misc_note || '').trim(),
      };

      setExpensesByMonth((prev) => ({
        ...prev,
        [monthKey]: normalized,
      }));

      if (updateDefaults) {
        setDefaultExpenses({
          caretaker_cost: normalized.caretaker_cost,
          electricity_bill: normalized.electricity_bill,
          gas_bill: normalized.gas_bill,
        });
      }

      upsertDbExpense({
        ...normalized,
        update_defaults: Boolean(updateDefaults),
      }).catch(() => {
        showSaveError();
      });
    },
    [showSaveError]
  );

  /** Update properties of a specific unit (optimistic UI + coalesced Neon PATCH). */
  const updateUnit = useCallback(
    (unitId, changes, { skipDbPatch = false } = {}) => {
      const currentUnit = floorsRef.current
        .flatMap((f) => f.units || [])
        .find((u) => u.id === unitId);

      const resolvedChanges =
        typeof changes === 'function' ? changes(currentUnit || { id: unitId }) : changes;

      if (!resolvedChanges || typeof resolvedChanges !== 'object') return;

      setFloors((prevFloors) =>
        prevFloors.map((floor) => ({
          ...floor,
          units: floor.units.map((unit) =>
            unit.id === unitId
              ? {
                  ...unit,
                  ...resolvedChanges,
                }
              : unit
          ),
        }))
      );

      if (skipDbPatch) return;

      unitPatchQueueRef.current[unitId] = {
        ...(unitPatchQueueRef.current[unitId] || {}),
        ...resolvedChanges,
      };

      if (unitPatchTimersRef.current[unitId]) {
        clearTimeout(unitPatchTimersRef.current[unitId]);
      }

      unitPatchTimersRef.current[unitId] = setTimeout(() => {
        const queued = unitPatchQueueRef.current[unitId];
        delete unitPatchQueueRef.current[unitId];
        delete unitPatchTimersRef.current[unitId];
        if (!queued) return;

        patchDbUnit(unitId, queued).catch(() => {
          showSaveError();
        });
      }, 220);
    },
    [showSaveError]
  );

  /** Scan a single unit folder from Google Drive (backend persists directly to Neon). */
  const syncUnitFromDrive = useCallback(
    async (unitId, explicitFolderId = '') => {
      const data = await syncUnitFromDriveApi(unitId, explicitFolderId);
      updateUnit(
        unitId,
        {
          driveFolderId: data.driveFolderId,
          driveFolderUrl: data.driveFolderUrl,
          driveVideoId: data.driveVideoId,
          mainVideoFileName: data.mainVideoFileName,
          mainVideoUrl: '',
          mediaSections: data.mediaSections,
        },
        { skipDbPatch: true }
      );
      setDriveStatus((prev) => ({
        ...prev,
        connected: true,
        authMode: data.authMode || prev.authMode,
        lastSyncedAt: data.syncedAt,
        error: '',
      }));
      return data;
    },
    [updateUnit]
  );

  /** Toggle whether a floor is visible on the Public Website (`isVisible`). */
  const toggleFloorVisibility = useCallback(
    (floorId) => {
      const targetFloor = floorsRef.current.find((f) => f.id === floorId);
      const nextVisible = targetFloor ? targetFloor.isVisible === false : true;

      setFloors((prevFloors) =>
        prevFloors.map((floor) =>
          floor.id === floorId ? { ...floor, isVisible: nextVisible } : floor
        )
      );

      patchDbFloor(targetFloor?.dbId || floorId, { is_visible: nextVisible }).catch(() => {
        showSaveError();
      });
    },
    [showSaveError]
  );

  /**
   * Dynamically add the next story (e.g., 6th Floor - Floor F with 3 symmetrical units F1, F2, F3)
   * right at the top of the building stack and persist to Neon PostgreSQL.
   */
  const addNextStory = useCallback(() => {
    const prevFloors = floorsRef.current;
    const maxFloorNum = prevFloors.reduce((max, f) => Math.max(max, f.floorNumber), 0);
    const nextNum = maxFloorNum + 1;
    const nextLetter = String.fromCharCode(64 + nextNum); // 6 -> 'F', 7 -> 'G'
    const nameBn = getBanglaFloorOrdinal(nextNum);
    const u1 = `${nextLetter}1`;
    const u2 = `${nextLetter}2`;
    const u3 = `${nextLetter}3`;

    const createdFloor = {
      dbId: String(nextNum),
      id: nextLetter,
      floorNumber: nextNum,
      nameBn,
      titleBn: `${nameBn} (ফ্লোর ${nextLetter}: ইউনিট ${u1}, ${u2} ও ${u3})`,
      blueprintReady: true,
      isVisible: true,
      templateType: 'three-unit',
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

    setFloors((cur) => [createdFloor, ...cur]);

    createDbFloor(createdFloor).catch(() => {
      showSaveError();
    });

    return createdFloor;
  }, [showSaveError]);

  /** Remove a dynamically added top story (floorNumber > 5). */
  const removeFloor = useCallback(
    (floorId) => {
      const targetFloor = floorsRef.current.find((f) => f.id === floorId);
      setFloors((prevFloors) => prevFloors.filter((f) => f.id !== floorId));

      deleteDbFloor(targetFloor?.dbId || floorId).catch(() => {
        showSaveError();
      });
    },
    [showSaveError]
  );

  /** Restore full building state & rent ledger from an uploaded JSON backup object. */
  const restoreBackupData = useCallback(
    (backupObj) => {
      if (!backupObj || !Array.isArray(backupObj.floors)) {
        return false;
      }
      setFloors(backupObj.floors);
      if (backupObj.paymentsByMonth && typeof backupObj.paymentsByMonth === 'object') {
        setPaymentsByMonth(backupObj.paymentsByMonth);
      }
      if (backupObj.expensesByMonth && typeof backupObj.expensesByMonth === 'object') {
        setExpensesByMonth(backupObj.expensesByMonth);
      }
      if (backupObj.defaultExpenses && typeof backupObj.defaultExpenses === 'object') {
        setDefaultExpenses({
          caretaker_cost: Number(
            backupObj.defaultExpenses.caretaker_cost ?? DEFAULT_EXPENSES_INITIAL.caretaker_cost
          ),
          electricity_bill: Number(
            backupObj.defaultExpenses.electricity_bill ?? DEFAULT_EXPENSES_INITIAL.electricity_bill
          ),
          gas_bill: Number(
            backupObj.defaultExpenses.gas_bill ?? DEFAULT_EXPENSES_INITIAL.gas_bill
          ),
        });
      }
      if (backupObj.building && typeof backupObj.building === 'object') {
        setBuilding(backupObj.building);
      }

      restoreDbBackup(backupObj)
        .then((hydrated) => {
          applyHydratedState(hydrated);
        })
        .catch(() => {
          showSaveError();
        });

      return true;
    },
    [applyHydratedState, showSaveError]
  );

  const resetToDefaults = useCallback(() => {
    setBuilding(initialBuilding);
    setFloors(initialFloors);
    setPaymentsByMonth(initialPaymentsByMonth);
    setExpensesByMonth({});
    setDefaultExpenses(DEFAULT_EXPENSES_INITIAL);
    setAdminPinState('1234');

    restoreDbBackup({ resetToDefaults: true })
      .then((hydrated) => {
        applyHydratedState(hydrated);
      })
      .catch(() => {
        showSaveError();
      });
  }, [applyHydratedState, showSaveError]);

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
        expensesByMonth,
        defaultExpenses,
        saveMonthlyExpense,
        updateUnit,
        dbStatus,
        refreshFromDb,
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
      {saveErrorToast && (
        <div className="db-save-error-toast" role="alert" aria-live="assertive">
          <span>{saveErrorToast}</span>
          <button
            type="button"
            className="db-save-error-toast__close"
            onClick={() => setSaveErrorToast('')}
            aria-label="বন্ধ করুন"
          >
            ✕
          </button>
        </div>
      )}
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
