// Client API wrapper for Google Drive backend routes (/api/drive/*)

async function requestJson(url, options = {}) {
  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || (data && data.ok === false)) {
    const err = new Error(
      data?.messageBn || data?.message || `Request failed (${res.status})`
    );
    err.status = res.status;
    err.code = data?.code || 'API_ERROR';
    err.data = data;
    throw err;
  }

  return data;
}

/** Extract a Google Drive File ID from legacy thumbnail/uc/file URLs if stored in DB. */
export function extractLegacyDriveImageId(rawUrl = '') {
  const s = String(rawUrl || '').trim();
  if (!s || !s.includes('drive.google.com')) return '';
  const dMatch = s.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (dMatch) return dMatch[1];
  const idMatch = s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (idMatch) return idMatch[1];
  return '';
}

/**
 * Resolve any media item (or legacy Drive image URL) to our authenticated image proxy
 * endpoint `/api/drive/image/:fileId`, preventing Google 429 rate-limits and CORS blocks.
 */
export function resolveDriveImageUrl(item) {
  if (!item) return '';
  if (typeof item === 'string') {
    const legacyId = extractLegacyDriveImageId(item);
    return legacyId ? `/api/drive/image/${encodeURIComponent(legacyId)}` : item;
  }

  if (item.driveFileId) {
    return `/api/drive/image/${encodeURIComponent(item.driveFileId)}`;
  }

  const raw = item.url || item.previewUrl || '';
  const legacyId = extractLegacyDriveImageId(raw);
  if (legacyId) {
    return `/api/drive/image/${encodeURIComponent(legacyId)}`;
  }
  return raw;
}

/** Check backend & Google Drive API connection status. */
export function fetchDriveStatus() {
  return requestJson('/api/drive/status');
}

/** Scan all floors & units in Google Drive and persist normalized media metadata to Neon. */
export function syncAllUnitsFromDriveApi({ overwriteEmpty = true } = {}) {
  const qs = `?overwriteEmpty=${overwriteEmpty ? 'true' : 'false'}`;
  return requestJson(`/api/drive/sync-all${qs}`);
}

/** Scan a single unit folder (e.g. E1, B2, A1) in Google Drive. */
export function syncUnitFromDriveApi(unitId, unitFolderId = '') {
  return requestJson(`/api/drive/sync/${encodeURIComponent(unitId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unitFolderId }),
  });
}

/** Create a room subfolder inside the unit's Google Drive folder. */
export function createDriveRoomFolderApi(unitId, name, unitFolderId = '') {
  return requestJson(`/api/drive/units/${encodeURIComponent(unitId)}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, unitFolderId }),
  });
}

/** Rename an existing room subfolder in Google Drive. */
export function renameDriveFolderApi(folderId, name) {
  return requestJson(`/api/drive/folders/${encodeURIComponent(folderId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

/** Upload one or more photo/video files directly to Google Drive via backend multer stream. */
export function uploadFilesToDriveApi({
  files,
  unitId,
  unitFolderId = '',
  roomFolderId = '',
  roomName = '',
  isMainVideo = false,
}) {
  const formData = new FormData();
  formData.append('unitId', unitId);
  if (unitFolderId) formData.append('unitFolderId', unitFolderId);
  if (roomFolderId) formData.append('roomFolderId', roomFolderId);
  if (roomName) formData.append('roomName', roomName);
  formData.append('isMainVideo', isMainVideo ? 'true' : 'false');

  for (const file of files) {
    formData.append('files', file);
  }

  return requestJson('/api/drive/upload', {
    method: 'POST',
    body: formData,
  });
}

/** Delete/trash a file or folder in Google Drive (or unlink from parent folder if owned by owner). */
export function deleteDriveItemApi(fileId, parentId = '') {
  const qs = parentId ? `?parentId=${encodeURIComponent(parentId)}` : '';
  return requestJson(`/api/drive/files/${encodeURIComponent(fileId)}${qs}`, {
    method: 'DELETE',
  });
}

/** Ensure a pasted Drive File ID is publicly readable and retrieve its real filename/type. */
export function ensureDriveFilePublicApi(fileId) {
  return requestJson('/api/drive/ensure-public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId }),
  });
}
