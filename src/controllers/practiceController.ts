import { Request, Response } from 'express';
import practiceSessionService from '../services/practiceSessionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const startPracticeSession = asyncHandler(async (req: Request, res: Response) => {
  const { userId, unitId, topicId, userEmail, userName, targetQuestions } = req.body;

  const result = await practiceSessionService.startSession(
    userId,
    unitId,
    topicId,
    userEmail,
    userName,
    targetQuestions
  );

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getNextQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { userId, sessionId, unitId, answeredQuestionIds } = req.body;

  const question = await practiceSessionService.getNextQuestion(
    userId,
    sessionId,
    unitId,
    answeredQuestionIds
  );

  res.status(200).json({
    status: 'success',
    data: { question },
  });
});

export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { userId, sessionId, questionId, userAnswer, timeSpent } = req.body;

  console.log('🔍 Received answer submission:', {
    userId,
    sessionId,
    questionId,
    userAnswer: userAnswer?.substring(0, 50), // Log first 50 chars
    timeSpent
  });

  try {
    const result = await practiceSessionService.submitAnswer(
      userId,
      sessionId,
      questionId,
      userAnswer,
      timeSpent
    );

    console.log('✅ Answer processed successfully');

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Error in submitAnswer controller:', error);
    throw error; // Let error handler middleware handle it
  }
});

export const endPracticeSession = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  console.log('🏁 Ending session via API:', sessionId);

  const result = await practiceSessionService.endSession(sessionId);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});