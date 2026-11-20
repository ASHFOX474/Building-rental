import { Router } from 'express';
import { uploadMiddleware } from '../middleware/upload.js';
import {
  status,
  syncAll,
  syncUnit,
  createRoomFolder,
  renameFolder,
  uploadFiles,
  deleteItem,
  ensurePublic,
  streamFile,
  streamImage,
} from '../controllers/driveController.js';

const router = Router();

router.get('/status', status);
router.get('/sync-all', syncAll);
router.post('/sync/:unitId', syncUnit);
router.post('/units/:unitId/folders', createRoomFolder);
router.patch('/folders/:folderId', renameFolder);
router.post('/upload', uploadMiddleware.array('files', 20), uploadFiles);
router.delete('/files/:fileId', deleteItem);
router.delete('/file/:fileId', deleteItem);
router.post('/ensure-public', ensurePublic);
router.get('/stream/:fileId', streamFile);
router.get('/image/:fileId', streamImage);

export default router;
