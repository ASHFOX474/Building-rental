import {
  getDriveConnectionStatus,
  syncAllUnitsFromDrive,
  syncSingleUnitFromDrive,
  createRoomSubfolder,
  renameDriveEntry,
  resolveUploadTargetFolder,
  uploadTempFileToDrive,
  deleteOrUnlinkDriveItem,
  inspectAndPublishDriveFile,
  openDriveVideoStream,
} from '../services/driveService.js';
import {
  persistDriveSyncAll,
  persistDriveSyncForUnit,
  persistDriveUpload,
  persistDriveFileDeleted,
} from '../services/dbService.js';
import { cleanupTempFiles } from '../middleware/upload.js';

/** Extract any Drive quota / permission reason from googleapis errors. */
function getGoogleErrorReason(err) {
  return err?.errors?.[0]?.reason || err?.response?.data?.error?.errors?.[0]?.reason || '';
}

function sendDriveError(res, err, extra = {}) {
  const reason = getGoogleErrorReason(err);
  const status = err?.code && Number.isInteger(err.code) ? err.code : 500;

  if (reason === 'storageQuotaExceeded') {
    return res.status(403).json({
      ok: false,
      code: 'DRIVE_STORAGE_QUOTA_EXCEEDED',
      ...extra,
      message: err.message,
      messageBn:
        'গুগলের নিয়ম অনুযায়ী সার্ভিস অ্যাকাউন্টের নিজস্ব ড্রাইভ স্টোরেজ (0 GB) না থাকায় ব্যক্তিগত জিমেইল ফোল্ডারে সরাসরি ফাইল আপলোড ব্লক করা হয়েছে। নিচের বাটনে চাপ দিয়ে সরাসরি গুগল ড্রাইভ ফোল্ডারে ছবি/ভিডিও রাখুন এবং "সিঙ্ক করুন" চাপুন (অথবা .env-এ OAuth2 সেট করুন)।',
    });
  }

  return res.status(status >= 400 && status < 600 ? status : 500).json({
    ok: false,
    code: err?.code || reason || 'DRIVE_API_ERROR',
    ...extra,
    message: err?.message || 'Google Drive API error',
    messageBn: err?.messageBn || `গুগল ড্রাইভ এরর: ${err?.message || 'অপারেশন ব্যর্থ হয়েছে'}`,
  });
}

export async function status(_req, res) {
  try {
    const data = await getDriveConnectionStatus();
    res.json({ ok: true, ...data });
  } catch (err) {
    sendDriveError(res, err);
  }
}

export async function syncAll(req, res) {
  try {
    const data = await syncAllUnitsFromDrive();
    const overwriteEmpty = req.query.overwriteEmpty === 'true';
    await persistDriveSyncAll(data.units, { overwriteEmpty });
    res.json({ ok: true, ...data });
  } catch (err) {
    sendDriveError(res, err);
  }
}

export async function syncUnit(req, res) {
  try {
    const { unitId } = req.params;
    const { unitFolderId } = req.body || {};
    const data = await syncSingleUnitFromDrive(unitId, unitFolderId);
    await persistDriveSyncForUnit(unitId, data, { overwriteEmpty: true });
    res.json({ ok: true, ...data });
  } catch (err) {
    sendDriveError(res, err);
  }
}

export async function createRoomFolder(req, res) {
  try {
    const { unitId } = req.params;
    const { name, unitFolderId } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ ok: false, messageBn: 'ফোল্ডারের নাম দেওয়া প্রয়োজন।' });
    }
    const data = await createRoomSubfolder(unitId, name, unitFolderId);
    res.json({ ok: true, ...data });
  } catch (err) {
    sendDriveError(res, err);
  }
}

export async function renameFolder(req, res) {
  try {
    const { folderId } = req.params;
    const { name } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ ok: false, messageBn: 'নতুন নাম দেওয়া প্রয়োজন।' });
    }
    const folder = await renameDriveEntry(folderId, name);
    res.json({ ok: true, folder });
  } catch (err) {
    sendDriveError(res, err);
  }
}

