import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  resetSettings,
  exportSettings,
  importSettings,
  getSettingByKey,
  updateSettingByKey,
} from '../controllers/settingsController.js';

const router = Router();

// Bulk operations
router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/reset', resetSettings);
router.get('/export', exportSettings);
router.post('/import', importSettings);

// Individual setting operations
router.get('/:key', getSettingByKey);
router.put('/:key', updateSettingByKey);

export default router;