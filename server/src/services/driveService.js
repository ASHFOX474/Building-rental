import fs from 'node:fs';
import path from 'node:path';
import {
  getDriveClient,
  getRootFolderId,
  getDriveAuthMode,
  getServiceAccountEmail,
} from '../config/drive.js';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

/** Strip file extension for clean Bangla/English display captions. */
function stripExtension(filename = '') {
  return String(filename).replace(/\.[^/.]+$/, '').trim();
}

/** Escape single quotes for Google Drive `q` filter literals. */
function escapeDriveQuery(val = '') {
  return String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Infer a UI category key from a Bangla/English room folder name. */
function inferRoomCategory(name = '') {
  const s = String(name).toLowerCase();
  if (s.includes('ড্রয়িং') || s.includes('drawing')) return 'drawing';
  if (s.includes('ডাইনিং') || s.includes('dining')) return 'dining';
  if (s.includes('বেডরুম ১') || s.includes('bed 1') || s.includes('bedroom 1')) return 'bed-1';
  if (s.includes('বেডরুম ২') || s.includes('bed 2') || s.includes('bedroom 2')) return 'bed-2';
  if (s.includes('বেডরুম ৩') || s.includes('bed 3') || s.includes('bedroom 3')) return 'bed-3';
  if (s.includes('বেডরুম') || s.includes('bedroom')) return 'bedroom';
  if (s.includes('কিচেন') || s.includes('kitchen') || s.includes('রান্না')) return 'kitchen';
  if (s.includes('টয়লেট') || s.includes('বাথরুম') || s.includes('bath') || s.includes('toilet')) {
    return 'toilet-bath';
  }
  if (s.includes('বারান্দা') || s.includes('veranda')) return 'veranda';
  return 'custom';
}

/** Sort rank so room sections appear in a natural architectural walkthrough order. */
function getRoomSortRank(name = '') {
  const s = String(name).toLowerCase();
  if (s.includes('ড্রয়িং') || s.includes('drawing')) return 10;
  if (s.includes('ডাইনিং') || s.includes('dining')) return 20;
  if (s.includes('মাস্টার')) return 25;
  if (s.includes('বেডরুম ১') || s.includes('bedroom 1')) return 31;
  if (s.includes('বেডরুম ২') || s.includes('bedroom 2')) return 32;
  if (s.includes('বেডরুম ৩') || s.includes('bedroom 3')) return 33;
  if (s.includes('বেডরুম ৪') || s.includes('bedroom 4')) return 34;
  if (s.includes('বেডরুম ৫') || s.includes('bedroom 5')) return 35;
  if (s.includes('বেডরুম') || s.includes('bedroom')) return 39;
  if (s.includes('কিচেন ও কমন')) return 45;
  if (s.includes('কিচেন') || s.includes('kitchen')) return 50;
  if (s.includes('টয়লেট') || s.includes('বাথরুম')) return 60;
  if (s.includes('বারান্দা')) return 70;
  return 90;
}

/** Extract the floor letter ('A', 'B', 'C', 'D', 'E', 'F'...) from a floor folder name. */
function parseFloorLetter(folderName = '') {
  const parenMatch = folderName.match(/\(Floor\s+([A-Z])\)/i);
  if (parenMatch) return parenMatch[1].toUpperCase();
  const wordMatch = folderName.match(/\bFloor\s+([A-Z])\b/i);
  if (wordMatch) return wordMatch[1].toUpperCase();
  return null;
}

/** Default Drive floor folder name matching the existing folder convention. */
function getDefaultFloorFolderName(unitId) {
  const letter = String(unitId || '').charAt(0).toUpperCase();
  const map = {
    A: 'Ground Floor - নিচতলা (Floor A)',
    B: '1st Floor - দোতলা (Floor B)',
    C: '2nd Floor - ৩য় তলা (Floor C)',
    D: '3rd Floor - ৪র্থ তলা (Floor D)',
    E: '4th Floor - ৫ম তলা (Floor E)',
  };
  return map[letter] || `Floor ${letter}`;
}

/** List all non-trashed children inside a Google Drive folder (handles pagination). */
async function listChildren(drive, parentId, extraQuery = '') {
  const qParts = [`'${escapeDriveQuery(parentId)}' in parents`, 'trashed = false'];
  if (extraQuery) qParts.push(extraQuery);
  const q = qParts.join(' and ');

  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q,
      pageToken,
      pageSize: 100,
      fields: 'nextPageToken, files(id, name, mimeType, size, webViewLink, createdTime, permissions(id, type, role))',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files;
}

/** Ensure a Drive file has `anyone: reader` permission so public thumbnails & video embeds work. */
export async function ensureFilePublic(fileId, driveInstance = null) {
  const drive = driveInstance || getDriveClient();
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });
    return true;
  } catch (err) {
    // Some inherited shared permissions may already grant public read or deny resharing
    if (err?.code === 409) return true;
    return false;
  }
}

