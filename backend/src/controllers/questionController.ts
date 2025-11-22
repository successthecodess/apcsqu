import { Request, Response } from 'express';
import questionService from '../services/questionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { QuestionType, DifficultyLevel } from '@prisma/client';

export const generateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { unitId, topicId, type, difficulty, autoApprove } = req.body;

  const result = await questionService.generateAndStoreQuestion({
    unitId,
    topicId,
    type: type as QuestionType,
    difficulty: difficulty as DifficultyLevel,
    autoApprove: autoApprove || false,
  });

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const generateBulkQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { unitId, count, topicId, type, difficulty, distributeDifficulty, distributeTypes } = req.body;

  const result = await questionService.generateBulkQuestions(unitId, count, {
    topicId,
    type: type as QuestionType,
    difficulty: difficulty as DifficultyLevel,
    distributeDifficulty,
    distributeTypes,
  });

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { unitId, difficulty, type, topicId, approved, limit } = req.query;

  const questions = await questionService.getQuestionsByUnit(unitId as string, {
    difficulty: difficulty as DifficultyLevel,
    type: type as QuestionType,
    topicId: topicId as string,
    approved: approved === 'true',
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.json({
    status: 'success',
    data: { questions, count: questions.length },
  });
});

export const getRandomQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { unitId, difficulty, excludeIds } = req.query;

  const excludeArray = excludeIds ? (excludeIds as string).split(',') : [];

  const question = await questionService.getRandomQuestion(
    unitId as string,
    difficulty as DifficultyLevel,
    excludeArray
  );

  res.json({
    status: 'success',
    data: { question },
  });
});

export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { userId, questionId, userAnswer, timeSpent } = req.body;

  const result = await questionService.submitAnswer(userId, questionId, userAnswer, timeSpent);

  res.json({
    status: 'success',
    data: result,
  });
});

export const approveQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const { approved } = req.body;

  const question = await questionService.approveQuestion(questionId, approved);

  res.json({
    status: 'success',
    data: { question },
  });
});

export const updateQuality = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const { qualityScore } = req.body;

  const question = await questionService.updateQuestionQuality(questionId, qualityScore);

  res.json({
    status: 'success',
    data: { question },
  });
});