import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const getUnits = asyncHandler(async (req: Request, res: Response) => {
  const units = await prisma.unit.findMany({
    where: { isActive: true },
    include: {
      topics: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { unitNumber: 'asc' },
  });

  // Get question counts for each unit
  const unitsWithCounts = await Promise.all(
    units.map(async (unit) => {
      const questionCount = await prisma.question.count({
        where: {
          unitId: unit.id,
          approved: true,
        },
      });

      return {
        ...unit,
        questionCount,
      };
    })
  );

  res.status(200).json({
    status: 'success',
    data: { units: unitsWithCounts },
  });
});

export const getUnitById = asyncHandler(async (req: Request, res: Response) => {
  const { unitId } = req.params;

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      topics: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!unit) {
    throw new AppError('Unit not found', 404);
  }

  // Get question count
  const questionCount = await prisma.question.count({
    where: {
      unitId: unit.id,
      approved: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: { 
      unit: {
        ...unit,
        questionCount,
      },
    },
  });
});

export const getTopicsByUnit = asyncHandler(async (req: Request, res: Response) => {
  const { unitId } = req.params;

  console.log('Fetching topics for unit:', unitId);

  const topics = await prisma.topic.findMany({
    where: {
      unitId,
      isActive: true,
    },
    orderBy: { orderIndex: 'asc' },
  });

  console.log('Found topics:', topics.length);

  res.status(200).json({
    status: 'success',
    data: { topics },
  });
});