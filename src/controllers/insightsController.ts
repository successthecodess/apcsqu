import { Request, Response } from 'express';
import adaptiveLearningService from '../services/adaptiveLearningService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getLearningInsights = asyncHandler(async (req: Request, res: Response) => {
  const { userId, unitId } = req.params;

  const insights = await adaptiveLearningService.getLearningInsights(userId, unitId);

  res.json({
    status: 'success',
    data: insights,
  });
});

export const getPerformancePatterns = asyncHandler(async (req: Request, res: Response) => {
  const { userId, unitId } = req.params;

  const patterns = await adaptiveLearningService.analyzePerformancePatterns(userId, unitId);

  res.json({
    status: 'success',
    data: patterns,
  });
});

export const getReviewNeeded = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const unitsNeedingReview = await adaptiveLearningService.getUnitsNeedingReview(userId);

  res.json({
    status: 'success',
    data: { unitsNeedingReview },
  });
});