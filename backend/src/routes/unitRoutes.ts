import express from 'express';
import * as unitController from '../controllers/unitController.js';

const router = express.Router();

router.get('/', unitController.getAllUnits);
router.get('/:id', unitController.getUnitById);
router.get('/progress/:userId', unitController.getUserProgress);

export default router;