import { Router } from 'express';
import { getUnits, getUnitById, getTopicsByUnit } from '../controllers/unitController.js';

const router = Router();

router.get('/', getUnits);
router.get('/:unitId/topics', getTopicsByUnit); // This must come BEFORE /:unitId
router.get('/:unitId', getUnitById);

export default router;