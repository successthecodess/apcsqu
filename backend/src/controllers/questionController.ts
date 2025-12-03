import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const getQuestionById = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      unit: true,
      topic: true,
    },
  });

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { question },
  });
});