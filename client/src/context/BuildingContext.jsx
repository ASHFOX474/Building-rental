import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  STORAGE_SCHEMA_VERSION,
  building as initialBuilding,
  floors as initialFloors,
  initialPaymentsByMonth,
} from '../data/mockBuilding.js';

const FLOORS_STORAGE_KEY = 'moni_lodge_floors_v1';
const PAYMENTS_STORAGE_KEY = 'moni_lodge_payments_v1';
const VERSION_STORAGE_KEY = 'moni_lodge_schema_version';

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
  const [floors, setFloors] = useState(() =>
    loadFromStorage(FLOORS_STORAGE_KEY, initialFloors)
  );
  const [paymentsByMonth, setPaymentsByMonth] = useState(() =>
    loadFromStorage(PAYMENTS_STORAGE_KEY, initialPaymentsByMonth)
  );

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

  const resetToDefaults = useCallback(() => {
    setFloors(initialFloors);
    setPaymentsByMonth(initialPaymentsByMonth);
    try {
      localStorage.removeItem(FLOORS_STORAGE_KEY);
      localStorage.removeItem(PAYMENTS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <BuildingContext.Provider
      value={{
        building: initialBuilding,
        floors,
        setFloors,
        paymentsByMonth,
        recordRentPayment,
        clearRentPayment,
        updateUnit,
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
