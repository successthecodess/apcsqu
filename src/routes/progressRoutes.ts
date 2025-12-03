import express from 'express';
import { Request, Response } from 'express';
import adaptiveLearningService from '../services/adaptiveLearningService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Get user progress for a specific unit
 * GET /api/progress/:userId/:unitId
 */
router.get(
  '/:userId/:unitId',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, unitId } = req.params;
    const { topicId } = req.query;

    const progress = await adaptiveLearningService.getProgress(
      userId,
      unitId,
      topicId as string | undefined
    );

    res.status(200).json({
      status: 'success',
      data: { progress },
    });
  })
);

/**
 * Get learning insights for a user and unit
 * GET /api/progress/insights/:userId/:unitId
 */
router.get(
  '/insights/:userId/:unitId',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, unitId } = req.params;

    const insights = await adaptiveLearningService.getLearningInsights(userId, unitId);

    res.status(200).json({
      status: 'success',
      data: insights,
    });
  })
);

/**
 * Get units that need review (spaced repetition)
 * GET /api/progress/review/:userId
 */
router.get(
  '/review/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const unitsNeedingReview = await adaptiveLearningService.getUnitsNeedingReview(userId);

    res.status(200).json({
      status: 'success',
      data: { units: unitsNeedingReview },
    });
  })
);

export default router;