export async function uploadFiles(req, res) {
  const uploadedFiles = req.files?.length ? req.files : req.file ? [req.file] : [];
  let targetInfo = null;

  try {
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ ok: false, messageBn: 'কোনো ফাইল পাওয়া যায়নি।' });
    }

    const {
      unitId = '',
      unitFolderId = '',
      roomFolderId = '',
      roomName = '',
      isMainVideo = 'false',
    } = req.body || {};

    const isMain = String(isMainVideo) === 'true';
    targetInfo = await resolveUploadTargetFolder({
      unitId,
      unitFolderId,
      roomFolderId,
      roomName,
      isMainVideo: isMain,
    });

    const results = [];
    for (const file of uploadedFiles) {
      // Fix UTF-8 filenames if multer decoded latin1
      const originalName = Buffer.from(file.originalname || 'file', 'latin1').toString('utf8');
      const uploaded = await uploadTempFileToDrive({
        tempPath: file.path,
        originalName,
        mimeType: file.mimetype,
        unitId,
        unitFolderId: targetInfo.unitFolderId,
        roomFolderId: targetInfo.targetFolderId,
        roomName,
        isMainVideo: isMain,
      });
      results.push(uploaded.item);
    }

    await persistDriveUpload({
      unitId,
      unitFolderId: targetInfo.unitFolderId,
      targetFolderId: targetInfo.targetFolderId,
      roomName,
      isMainVideo: isMain,
      items: results,
    });

    res.json({
      ok: true,
      unitFolderId: targetInfo.unitFolderId,
      targetFolderId: targetInfo.targetFolderId,
      targetFolderUrl: `https://drive.google.com/drive/folders/${targetInfo.targetFolderId}`,
      items: results,
    });
  } catch (err) {
    const targetFolderId = targetInfo?.targetFolderId || req.body?.roomFolderId || req.body?.unitFolderId || '';
    sendDriveError(res, err, {
      unitFolderId: targetInfo?.unitFolderId || req.body?.unitFolderId || '',
      targetFolderId,
      targetFolderUrl: targetFolderId
        ? `https://drive.google.com/drive/folders/${targetFolderId}`
        : '',
    });
  } finally {
    cleanupTempFiles(uploadedFiles);
  }
}

export async function deleteItem(req, res) {
  try {
    const { fileId } = req.params;
    const parentId = req.query.parentId || req.body?.parentId || '';
    const result = await deleteOrUnlinkDriveItem(fileId, parentId);
    await persistDriveFileDeleted(fileId);
    res.json({ ok: true, ...result });
  } catch (err) {
    sendDriveError(res, err);
  }
}

export async function ensurePublic(req, res) {
  try {
    const { fileId } = req.body || {};
    if (!fileId) {
      return res.status(400).json({ ok: false, messageBn: 'Google Drive File ID প্রয়োজন।' });
    }
    const file = await inspectAndPublishDriveFile(fileId);
    res.json({ ok: true, file });
  } catch (err) {
    sendDriveError(res, err);
  }
}

export async function streamFile(req, res) {
  let upstreamStream = null;
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({ ok: false, messageBn: 'File ID প্রয়োজন।' });
    }

    const result = await openDriveVideoStream(fileId, req.headers.range);

    if (result.invalidRange) {
      res.setHeader('Content-Range', `bytes */${result.totalSize}`);
      return res.status(416).end();
    }

    upstreamStream = result.stream;

    res.status(result.statusCode);
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    if (result.contentLength !== null && result.contentLength !== undefined) {
      res.setHeader('Content-Length', String(result.contentLength));
    }
    if (result.statusCode === 206) {
      res.setHeader(
        'Content-Range',
        `bytes ${result.start}-${result.end}/${result.totalSize}`
      );
    }

    const cleanup = () => {
      if (upstreamStream && !upstreamStream.destroyed) {
        upstreamStream.destroy();
      }
    };

    req.on('close', cleanup);
    upstreamStream.on('error', (streamErr) => {
      cleanup();
      if (!res.headersSent) {
        sendDriveError(res, streamErr);
      } else if (!res.writableEnded) {
        res.end();
      }
    });

    upstreamStream.pipe(res);
  } catch (err) {
    if (upstreamStream && !upstreamStream.destroyed) {
      upstreamStream.destroy();
    }
    if (!res.headersSent) {
      sendDriveError(res, err);
    }
  }
}