async function ensurePublicIfMissing(drive, file) {
  const perms = file.permissions || [];
  const hasAnyone = perms.some((p) => p.type === 'anyone' && p.role === 'reader');
  if (!hasAnyone) {
    await ensureFilePublic(file.id, drive);
  }
}

/** Find a child folder by exact name inside `parentId`, or create it if missing. */
async function findOrCreateFolder(drive, parentId, folderName) {
  const cleanName = String(folderName || '').trim();
  const existing = await listChildren(
    drive,
    parentId,
    `mimeType = '${FOLDER_MIME}' and name = '${escapeDriveQuery(cleanName)}'`
  );
  if (existing.length > 0) {
    return { folder: existing[0], created: false };
  }

  const created = await drive.files.create({
    requestBody: {
      name: cleanName,
      mimeType: FOLDER_MIME,
      parents: [parentId],
    },
    fields: 'id, name, webViewLink',
    supportsAllDrives: true,
  });

  return { folder: created.data, created: true };
}

/** Discover the full mapping of floor folders and unit folders under the root folder. */
async function mapRootHierarchy(drive) {
  const rootId = getRootFolderId();
  const floorFolders = await listChildren(drive, rootId, `mimeType = '${FOLDER_MIME}'`);

  const floorsByLetter = {};
  const unitsById = {};

  await Promise.all(
    floorFolders.map(async (floorFolder) => {
      const unitFolders = await listChildren(
        drive,
        floorFolder.id,
        `mimeType = '${FOLDER_MIME}'`
      );
      let floorLetter = parseFloorLetter(floorFolder.name);
      if (!floorLetter && unitFolders.length > 0) {
        const unitMatch = unitFolders[0].name.trim().match(/^([A-Z])\d+$/i);
        if (unitMatch) floorLetter = unitMatch[1].toUpperCase();
      }
      if (floorLetter) {
        floorsByLetter[floorLetter] = floorFolder;
      }

      for (const uf of unitFolders) {
        const cleanUnitId = uf.name.trim().toUpperCase();
        if (/^[A-Z]\d+$/.test(cleanUnitId)) {
          unitsById[cleanUnitId] = {
            unitId: cleanUnitId,
            unitFolder: uf,
            floorFolder,
            floorLetter: floorLetter || cleanUnitId.charAt(0),
          };
        }
      }
    })
  );

  return { rootId, floorsByLetter, unitsById };
}

/** Resolve (or optionally create) the Drive folder ID for a given unit like 'E1' or 'F1'. */
export async function resolveUnitFolderId(drive, unitId, { createIfMissing = true } = {}) {
  const cleanUnitId = String(unitId || '').trim().toUpperCase();
  const hierarchy = await mapRootHierarchy(drive);
  if (hierarchy.unitsById[cleanUnitId]) {
    return hierarchy.unitsById[cleanUnitId].unitFolder.id;
  }

  if (!createIfMissing) return null;

  const floorLetter = cleanUnitId.charAt(0);
  let floorFolderId = hierarchy.floorsByLetter[floorLetter]?.id;
  if (!floorFolderId) {
    const { folder } = await findOrCreateFolder(
      drive,
      hierarchy.rootId,
      getDefaultFloorFolderName(cleanUnitId)
    );
    floorFolderId = folder.id;
  }

  const { folder: unitFolder } = await findOrCreateFolder(drive, floorFolderId, cleanUnitId);
  return unitFolder.id;
}

