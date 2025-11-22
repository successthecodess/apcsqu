import { Request, Response } from 'express';
import practiceSessionService from '../services/practiceSessionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const startPracticeSession = asyncHandler(async (req: Request, res: Response) => {
  console.log('📝 Practice session start request:', req.body);
  
  const { userId, unitId, topicId, userEmail, userName } = req.body;

  // Validate inputs
  if (!userId) {
    return res.status(400).json({
      status: 'error',
      message: 'userId is required',
    });
  }

  if (!unitId) {
    return res.status(400).json({
      status: 'error',
      message: 'unitId is required',
    });
  }

  try {
    const result = await practiceSessionService.startSession(
      userId, 
      unitId, 
      topicId,
      userEmail,
      userName
    );

    console.log('✅ Session started successfully');

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('❌ Failed to start session:', error);
    throw error;
  }
});

export const getNextQuestion = asyncHandler(async (req: Request, res: Response) => {
  console.log('📝 Get next question request:', req.body);
  
  const { userId, sessionId, unitId, answeredQuestionIds, topicId } = req.body;

  const question = await practiceSessionService.getNextQuestion(
    userId,
    sessionId,
    unitId,
    answeredQuestionIds || [],
    topicId
  );

  res.json({
    status: 'success',
    data: { question },
  });
});

export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  console.log('📝 Submit answer request:', req.body);
  
  const { userId, sessionId, questionId, userAnswer, timeSpent } = req.body;

  const result = await practiceSessionService.submitAnswer(
    userId,
    sessionId,
    questionId,
    userAnswer,
    timeSpent
  );

  res.json({
    status: 'success',
    data: result,
  });
});

export const endPracticeSession = asyncHandler(async (req: Request, res: Response) => {
  console.log('📝 End session request:', req.params);
  
  const { sessionId } = req.params;

  const result = await practiceSessionService.endSession(sessionId);

  res.json({
    status: 'success',
    data: result,
  });
});