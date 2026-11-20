import { getPool, isDbConfigured, query, withTransaction } from '../config/db.js';
import {
  DEFAULT_BUILDING_META,
  DEFAULT_FLOORS_SEED,
  DEFAULT_PAYMENTS_SEED,
  DEFAULT_SETTINGS,
} from '../data/seedData.js';

let initPromise = null;

function formatBanglaDigitsServer(value) {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value ?? '').replace(/[0-9]/g, (d) => digits[Number(d)]);
}

function formatPhoneDisplay(raw = '') {
  const clean = String(raw || '').replace(/\D/g, '');
  if (clean.length === 11) {
    const dashed = `${clean.slice(0, 5)}-${clean.slice(5)}`;
    return {
      raw: clean,
      display: dashed,
      displayBn: formatBanglaDigitsServer(dashed),
    };
  }
  return {
    raw: clean,
    display: clean,
    displayBn: formatBanglaDigitsServer(clean),
  };
}

/** Seed all 5 default floors, 12 units, initial payments, and core app_settings. */
async function seedDefaultData(client, { forceReset = false } = {}) {
  if (forceReset) {
    await client.query('DELETE FROM rent_payments');
    await client.query('DELETE FROM units');
    await client.query('DELETE FROM floors');
  }

  for (const floor of DEFAULT_FLOORS_SEED) {
    await client.query(
      `INSERT INTO floors (id, code, label, sort_order, is_visible, template_type, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [
        floor.id,
        floor.code,
        floor.label,
        floor.sort_order,
        floor.is_visible,
        floor.template_type,
        JSON.stringify(floor.meta || {}),
      ]
    );

    for (const unit of floor.units) {
      await client.query(
        `INSERT INTO units (
           unit_code, floor_id, is_owner, is_to_let, monthly_rent,
           available_from, bills_included, tenant_name, tenant_phone,
           drive_folder_id, main_video, media_sections, meta
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13::jsonb)
         ON CONFLICT (unit_code) DO NOTHING`,
        [
          unit.unit_code,
          floor.id,
          unit.is_owner,
          unit.is_to_let,
          unit.monthly_rent,
          unit.available_from || '',
          unit.bills_included !== false,
          unit.tenant_name || '',
          unit.tenant_phone || '',
          unit.drive_folder_id || '',
          unit.main_video ? JSON.stringify(unit.main_video) : null,
          JSON.stringify(unit.media_sections || []),
          JSON.stringify(unit.meta || {}),
        ]
      );
    }
  }

  const payCountRes = await client.query('SELECT COUNT(*)::int AS cnt FROM rent_payments');
  if (forceReset || payCountRes.rows[0].cnt === 0) {
    for (const p of DEFAULT_PAYMENTS_SEED) {
      await client.query(
        `INSERT INTO rent_payments (
           unit_code, month_key, expected_amount, paid_amount,
           payment_method, paid_date, is_on_time, note
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (unit_code, month_key) DO NOTHING`,
        [
          p.unit_code,
          p.month_key,
          p.expected_amount,
          p.paid_amount,
          p.payment_method,
          p.paid_date,
          p.is_on_time,
          p.note || '',
        ]
      );
    }
  }

  for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
    const sql = forceReset
      ? `INSERT INTO app_settings (key, value, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`
      : `INSERT INTO app_settings (key, value, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO NOTHING`;
    await client.query(sql, [key, JSON.stringify(val)]);
  }
}

/**
 * Automatically create Neon PostgreSQL tables on startup and seed defaults if empty.
 * Safe to call repeatedly — memoized once initialized.
 */
export async function initDatabase() {
  if (!isDbConfigured()) {
    getPool(); // trigger clear single warning
    return { ready: false, reason: 'missing_database_url' };
  }

  if (!initPromise) {
    initPromise = (async () => {
      await withTransaction(async (client) => {
        await client.query(`
          CREATE TABLE IF NOT EXISTS floors (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            label TEXT NOT NULL,
            sort_order INT NOT NULL,
            is_visible BOOLEAN DEFAULT true,
            template_type TEXT,
            meta JSONB DEFAULT '{}'::jsonb
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS units (
            unit_code TEXT PRIMARY KEY,
            floor_id TEXT NOT NULL,
            is_owner BOOLEAN DEFAULT false,
            is_to_let BOOLEAN DEFAULT false,
            monthly_rent INT DEFAULT 0,
            available_from TEXT DEFAULT '',
            bills_included BOOLEAN DEFAULT true,
            tenant_name TEXT DEFAULT '',
            tenant_phone TEXT DEFAULT '',
            drive_folder_id TEXT DEFAULT '',
            main_video JSONB,
            media_sections JSONB DEFAULT '[]'::jsonb,
            meta JSONB DEFAULT '{}'::jsonb,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS rent_payments (
            id SERIAL PRIMARY KEY,
            unit_code TEXT NOT NULL,
            month_key TEXT NOT NULL,
            expected_amount INT NOT NULL,
            paid_amount INT DEFAULT 0,
            payment_method TEXT DEFAULT 'Cash',
            paid_date TEXT DEFAULT '',
            is_on_time BOOLEAN DEFAULT true,
            note TEXT DEFAULT '',
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(unit_code, month_key)
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        // Ensure additive metadata columns exist if tables were pre-created manually
        await client.query(
          `ALTER TABLE floors ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;`
        );
        await client.query(
          `ALTER TABLE units ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;`
        );

        // Clean out any legacy dummy sample video URLs if a unit has no real Drive video
        await client.query(`
          UPDATE units
          SET main_video = NULL, updated_at = NOW()
          WHERE main_video IS NOT NULL
            AND COALESCE(main_video->>'driveVideoId', '') = ''
            AND COALESCE(main_video->>'mainVideoUrl', '') LIKE '%commondatastorage.googleapis.com%'
        `);

        const floorCount = (await client.query('SELECT COUNT(*)::int AS cnt FROM floors')).rows[0].cnt;
        const unitCount = (await client.query('SELECT COUNT(*)::int AS cnt FROM units')).rows[0].cnt;

        if (floorCount === 0 || unitCount === 0) {
          console.log('[db] Empty Neon tables detected — running automatic initial seed...');
          await seedDefaultData(client, { forceReset: false });
          console.log('[db] Seeded 5 floors (A–E), 12 units (A1–E3), payments & app_settings.');
        } else {
          // Ensure core settings keys always exist
          for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
            await client.query(
              `INSERT INTO app_settings (key, value, updated_at)
               VALUES ($1, $2::jsonb, NOW())
               ON CONFLICT (key) DO NOTHING`,
              [key, JSON.stringify(val)]
            );
          }
        }
      });

      console.log('[db] Neon PostgreSQL tables verified and ready.');
      return { ready: true };
    })().catch((err) => {
      initPromise = null; // allow retry on transient network startup glitch
      console.error('[db] Database initialization error:', err.message);
      throw err;
    });
  }

  return initPromise;
}

/** Convert a PostgreSQL `units` row into the frontend BuildingContext unit shape. */
function rowToFrontendUnit(row) {
  const meta = row.meta && typeof row.meta === 'object' ? row.meta : {};
  const mainVideo = row.main_video && typeof row.main_video === 'object' ? row.main_video : {};
  const mediaSectionsArr = Array.isArray(row.media_sections) ? row.media_sections : [];

  const status = row.is_owner ? 'owner' : row.is_to_let ? 'available' : 'occupied';
  return {
    id: row.unit_code,
    floorId: row.floor_id,
    widthPct: meta.widthPct ?? 38,
    status,
    is_to_let: Boolean(row.is_to_let),
    rent: Number(row.monthly_rent || 0),
    availableFrom: row.available_from || '',
    availableFromFullBn: meta.availableFromFullBn || '',
    inclusiveBills: row.bills_included !== false,
    bedrooms: meta.bedrooms,
    washrooms: meta.washrooms,
    balconies: meta.balconies,
    hasSeparateDrawingDining: Boolean(meta.hasSeparateDrawingDining),
    ownerLabelBn: meta.ownerLabelBn,
    ownerSubtextBn: meta.ownerSubtextBn,
    roomsSummaryBn: meta.roomsSummaryBn || '',
    facingBn: meta.facingBn || '',
    tenantTypeBn: meta.tenantTypeBn || '',
    renterNameBn: row.tenant_name || '',
    renterPhone: row.tenant_phone || '',
    driveFolderId: row.drive_folder_id || '',
    driveFolderUrl:
      meta.driveFolderUrl ||
      (row.drive_folder_id ? `https://drive.google.com/drive/folders/${row.drive_folder_id}` : ''),
    driveVideoId: mainVideo.driveVideoId || '',
    mainVideoUrl: mainVideo.mainVideoUrl || '',
    mainVideoFileName: mainVideo.mainVideoFileName || '',
    mediaSections: mediaSectionsArr,
  };
}

/** Hydrate the complete app state (building, floors, units, paymentsByMonth, settings) from Neon. */
export async function getHydratedState() {
  await initDatabase();

  const [floorsRes, unitsRes, paymentsRes, settingsRes] = await Promise.all([
    query('SELECT * FROM floors ORDER BY sort_order DESC, code DESC'),
    query('SELECT * FROM units ORDER BY unit_code ASC'),
    query('SELECT * FROM rent_payments ORDER BY month_key DESC, unit_code ASC'),
    query('SELECT key, value FROM app_settings'),
  ]);

  const settingsMap = {};
  for (const row of settingsRes.rows) {
    settingsMap[row.key] = row.value;
  }

  const buildingName =
    typeof settingsMap.building_name === 'string' && settingsMap.building_name
      ? settingsMap.building_name
      : DEFAULT_SETTINGS.building_name;
  const contactPhones = Array.isArray(settingsMap.contact_phones)
    ? settingsMap.contact_phones.filter(Boolean)
    : DEFAULT_SETTINGS.contact_phones;
  const whatsappNumber =
    typeof settingsMap.whatsapp_number === 'string' && settingsMap.whatsapp_number
      ? settingsMap.whatsapp_number
      : DEFAULT_SETTINGS.whatsapp_number;
  const adminPin =
    typeof settingsMap.admin_pin === 'string' && /^\d{4}$/.test(settingsMap.admin_pin)
      ? settingsMap.admin_pin
      : DEFAULT_SETTINGS.admin_pin;
  const buildingMeta =
    settingsMap.building_meta && typeof settingsMap.building_meta === 'object'
      ? { ...DEFAULT_BUILDING_META, ...settingsMap.building_meta }
      : DEFAULT_BUILDING_META;

  const primaryPhone = contactPhones[0] || DEFAULT_SETTINGS.contact_phones[0];
  const secondaryPhone = contactPhones[1] ?? '';

  const building = {
    name: buildingName,
    area: buildingMeta.area,
    perks: buildingMeta.perks,
    showRentOnOccupied: buildingMeta.showRentOnOccupied !== false,
    location: buildingMeta.location,
    contact: {
      personBn: buildingMeta.contactPersonBn || DEFAULT_BUILDING_META.contactPersonBn,
      phone: primaryPhone,
      phoneSecondary: secondaryPhone,
      phones: [primaryPhone, secondaryPhone].filter(Boolean).map(formatPhoneDisplay),
      whatsapp: whatsappNumber,
      externalMediaUrl: buildingMeta.externalMediaUrl || DEFAULT_BUILDING_META.externalMediaUrl,
    },
    surroundings: buildingMeta.surroundings,
  };

  // Group units by floor_id preserving logical order (unitOrder then unit_code)
  const unitsByFloorId = new Map();
  const flatUnits = [];

  const sortedUnitRows = unitsRes.rows.slice().sort((a, b) => {
    const orderA = Number(a.meta?.unitOrder ?? 999);
    const orderB = Number(b.meta?.unitOrder ?? 999);
    if (orderA !== orderB) return orderA - orderB;
    return String(a.unit_code).localeCompare(String(b.unit_code));
  });

  for (const uRow of sortedUnitRows) {
    const u = rowToFrontendUnit(uRow);
    flatUnits.push(u);
    if (!unitsByFloorId.has(uRow.floor_id)) {
      unitsByFloorId.set(uRow.floor_id, []);
    }
    unitsByFloorId.get(uRow.floor_id).push(u);
  }

  const floors = floorsRes.rows.map((fRow) => {
    const fMeta = fRow.meta && typeof fRow.meta === 'object' ? fRow.meta : {};
    return {
      dbId: fRow.id,
      id: fRow.code,
      floorNumber: Number(fRow.sort_order),
      nameBn: fRow.label,
      titleBn: fMeta.titleBn || `${fRow.label} (ফ্লোর ${fRow.code})`,
      blueprintReady: fMeta.blueprintReady !== false,
      isVisible: fRow.is_visible !== false,
      templateType: fRow.template_type || 'three-unit',
      legendPills: Array.isArray(fMeta.legendPills) ? fMeta.legendPills : [],
      units: unitsByFloorId.get(fRow.id) || [],
    };
  });

  const paymentsByMonth = {};
  for (const pRow of paymentsRes.rows) {
    if (!paymentsByMonth[pRow.month_key]) {
      paymentsByMonth[pRow.month_key] = {};
    }
    paymentsByMonth[pRow.month_key][pRow.unit_code] = {
      expectedAmount: Number(pRow.expected_amount || 0),
      paidAmount: Number(pRow.paid_amount || 0),
      method: pRow.payment_method || 'Cash',
      paymentDate: pRow.paid_date || '',
      paidOnTime: pRow.is_on_time !== false,
      note: pRow.note || '',
    };
  }

  return {
    building,
    floors,
    units: flatUnits,
    paymentsByMonth,
    settings: {
      adminPin,
      contactPhones,
      whatsappNumber,
      buildingName,
    },
  };
}

/** Update any fields of a single unit in Neon PostgreSQL (accepts camelCase or snake_case). */
export async function updateUnitInDb(unitCode, changes = {}) {
  await initDatabase();
  const normalizedCode = String(unitCode || '').trim().toUpperCase();
  const existingRes = await query('SELECT * FROM units WHERE UPPER(unit_code) = $1', [normalizedCode]);

  if (existingRes.rows.length === 0) {
    const err = new Error(`Unit ${normalizedCode} not found in database.`);
    err.status = 404;
    throw err;
  }

  const row = existingRes.rows[0];
  const prevMeta = row.meta && typeof row.meta === 'object' ? row.meta : {};
  const prevVideo = row.main_video && typeof row.main_video === 'object' ? row.main_video : {};

  let isOwner = row.is_owner;
  let isToLet = row.is_to_let;

  if (typeof changes.is_owner === 'boolean') isOwner = changes.is_owner;
  if (typeof changes.is_to_let === 'boolean') isToLet = changes.is_to_let;
  if (typeof changes.status === 'string') {
    if (changes.status === 'owner') {
      isOwner = true;
      isToLet = false;
    } else if (changes.status === 'available') {
      isOwner = false;
      isToLet = true;
    } else if (changes.status === 'occupied') {
      isOwner = false;
      isToLet = false;
    }
  }

  const monthlyRent =
    changes.monthly_rent !== undefined
      ? Number(changes.monthly_rent)
      : changes.rent !== undefined
        ? Number(changes.rent)
        : row.monthly_rent;

  const availableFrom =
    changes.available_from !== undefined
      ? String(changes.available_from ?? '')
      : changes.availableFrom !== undefined
        ? String(changes.availableFrom ?? '')
        : row.available_from;

  const billsIncluded =
    changes.bills_included !== undefined
      ? Boolean(changes.bills_included)
      : changes.inclusiveBills !== undefined
        ? Boolean(changes.inclusiveBills)
        : row.bills_included;

  const tenantName =
    changes.tenant_name !== undefined
      ? String(changes.tenant_name ?? '')
      : changes.renterNameBn !== undefined
        ? String(changes.renterNameBn ?? '')
        : row.tenant_name;

  const tenantPhone =
    changes.tenant_phone !== undefined
      ? String(changes.tenant_phone ?? '')
      : changes.renterPhone !== undefined
        ? String(changes.renterPhone ?? '')
        : row.tenant_phone;

  const driveFolderId =
    changes.drive_folder_id !== undefined
      ? String(changes.drive_folder_id ?? '')
      : changes.driveFolderId !== undefined
        ? String(changes.driveFolderId ?? '')
        : row.drive_folder_id;

  let nextVideo = { ...prevVideo };
  if (changes.main_video !== undefined) {
    nextVideo = changes.main_video || {};
  }
  if (changes.driveVideoId !== undefined) nextVideo.driveVideoId = changes.driveVideoId || '';
  if (changes.mainVideoUrl !== undefined) nextVideo.mainVideoUrl = changes.mainVideoUrl || '';
  if (changes.mainVideoFileName !== undefined) {
    nextVideo.mainVideoFileName = changes.mainVideoFileName || '';
  }
  const hasAnyVideoVal = Boolean(
    nextVideo.driveVideoId || nextVideo.mainVideoUrl || nextVideo.mainVideoFileName
  );
  const serializedVideo = hasAnyVideoVal ? JSON.stringify(nextVideo) : null;

  const incomingSections =
    changes.media_sections !== undefined
      ? changes.media_sections
      : changes.mediaSections !== undefined
        ? changes.mediaSections
        : undefined;

  const nextSections =
    incomingSections !== undefined
      ? Array.isArray(incomingSections)
        ? incomingSections
        : []
      : Array.isArray(row.media_sections)
        ? row.media_sections
        : [];

  const nextMeta = { ...prevMeta };
  if (incomingSections !== undefined) {
    nextMeta.mediaCustomized = true;
  }
  const metaKeys = [
    'widthPct',
    'availableFromFullBn',
    'bedrooms',
    'washrooms',
    'balconies',
    'ownerLabelBn',
    'ownerSubtextBn',
    'hasSeparateDrawingDining',
    'roomsSummaryBn',
    'facingBn',
    'tenantTypeBn',
    'driveFolderUrl',
  ];
  for (const key of metaKeys) {
    if (changes[key] !== undefined) {
      nextMeta[key] = changes[key];
    }
  }

  const updatedRes = await query(
    `UPDATE units
     SET is_owner = $2,
         is_to_let = $3,
         monthly_rent = $4,
         available_from = $5,
         bills_included = $6,
         tenant_name = $7,
         tenant_phone = $8,
         drive_folder_id = $9,
         main_video = $10::jsonb,
         media_sections = $11::jsonb,
         meta = $12::jsonb,
         updated_at = NOW()
     WHERE unit_code = $1
     RETURNING *`,
    [
      row.unit_code,
      isOwner,
      isToLet,
      monthlyRent,
      availableFrom,
      billsIncluded,
      tenantName,
      tenantPhone,
      driveFolderId,
      serializedVideo,
      JSON.stringify(nextSections),
      JSON.stringify(nextMeta),
    ]
  );

  return rowToFrontendUnit(updatedRes.rows[0]);
}

/** Upsert a monthly rent payment record for a unit + month_key. */
export async function upsertPaymentInDb(payload = {}) {
  await initDatabase();
  const unitCode = String(payload.unit_code || payload.unitCode || payload.unitId || '')
    .trim()
    .toUpperCase();
  const monthKey = String(payload.month_key || payload.monthKey || '').trim();

  if (!unitCode || !monthKey) {
    const err = new Error('unit_code and month_key are required.');
    err.status = 400;
    throw err;
  }

  let expectedAmount =
    payload.expected_amount !== undefined
      ? Number(payload.expected_amount)
      : payload.expectedAmount !== undefined
        ? Number(payload.expectedAmount)
        : null;

  if (expectedAmount === null || Number.isNaN(expectedAmount)) {
    const unitRes = await query('SELECT monthly_rent FROM units WHERE unit_code = $1', [unitCode]);
    expectedAmount = Number(unitRes.rows[0]?.monthly_rent || 0);
  }

  const paidAmount = Number(
    payload.paid_amount !== undefined ? payload.paid_amount : payload.paidAmount || 0
  );
  const paymentMethod = String(
    payload.payment_method || payload.method || 'Cash'
  );
  const paidDate = String(
    payload.paid_date || payload.paymentDate || ''
  );
  const isOnTime =
    payload.is_on_time !== undefined
      ? Boolean(payload.is_on_time)
      : payload.paidOnTime !== undefined
        ? Boolean(payload.paidOnTime)
        : true;
  const note = String(payload.note || '');

  const res = await query(
    `INSERT INTO rent_payments (
       unit_code, month_key, expected_amount, paid_amount,
       payment_method, paid_date, is_on_time, note, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (unit_code, month_key)
     DO UPDATE SET
       expected_amount = EXCLUDED.expected_amount,
       paid_amount = EXCLUDED.paid_amount,
       payment_method = EXCLUDED.payment_method,
       paid_date = EXCLUDED.paid_date,
       is_on_time = EXCLUDED.is_on_time,
       note = EXCLUDED.note,
       updated_at = NOW()
     RETURNING *`,
    [unitCode, monthKey, expectedAmount, paidAmount, paymentMethod, paidDate, isOnTime, note]
  );

  return res.rows[0];
}

/** Delete/reset a monthly rent payment record for a unit + month_key. */
export async function deletePaymentInDb(unitCode, monthKey) {
  await initDatabase();
  const normalizedCode = String(unitCode || '').trim().toUpperCase();
  const res = await query(
    'DELETE FROM rent_payments WHERE UPPER(unit_code) = $1 AND month_key = $2 RETURNING id',
    [normalizedCode, String(monthKey || '').trim()]
  );
  return { deleted: res.rowCount > 0 };
}

/** Insert a newly added floor (e.g. 6th floor 'F') and its units atomically. */
export async function createFloorInDb(floorPayload = {}) {
  await initDatabase();

  return withTransaction(async (client) => {
    const maxRes = await client.query(
      'SELECT COALESCE(MAX(sort_order), 5)::int AS max_order FROM floors'
    );
    const nextSortOrder = Number(floorPayload.floorNumber || floorPayload.sort_order || maxRes.rows[0].max_order + 1);
    const floorId = String(floorPayload.dbId || nextSortOrder);
    const code = String(
      floorPayload.code || floorPayload.id || String.fromCharCode(64 + nextSortOrder)
    ).toUpperCase();
    const label = String(floorPayload.label || floorPayload.nameBn || `${formatBanglaDigitsServer(nextSortOrder)}তম তলা`);
    const isVisible = floorPayload.isVisible !== false && floorPayload.is_visible !== false;
    const templateType = String(floorPayload.templateType || floorPayload.template_type || 'three-unit');
    const floorMeta = {
      titleBn: floorPayload.titleBn || `${label} (ফ্লোর ${code})`,
      blueprintReady: floorPayload.blueprintReady !== false,
      legendPills: Array.isArray(floorPayload.legendPills) ? floorPayload.legendPills : [],
    };

    await client.query(
      `INSERT INTO floors (id, code, label, sort_order, is_visible, template_type, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         code = EXCLUDED.code,
         label = EXCLUDED.label,
         sort_order = EXCLUDED.sort_order,
         is_visible = EXCLUDED.is_visible,
         template_type = EXCLUDED.template_type,
         meta = EXCLUDED.meta`,
      [floorId, code, label, nextSortOrder, isVisible, templateType, JSON.stringify(floorMeta)]
    );

    const unitsInput = Array.isArray(floorPayload.units) ? floorPayload.units : [];
    for (let idx = 0; idx < unitsInput.length; idx += 1) {
      const u = unitsInput[idx];
      const uCode = String(u.unit_code || u.id || `${code}${idx + 1}`).toUpperCase();
      const isOwner = u.is_owner === true || u.status === 'owner';
      const isToLet = u.is_to_let === true || u.status === 'available';
      const mainVideo =
        u.driveVideoId || u.mainVideoUrl || u.mainVideoFileName
          ? {
              driveVideoId: u.driveVideoId || '',
              mainVideoUrl: u.mainVideoUrl || '',
              mainVideoFileName: u.mainVideoFileName || '',
            }
          : null;
      const uMeta = {
        unitOrder: idx + 1,
        widthPct: u.widthPct ?? (idx === 1 && unitsInput.length === 3 ? 24 : 38),
        availableFromFullBn: u.availableFromFullBn || '',
        bedrooms: u.bedrooms ?? (idx === 1 && unitsInput.length === 3 ? 2 : 3),
        washrooms: u.washrooms ?? 2,
        balconies: u.balconies ?? (idx === 1 && unitsInput.length === 3 ? 2 : 3),
        roomsSummaryBn: u.roomsSummaryBn || '',
        facingBn: u.facingBn || '',
        mediaCustomized: Array.isArray(u.mediaSections),
      };

      await client.query(
        `INSERT INTO units (
           unit_code, floor_id, is_owner, is_to_let, monthly_rent,
           available_from, bills_included, tenant_name, tenant_phone,
           drive_folder_id, main_video, media_sections, meta
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13::jsonb)
         ON CONFLICT (unit_code) DO NOTHING`,
        [
          uCode,
          floorId,
          isOwner,
          isToLet,
          Number(u.monthly_rent ?? u.rent ?? 12000),
          String(u.available_from ?? u.availableFrom ?? ''),
          u.bills_included !== false && u.inclusiveBills !== false,
          String(u.tenant_name ?? u.renterNameBn ?? ''),
          String(u.tenant_phone ?? u.renterPhone ?? ''),
          String(u.drive_folder_id ?? u.driveFolderId ?? ''),
          mainVideo ? JSON.stringify(mainVideo) : null,
          JSON.stringify(Array.isArray(u.mediaSections) ? u.mediaSections : []),
          JSON.stringify(uMeta),
        ]
      );
    }

    return { id: floorId, code, sort_order: nextSortOrder };
  });
}

/** Update a floor's visibility or metadata (matches by DB id `'1'..'6'` OR code `'A'..'F'`). */
export async function updateFloorInDb(floorIdOrCode, changes = {}) {
  await initDatabase();
  const key = String(floorIdOrCode || '').trim();
  const found = await query(
    'SELECT * FROM floors WHERE id = $1 OR UPPER(code) = UPPER($1)',
    [key]
  );

  if (found.rows.length === 0) {
    const err = new Error(`Floor ${key} not found.`);
    err.status = 404;
    throw err;
  }

  const row = found.rows[0];
  const prevMeta = row.meta && typeof row.meta === 'object' ? row.meta : {};

  const isVisible =
    changes.is_visible !== undefined
      ? Boolean(changes.is_visible)
      : changes.isVisible !== undefined
        ? Boolean(changes.isVisible)
        : row.is_visible;

  const label =
    changes.label !== undefined
      ? String(changes.label)
      : changes.nameBn !== undefined
        ? String(changes.nameBn)
        : row.label;

  const templateType =
    changes.template_type !== undefined
      ? String(changes.template_type)
      : changes.templateType !== undefined
        ? String(changes.templateType)
        : row.template_type;

  const nextMeta = { ...prevMeta };
  if (changes.titleBn !== undefined) nextMeta.titleBn = changes.titleBn;
  if (changes.legendPills !== undefined) nextMeta.legendPills = changes.legendPills;

  const updated = await query(
    `UPDATE floors
     SET is_visible = $2,
         label = $3,
         template_type = $4,
         meta = $5::jsonb
     WHERE id = $1
     RETURNING *`,
    [row.id, isVisible, label, templateType, JSON.stringify(nextMeta)]
  );

  return updated.rows[0];
}

/** Remove an added floor and all its child units atomically. */
export async function deleteFloorInDb(floorIdOrCode) {
  await initDatabase();
  const key = String(floorIdOrCode || '').trim();

  return withTransaction(async (client) => {
    const found = await client.query(
      'SELECT id, code FROM floors WHERE id = $1 OR UPPER(code) = UPPER($1)',
      [key]
    );
    if (found.rows.length === 0) {
      return { deleted: false };
    }
    const floorId = found.rows[0].id;
    await client.query('DELETE FROM units WHERE floor_id = $1', [floorId]);
    await client.query('DELETE FROM floors WHERE id = $1', [floorId]);
    return { deleted: true, id: floorId, code: found.rows[0].code };
  });
}

/** Update settings keys (`admin_pin`, `contact_phones`, `whatsapp_number`, `building_name`, etc.). */
export async function updateSettingsInDb(changes = {}) {
  await initDatabase();

  const updates = [];

  const pinVal = changes.admin_pin ?? changes.adminPin;
  if (pinVal !== undefined) {
    const cleanPin = String(pinVal).trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      const err = new Error('Admin PIN must be exactly 4 digits.');
      err.status = 400;
      throw err;
    }
    updates.push(['admin_pin', cleanPin]);
  }

  if (Array.isArray(changes.contact_phones)) {
    updates.push(['contact_phones', changes.contact_phones.map((p) => String(p || '').trim())]);
  } else if (changes.phone !== undefined || changes.phoneSecondary !== undefined) {
    const existingRes = await query(`SELECT value FROM app_settings WHERE key = 'contact_phones'`);
    const currentPhones = Array.isArray(existingRes.rows[0]?.value)
      ? existingRes.rows[0].value
      : DEFAULT_SETTINGS.contact_phones;
    const nextPrimary = changes.phone !== undefined ? String(changes.phone).trim() : currentPhones[0] || '';
    const nextSecondary =
      changes.phoneSecondary !== undefined ? String(changes.phoneSecondary).trim() : currentPhones[1] || '';
    updates.push(['contact_phones', [nextPrimary, nextSecondary]]);
  }

  const waVal = changes.whatsapp_number ?? changes.whatsapp;
  if (waVal !== undefined) {
    updates.push(['whatsapp_number', String(waVal).trim()]);
  }

  const nameVal = changes.building_name ?? changes.buildingName;
  if (nameVal !== undefined) {
    updates.push(['building_name', String(nameVal).trim()]);
  }

  if (changes.building_meta && typeof changes.building_meta === 'object') {
    updates.push(['building_meta', changes.building_meta]);
  }

  await withTransaction(async (client) => {
    for (const [key, val] of updates) {
      await client.query(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, JSON.stringify(val)]
      );
    }
  });

  return getHydratedState();
}