/** Scan a single unit's Google Drive folder into `driveVideoId` + `mediaSections`. */
export async function scanUnitFolder(unitFolderId, unitId = '', driveInstance = null) {
  const drive = driveInstance || getDriveClient();
  const children = await listChildren(drive, unitFolderId);

  const subfolders = children.filter((f) => f.mimeType === FOLDER_MIME);
  const rootFiles = children.filter((f) => f.mimeType !== FOLDER_MIME);

  // Pick main walkthrough video (prefer files named `full_video` or first video at unit root)
  const rootVideos = rootFiles.filter((f) => f.mimeType.startsWith('video/'));
  const mainVideo =
    rootVideos.find((v) => /full/i.test(v.name)) || rootVideos[0] || null;

  if (mainVideo) {
    await ensurePublicIfMissing(drive, mainVideo);
  }

  // Scan every room subfolder in parallel
  const rawSections = await Promise.all(
    subfolders.map(async (subfolder) => {
      const folderFiles = await listChildren(drive, subfolder.id);
      const mediaFiles = folderFiles.filter(
        (f) => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')
      );

      await Promise.all(mediaFiles.map((f) => ensurePublicIfMissing(drive, f)));

      mediaFiles.sort((a, b) => a.name.localeCompare(b.name, 'en'));

      return {
        id: `drive-${subfolder.id}`,
        driveFolderId: subfolder.id,
        category: inferRoomCategory(subfolder.name),
        titleBn: subfolder.name,
        items: mediaFiles.map((f) => ({
          id: `drive-${f.id}`,
          driveFileId: f.id,
          driveFolderId: subfolder.id,
          type: f.mimeType.startsWith('video/') ? 'video' : 'image',
          labelBn: stripExtension(f.name),
          fileName: f.name,
          mimeType: f.mimeType,
          previewUrl: '',
        })),
      };
    })
  );

  // Include any loose root images/videos (excluding the chosen main walkthrough video)
  const looseMedia = rootFiles.filter(
    (f) =>
      f.id !== mainVideo?.id &&
      (f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/'))
  );
  if (looseMedia.length > 0) {
    await Promise.all(looseMedia.map((f) => ensurePublicIfMissing(drive, f)));
    rawSections.push({
      id: `drive-loose-${unitFolderId}`,
      driveFolderId: unitFolderId,
      category: 'custom',
      titleBn: 'অন্যান্য ছবি ও ভিডিও',
      items: looseMedia.map((f) => ({
        id: `drive-${f.id}`,
        driveFileId: f.id,
        driveFolderId: unitFolderId,
        type: f.mimeType.startsWith('video/') ? 'video' : 'image',
        labelBn: stripExtension(f.name),
        fileName: f.name,
        mimeType: f.mimeType,
        previewUrl: '',
      })),
    });
  }

  // Sort sections in natural architectural walkthrough order
  rawSections.sort((a, b) => {
    const rankDiff = getRoomSortRank(a.titleBn) - getRoomSortRank(b.titleBn);
    if (rankDiff !== 0) return rankDiff;
    return a.titleBn.localeCompare(b.titleBn, 'bn');
  });

  return {
    unitId: unitId.toUpperCase(),
    driveFolderId: unitFolderId,
    driveFolderUrl: `https://drive.google.com/drive/folders/${unitFolderId}`,
    driveVideoId: mainVideo ? mainVideo.id : '',
    mainVideoFileName: mainVideo ? mainVideo.name : '',
    mediaSections: rawSections,
  };
}

/** Check live Drive connectivity & inspect root folder metadata. */
export async function getDriveConnectionStatus() {
  const rootId = getRootFolderId();
  const drive = getDriveClient();
  const authMode = getDriveAuthMode();

  const rootMeta = await drive.files.get({
    fileId: rootId,
    fields: 'id, name, webViewLink',
    supportsAllDrives: true,
  });

  return {
    connected: true,
    authMode,
    serviceAccountEmail: authMode === 'service-account' ? getServiceAccountEmail() : null,
    rootFolderId: rootMeta.data.id,
    rootFolderName: rootMeta.data.name,
    rootFolderUrl:
      rootMeta.data.webViewLink || `https://drive.google.com/drive/folders/${rootId}`,
  };
}

/** Scan ALL units across all floor folders in Google Drive. */
export async function syncAllUnitsFromDrive() {
  const drive = getDriveClient();
  const { rootId, unitsById } = await mapRootHierarchy(drive);

  const unitEntries = Object.values(unitsById);
  const scannedUnits = await Promise.all(
    unitEntries.map(({ unitId, unitFolder }) =>
      scanUnitFolder(unitFolder.id, unitId, drive)
    )
  );

  const units = {};
  for (const data of scannedUnits) {
    units[data.unitId] = data;
  }

  return {
    rootFolderId: rootId,
    authMode: getDriveAuthMode(),
    syncedAt: new Date().toISOString(),
    units,
  };
}

/** Sync a single unit from Drive (using an explicit folder ID if provided, else auto-discover). */
export async function syncSingleUnitFromDrive(unitId, explicitFolderId = '') {
  const drive = getDriveClient();
  const folderId =
    explicitFolderId || (await resolveUnitFolderId(drive, unitId, { createIfMissing: true }));
  const result = await scanUnitFolder(folderId, unitId, drive);
  return {
    ...result,
    authMode: getDriveAuthMode(),
    syncedAt: new Date().toISOString(),
  };
}

/** Create a room subfolder inside a unit's Drive folder (idempotent by name). */
export async function createRoomSubfolder(unitId, roomName, explicitUnitFolderId = '') {
  const drive = getDriveClient();
  const unitFolderId =
    explicitUnitFolderId || (await resolveUnitFolderId(drive, unitId, { createIfMissing: true }));

  const { folder, created } = await findOrCreateFolder(drive, unitFolderId, roomName);
  return {
    unitFolderId,
    folder: {
      id: folder.id,
      name: folder.name,
      webViewLink:
        folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
      created,
    },
  };
}

/** Rename an existing Drive folder or file. */
export async function renameDriveEntry(fileId, newName) {
  const drive = getDriveClient();
  const res = await drive.files.update({
    fileId,
    requestBody: { name: String(newName).trim() },
    fields: 'id, name',
    supportsAllDrives: true,
  });
  return res.data;
}

/** Resolve target parent folder ID once before uploading one or more files. */
export async function resolveUploadTargetFolder({
  unitId,
  unitFolderId,
  roomFolderId,
  roomName,
  isMainVideo = false,
}) {
  const drive = getDriveClient();
  const resolvedUnitFolderId =
    unitFolderId || (await resolveUnitFolderId(drive, unitId, { createIfMissing: true }));

  if (isMainVideo) {
    return {
      unitFolderId: resolvedUnitFolderId,
      targetFolderId: resolvedUnitFolderId,
    };
  }

  if (roomFolderId) {
    return {
      unitFolderId: resolvedUnitFolderId,
      targetFolderId: roomFolderId,
    };
  }

  if (roomName) {
    const { folder } = await findOrCreateFolder(drive, resolvedUnitFolderId, roomName);
    return {
      unitFolderId: resolvedUnitFolderId,
      targetFolderId: folder.id,
    };
  }

  return {
    unitFolderId: resolvedUnitFolderId,
    targetFolderId: resolvedUnitFolderId,
  };
}

/** Upload a local temp file into a Drive folder, set public reader permission, and return item metadata. */
export async function uploadTempFileToDrive({
  tempPath,
  originalName,
  mimeType,
  unitId,
  unitFolderId,
  roomFolderId,
  roomName,
  isMainVideo = false,
}) {
  const drive = getDriveClient();
  const resolved = await resolveUploadTargetFolder({
    unitId,
    unitFolderId,
    roomFolderId,
    roomName,
    isMainVideo,
  });
  const targetFolderId = resolved.targetFolderId;

  const ext = path.extname(originalName || '') || (mimeType?.startsWith('video/') ? '.mp4' : '.jpg');
  const uploadFileName = isMainVideo ? `full_video${ext}` : originalName;

  const created = await drive.files.create({
    requestBody: {
      name: uploadFileName,
      parents: [targetFolderId],
    },
    media: {
      mimeType: mimeType || 'application/octet-stream',
      body: fs.createReadStream(tempPath),
    },
    fields: 'id, name, mimeType, webViewLink',
    supportsAllDrives: true,
  });

  const file = created.data;
  await ensureFilePublic(file.id, drive);

  return {
    targetFolderId,
    unitFolderId: resolved.unitFolderId,
    item: {
      id: `drive-${file.id}`,
      driveFileId: file.id,
      driveFolderId: targetFolderId,
      type: file.mimeType?.startsWith('video/') ? 'video' : 'image',
      labelBn: stripExtension(file.name),
      fileName: file.name,
      mimeType: file.mimeType,
      previewUrl: '',
    },
  };
}

/** Delete/trash a Drive file or folder, or remove from shared parent folder if owned by another user. */
export async function deleteOrUnlinkDriveItem(fileId, parentFolderId = '') {
  const drive = getDriveClient();
  const meta = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, capabilities(canDelete, canTrash, canRemoveMyDriveParent)',
    supportsAllDrives: true,
  });

  const caps = meta.data.capabilities || {};

  if (caps.canTrash) {
    await drive.files.update({
      fileId,
      requestBody: { trashed: true },
      supportsAllDrives: true,
    });
    return { action: 'trashed', fileId };
  }

  if (caps.canDelete) {
    await drive.files.delete({
      fileId,
      supportsAllDrives: true,
    });
    return { action: 'deleted', fileId };
  }

  if (caps.canRemoveMyDriveParent && parentFolderId) {
    await drive.files.update({
      fileId,
      removeParents: parentFolderId,
      supportsAllDrives: true,
    });
    return { action: 'removed_from_folder', fileId };
  }

  const err = new Error('Insufficient permissions to delete or unlink this file from Google Drive.');
  err.code = 'DRIVE_DELETE_FORBIDDEN';
  throw err;
}

/** Fetch metadata and ensure public permission for a manually pasted Drive File ID. */
export async function inspectAndPublishDriveFile(fileId) {
  const drive = getDriveClient();
  await ensureFilePublic(fileId, drive);
  const res = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, webViewLink',
    supportsAllDrives: true,
  });
  const file = res.data;
  return {
    id: file.id,
    name: file.name,
    labelBn: stripExtension(file.name),
    mimeType: file.mimeType,
    type: file.mimeType?.startsWith('video/') ? 'video' : 'image',
  };
}
