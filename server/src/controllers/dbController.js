import { isDbConfigured } from '../config/db.js';
import {
  getHydratedState,
  updateUnitInDb,
  upsertPaymentInDb,
  deletePaymentInDb,
  createFloorInDb,
  updateFloorInDb,
  deleteFloorInDb,
  updateSettingsInDb,
  restoreFullStateInDb,
} from '../services/dbService.js';

function sendDbError(res, err) {
  if (err?.code === 'DB_NOT_CONFIGURED' || !isDbConfigured()) {
    return res.status(503).json({
      ok: false,
      code: 'DB_NOT_CONFIGURED',
      message: 'DATABASE_URL is not configured in server/.env',
      messageBn: 'ডাটাবেজ সংযোগ (DATABASE_URL) কনফিগার করা নেই।',
    });
  }

  const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
  console.error('[db route error]', err?.message || err);
  return res.status(status).json({
    ok: false,
    code: err?.code || 'DB_ERROR',
    message: err?.message || 'Database error',
    messageBn: err?.messageBn || '⚠️ ইন্টারনেট সংযোগ চেক করুন, ডাটা সেভ হয়নি',
  });
}

export async function getState(_req, res) {
  try {
    const state = await getHydratedState();
    res.json({ ok: true, connected: true, ...state });
  } catch (err) {
    sendDbError(res, err);
  }
}

export async function patchUnit(req, res) {
  try {
    const { unitCode } = req.params;
    const unit = await updateUnitInDb(unitCode, req.body || {});
    res.json({ ok: true, unit });
  } catch (err) {
    sendDbError(res, err);
  }
}

export async function putPayment(req, res) {
  try {
    const payment = await upsertPaymentInDb(req.body || {});
    res.json({ ok: true, payment });
  } catch (err) {
    sendDbError(res, err);
  }
}

export async function deletePayment(req, res) {
  try {
    const { unitCode, monthKey } = req.params;
    const result = await deletePaymentInDb(unitCode, monthKey);
    res.json({ ok: true, ...result });
  } catch (err) {
    sendDbError(res, err);
  }
}

export async function postFloor(req, res) {
  try {
    const floor = await createFloorInDb(req.body || {});
    res.status(201).json({ ok: true, floor });
  } catch (err) {
    sendDbError(res, err);
  }
}

export async function patchFloor(req, res) {
  try {
    const { floorId } = req.params;
    const floor = await updateFloorInDb(floorId, req.body || {});
    res.json({ ok: true, floor });
  } catch (err) {
    sendDbError(res, err);
  }
}

export async function deleteFloor(req, res) {
  try {
    const { floorId } = req.params;
    const result = await deleteFloorInDb(floorId);
    res.json({ ok: true, ...result });
  } catch (err) {
    sendDbError(res, err);
  }
}

export async function patchSettings(req, res) {
  try {
    const state = await updateSettingsInDb(req.body || {});
    res.json({ ok: true, ...state });
  } catch (err) {
    sendDbError(res, err);
  }
}

export async function postRestore(req, res) {
  try {
    const state = await restoreFullStateInDb(req.body || {});
    res.json({ ok: true, ...state });
  } catch (err) {
    sendDbError(res, err);
  }
}