/** Restore full building, floors, units, payments & settings from JSON backup or reset to defaults. */
export async function restoreFullStateInDb(backupObj = {}) {
  await initDatabase();

  if (backupObj.resetToDefaults === true) {
    await withTransaction(async (client) => {
      await seedDefaultData(client, { forceReset: true });
    });
    return getHydratedState();
  }

  if (!Array.isArray(backupObj.floors) || backupObj.floors.length === 0) {
    const err = new Error('Invalid backup payload: floors array is required.');
    err.status = 400;
    throw err;
  }

  await withTransaction(async (client) => {
    await client.query('DELETE FROM rent_payments');
    await client.query('DELETE FROM units');
    await client.query('DELETE FROM floors');

    const unitRentMap = new Map();

    for (const f of backupObj.floors) {
      const sortOrder = Number(f.floorNumber || f.sort_order || 1);
      const floorId = String(f.dbId || sortOrder);
      const code = String(f.id || f.code || String.fromCharCode(64 + sortOrder)).toUpperCase();
      const label = String(f.nameBn || f.label || `${formatBanglaDigitsServer(sortOrder)}ম তলা`);
      const templateType =
        f.templateType ||
        (sortOrder === 1 ? 'ground' : sortOrder === 2 ? 'owner-duplex' : sortOrder === 3 ? 'two-unit' : 'three-unit');

      const floorMeta = {
        titleBn: f.titleBn || `${label} (ফ্লোর ${code})`,
        blueprintReady: f.blueprintReady !== false,
        legendPills: Array.isArray(f.legendPills) ? f.legendPills : [],
      };

      await client.query(
        `INSERT INTO floors (id, code, label, sort_order, is_visible, template_type, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
        [floorId, code, label, sortOrder, f.isVisible !== false, templateType, JSON.stringify(floorMeta)]
      );

      const unitsList = Array.isArray(f.units) ? f.units : [];
      for (let idx = 0; idx < unitsList.length; idx += 1) {
        const u = unitsList[idx];
        const uCode = String(u.id || u.unit_code).toUpperCase();
        const rentNum = Number(u.rent ?? u.monthly_rent ?? 0);
        unitRentMap.set(uCode, rentNum);

        const mainVideo =
          u.driveVideoId || u.mainVideoUrl || u.mainVideoFileName
            ? {
                driveVideoId: u.driveVideoId || '',
                mainVideoUrl: u.mainVideoUrl || '',
                mainVideoFileName: u.mainVideoFileName || '',
              }
            : null;

        const uMeta = {
          unitOrder: idx + 1,
          widthPct: u.widthPct ?? 38,
          availableFromFullBn: u.availableFromFullBn || '',
          bedrooms: u.bedrooms,
          washrooms: u.washrooms,
          balconies: u.balconies,
          ownerLabelBn: u.ownerLabelBn,
          ownerSubtextBn: u.ownerSubtextBn,
          hasSeparateDrawingDining: Boolean(u.hasSeparateDrawingDining),
          roomsSummaryBn: u.roomsSummaryBn || '',
          facingBn: u.facingBn || '',
          tenantTypeBn: u.tenantTypeBn || '',
          driveFolderUrl: u.driveFolderUrl || '',
          mediaCustomized: Array.isArray(u.mediaSections),
        };

        await client.query(
          `INSERT INTO units (
             unit_code, floor_id, is_owner, is_to_let, monthly_rent,
             available_from, bills_included, tenant_name, tenant_phone,
             drive_folder_id, main_video, media_sections, meta
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13::jsonb)`,
          [
            uCode,
            floorId,
            u.status === 'owner' || u.is_owner === true,
            u.status === 'available' || u.is_to_let === true,
            rentNum,
            String(u.availableFrom || u.available_from || ''),
            u.inclusiveBills !== false,
            String(u.renterNameBn || u.tenant_name || ''),
            String(u.renterPhone || u.tenant_phone || ''),
            String(u.driveFolderId || u.drive_folder_id || ''),
            mainVideo ? JSON.stringify(mainVideo) : null,
            JSON.stringify(Array.isArray(u.mediaSections) ? u.mediaSections : []),
            JSON.stringify(uMeta),
          ]
        );
      }
    }

    if (backupObj.paymentsByMonth && typeof backupObj.paymentsByMonth === 'object') {
      for (const [monthKey, unitRecords] of Object.entries(backupObj.paymentsByMonth)) {
        if (!unitRecords || typeof unitRecords !== 'object') continue;
        for (const [uCode, rec] of Object.entries(unitRecords)) {
          if (!rec || typeof rec !== 'object') continue;
          const normalizedCode = String(uCode).toUpperCase();
          await client.query(
            `INSERT INTO rent_payments (
               unit_code, month_key, expected_amount, paid_amount,
               payment_method, paid_date, is_on_time, note
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (unit_code, month_key) DO UPDATE SET
               expected_amount = EXCLUDED.expected_amount,
               paid_amount = EXCLUDED.paid_amount,
               payment_method = EXCLUDED.payment_method,
               paid_date = EXCLUDED.paid_date,
               is_on_time = EXCLUDED.is_on_time,
               note = EXCLUDED.note,
               updated_at = NOW()`,
            [
              normalizedCode,
              monthKey,
              Number(rec.expectedAmount ?? unitRentMap.get(normalizedCode) ?? 0),
              Number(rec.paidAmount ?? 0),
              String(rec.method || 'Cash'),
              String(rec.paymentDate || ''),
              rec.paidOnTime !== false,
              String(rec.note || ''),
            ]
          );
        }
      }
    }

    if (backupObj.building && typeof backupObj.building === 'object') {
      const b = backupObj.building;
      const settingEntries = [];
      if (b.name) settingEntries.push(['building_name', b.name]);
      if (b.contact) {
        settingEntries.push([
          'contact_phones',
          [b.contact.phone || '', b.contact.phoneSecondary || ''],
        ]);
        if (b.contact.whatsapp) {
          settingEntries.push(['whatsapp_number', b.contact.whatsapp]);
        }
      }
      settingEntries.push([
        'building_meta',
        {
          ...DEFAULT_BUILDING_META,
          area: b.area || DEFAULT_BUILDING_META.area,
          perks: Array.isArray(b.perks) ? b.perks : DEFAULT_BUILDING_META.perks,
          showRentOnOccupied: b.showRentOnOccupied !== false,
          location: b.location || DEFAULT_BUILDING_META.location,
          contactPersonBn: b.contact?.personBn || DEFAULT_BUILDING_META.contactPersonBn,
          externalMediaUrl: b.contact?.externalMediaUrl || DEFAULT_BUILDING_META.externalMediaUrl,
          surroundings: b.surroundings || DEFAULT_BUILDING_META.surroundings,
        },
      ]);

      for (const [k, v] of settingEntries) {
        await client.query(
          `INSERT INTO app_settings (key, value, updated_at)
           VALUES ($1, $2::jsonb, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [k, JSON.stringify(v)]
        );
      }
    }
  });

  return getHydratedState();
}

/**
 * Persist synced Google Drive media for a single unit directly into Neon PostgreSQL.
 * Always writes the exact live Drive state (even when empty with 0 photos) so reload never reverts.
 */
export async function persistDriveSyncForUnit(unitCode, driveData, { overwriteEmpty = true } = {}) {
  if (!isDbConfigured() || !unitCode || !driveData) return null;
  try {
    await initDatabase();
    const normalized = String(unitCode).trim().toUpperCase();
    const existing = await query('SELECT unit_code FROM units WHERE unit_code = $1', [normalized]);
    if (existing.rows.length === 0) return null;

    const sections = Array.isArray(driveData.mediaSections) ? driveData.mediaSections : [];
    const hasDriveContent = sections.length > 0 || Boolean(driveData.driveVideoId);

    if (!overwriteEmpty && !hasDriveContent) {
      return updateUnitInDb(normalized, {
        driveFolderId: driveData.driveFolderId || '',
        driveFolderUrl: driveData.driveFolderUrl || '',
      });
    }

    const nextMainVideo = driveData.driveVideoId
      ? {
          driveVideoId: driveData.driveVideoId,
          mainVideoFileName: driveData.mainVideoFileName || '',
          mainVideoUrl: '',
        }
      : null;

    return updateUnitInDb(normalized, {
      driveFolderId: driveData.driveFolderId || '',
      driveFolderUrl: driveData.driveFolderUrl || '',
      main_video: nextMainVideo,
      media_sections: sections,
    });
  } catch (err) {
    console.error(`[db] Failed to persist Drive sync for unit ${unitCode}:`, err.message);
    return null;
  }
}

/** Persist all synced units from `/api/drive/sync-all` into Neon PostgreSQL. */
export async function persistDriveSyncAll(unitsMap = {}, { overwriteEmpty = true } = {}) {
  if (!isDbConfigured() || !unitsMap) return;
  for (const [unitCode, driveData] of Object.entries(unitsMap)) {
    await persistDriveSyncForUnit(unitCode, driveData, { overwriteEmpty });
  }
}

/** Persist a newly created Drive room subfolder directly into the unit's media_sections in Neon. */
export async function persistDriveFolderCreated(unitCode, folder, unitFolderId = '') {
  if (!isDbConfigured() || !unitCode || !folder?.id) return;
  try {
    await initDatabase();
    const normalized = String(unitCode).trim().toUpperCase();
    const res = await query('SELECT * FROM units WHERE unit_code = $1', [normalized]);
    if (res.rows.length === 0) return;
    const row = res.rows[0];
    const sections = Array.isArray(row.media_sections) ? [...row.media_sections] : [];
    const alreadyExists = sections.some((s) => s.driveFolderId === folder.id);
    if (!alreadyExists) {
      sections.push({
        id: `drive-${folder.id}`,
        driveFolderId: folder.id,
        category: 'custom',
        titleBn: folder.name || 'নতুন রুম',
        items: [],
      });
    }
    await updateUnitInDb(normalized, {
      driveFolderId: unitFolderId || row.drive_folder_id || '',
      mediaSections: sections,
    });
  } catch (err) {
    console.error(`[db] Failed to persist created folder for unit ${unitCode}:`, err.message);
  }
}

/** Persist a renamed Drive room subfolder across any unit referencing it in Neon. */
export async function persistDriveFolderRenamed(folderId, newName) {
  if (!isDbConfigured() || !folderId || !newName) return;
  try {
    await initDatabase();
    const unitsRes = await query('SELECT unit_code, media_sections FROM units');
    for (const row of unitsRes.rows) {
      const sections = Array.isArray(row.media_sections) ? row.media_sections : [];
      let changed = false;
      const updatedSections = sections.map((sec) => {
        if (sec.driveFolderId === folderId) {
          changed = true;
          return { ...sec, titleBn: String(newName).trim() };
        }
        return sec;
      });
      if (changed) {
        await updateUnitInDb(row.unit_code, { media_sections: updatedSections });
      }
    }
  } catch (err) {
    console.error(`[db] Failed to persist renamed folder ${folderId}:`, err.message);
  }
}

/** Persist newly uploaded Drive media items into the target unit row in Neon PostgreSQL. */
export async function persistDriveUpload({
  unitId,
  unitFolderId,
  targetFolderId,
  roomName,
  isMainVideo,
  items = [],
}) {
  if (!isDbConfigured() || !unitId || items.length === 0) return;
  try {
    await initDatabase();
    const normalized = String(unitId).trim().toUpperCase();
    const res = await query('SELECT * FROM units WHERE unit_code = $1', [normalized]);
    if (res.rows.length === 0) return;
    const row = res.rows[0];

    if (isMainVideo) {
      const first = items[0];
      await updateUnitInDb(normalized, {
        driveFolderId: unitFolderId || row.drive_folder_id || '',
        driveVideoId: first.driveFileId || '',
        mainVideoFileName: first.fileName || 'full_video.mp4',
        mainVideoUrl: '',
      });
      return;
    }

    const sections = Array.isArray(row.media_sections) ? [...row.media_sections] : [];
    const idx = sections.findIndex(
      (s) =>
        (targetFolderId && s.driveFolderId === targetFolderId) ||
        (roomName && s.titleBn === roomName)
    );

    if (idx >= 0) {
      const existingItems = Array.isArray(sections[idx].items) ? sections[idx].items : [];
      sections[idx] = {
        ...sections[idx],
        driveFolderId: targetFolderId || sections[idx].driveFolderId,
        items: [...existingItems, ...items],
      };
    } else if (roomName) {
      sections.push({
        id: `sec-drive-${targetFolderId || Date.now()}`,
        driveFolderId: targetFolderId || '',
        driveFolderUrl: targetFolderId ? `https://drive.google.com/drive/folders/${targetFolderId}` : '',
        category: 'custom',
        titleBn: roomName,
        items,
      });
    }

    await updateUnitInDb(normalized, {
      driveFolderId: unitFolderId || row.drive_folder_id || '',
      mediaSections: sections,
    });
  } catch (err) {
    console.error(`[db] Failed to persist Drive upload for unit ${unitId}:`, err.message);
  }
}

/** Remove a deleted Drive file or room folder from any unit referencing it in Neon PostgreSQL. */
export async function persistDriveFileDeleted(fileId) {
  if (!isDbConfigured() || !fileId) return;
  try {
    await initDatabase();
    const unitsRes = await query('SELECT unit_code, main_video, media_sections FROM units');

    for (const row of unitsRes.rows) {
      let changed = false;
      let nextMainVideo = row.main_video;
      let nextSections = Array.isArray(row.media_sections) ? row.media_sections : [];

      if (nextMainVideo && nextMainVideo.driveVideoId === fileId) {
        nextMainVideo = null;
        changed = true;
      }

      const filteredSections = [];
      for (const sec of nextSections) {
        if (sec.driveFolderId === fileId) {
          changed = true;
          continue; // entire room folder deleted
        }
        const items = Array.isArray(sec.items) ? sec.items : [];
        const remainingItems = items.filter((it) => it.driveFileId !== fileId);
        if (remainingItems.length !== items.length) {
          changed = true;
        }
        filteredSections.push({ ...sec, items: remainingItems });
      }

      if (changed) {
        await updateUnitInDb(row.unit_code, {
          main_video: nextMainVideo,
          media_sections: filteredSections,
        });
      }
    }
  } catch (err) {
    console.error(`[db] Failed to remove deleted Drive file ${fileId} from DB:`, err.message);
  }
}
