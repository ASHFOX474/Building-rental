import { Router } from 'express';
import {
  getState,
  patchUnit,
  putPayment,
  deletePayment,
  postFloor,
  patchFloor,
  deleteFloor,
  patchSettings,
  postRestore,
} from '../controllers/dbController.js';

const router = Router();

router.get('/state', getState);
router.patch('/units/:unitCode', patchUnit);
router.put('/payments', putPayment);
router.delete('/payments/:unitCode/:monthKey', deletePayment);
router.post('/floors', postFloor);
router.patch('/floors/:floorId', patchFloor);
router.delete('/floors/:floorId', deleteFloor);
router.patch('/settings', patchSettings);
router.post('/restore', postRestore);

export default router;
