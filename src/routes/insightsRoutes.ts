import express from 'express';
import * as insightsController from '../controllers/insightsController.js';

const router = express.Router();

router.get('/:userId/unit/:unitId', insightsController.getLearningInsights);
router.get('/:userId/patterns/:unitId', insightsController.getPerformancePatterns);
router.get('/:userId/review-needed', insightsController.getReviewNeeded);

export default router;