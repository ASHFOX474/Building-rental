// Client API wrapper for Neon PostgreSQL backend routes (/api/db/*)

async function requestDbJson(url, options = {}) {
  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || (data && data.ok === false)) {
    const err = new Error(
      data?.messageBn || data?.message || `Database request failed (${res.status})`
    );
    err.status = res.status;
    err.code = data?.code || 'DB_API_ERROR';
    err.data = data;
    throw err;
  }

  return data;
}

/** Fetch complete hydrated building state (floors, units, paymentsByMonth, settings) from Neon. */
export function fetchDbState() {
  return requestDbJson('/api/db/state');
}

/** Persist partial or full updates for a single unit (To-Let, rent, tenant, media, etc.). */
export function patchDbUnit(unitCode, changes) {
  return requestDbJson(`/api/db/units/${encodeURIComponent(unitCode)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
}

/** Upsert a monthly rent payment record for a unit + month_key. */
export function upsertDbPayment(payload) {
  return requestDbJson('/api/db/payments', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Delete/reset a monthly rent payment record (marks the unit unpaid for that month). */
export function deleteDbPayment(unitCode, monthKey) {
  return requestDbJson(
    `/api/db/payments/${encodeURIComponent(unitCode)}/${encodeURIComponent(monthKey)}`,
    {
      method: 'DELETE',
    }
  );
}

/** Upsert monthly building expenses for a month_key (optionally updating recurring defaults). */
export function upsertDbExpense(payload) {
  return requestDbJson('/api/db/expenses', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Persist a newly added building floor (e.g. 6th floor 'F') and its units. */
export function createDbFloor(floorPayload) {
  return requestDbJson('/api/db/floors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(floorPayload),
  });
}

/** Update a floor's public visibility or metadata. */
export function patchDbFloor(floorId, changes) {
  return requestDbJson(`/api/db/floors/${encodeURIComponent(floorId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
}

/** Remove a dynamically added floor and its units. */
export function deleteDbFloor(floorId) {
  return requestDbJson(`/api/db/floors/${encodeURIComponent(floorId)}`, {
    method: 'DELETE',
  });
}

/** Update building settings (contact phone numbers, WhatsApp, Admin PIN, building name). */
export function patchDbSettings(changes) {
  return requestDbJson('/api/db/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
}

/** Restore full building state from a JSON backup object (or reset to defaults). */
export function restoreDbBackup(backupPayload) {
  return requestDbJson('/api/db/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backupPayload),
  });
}
