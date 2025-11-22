import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getAllUnits = asyncHandler(async (req: Request, res: Response) => {
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

  res.json({
    status: 'success',
    data: { units },
  });
});

export const getUnitById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      topics: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!unit) {
    return res.status(404).json({
      status: 'error',
      message: 'Unit not found',
    });
  }

  res.json({
    status: 'success',
    data: { unit },
  });
});

export const getUserProgress = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const progress = await prisma.progress.findMany({
    where: { userId },
    include: {
      unit: true,
      topic: true,
    },
  });

  res.json({
    status: 'success',
    data: { progress },
  });
});