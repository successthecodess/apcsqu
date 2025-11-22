import prisma from '../config/database.js';
import openaiService from './openaiService.js';
import { QuestionType, DifficultyLevel } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

interface GenerateQuestionOptions {
  unitId: string;
  topicId?: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  autoApprove?: boolean;
}

export class QuestionService {
  async generateAndStoreQuestion(options: GenerateQuestionOptions) {
    const { unitId, topicId, type, difficulty, autoApprove = false } = options;

    // Get unit and topic info
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { topics: true },
    });

    if (!unit) {
      throw new AppError('Unit not found', 404);
    }

    let topic;
    let topicName;
    if (topicId) {
      topic = await prisma.topic.findUnique({ where: { id: topicId } });
      if (topic) {
        topicName = topic.name;
      }
    }

    // Generate question using OpenAI
    console.log(`Generating ${type} question for Unit ${unit.unitNumber} at ${difficulty} level`);
    
    const generated = await openaiService.generateQuestion(
      unit.unitNumber,
      type,
      difficulty,
      topicName
    );

    // Validate question quality
    const validation = await openaiService.validateQuestionQuality(generated);
    
    console.log('Question validation:', validation);

    // Store in database
    const question = await prisma.question.create({
      data: {
        unitId,
        topicId,
        type,
        difficulty,
        questionText: generated.questionText,
        codeSnippet: generated.codeSnippet,
        options: generated.options,
        correctAnswer: generated.correctAnswer,
        explanation: generated.explanation,
        aiGenerated: true,
        approved: autoApprove || validation.score >= 80,
        qualityScore: validation.score / 20, // Convert to 1-5 scale
      },
      include: {
        unit: true,
        topic: true,
      },
    });

    return {
      question,
      validation,
    };
  }

  async generateBulkQuestions(
    unitId: string,
    count: number,
    options?: {
      topicId?: string;
      type?: QuestionType;
      difficulty?: DifficultyLevel;
      distributeDifficulty?: boolean;
      distributeTypes?: boolean;
    }
  ) {
    const results = [];
    const errors = [];

    // Get unit info
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      throw new AppError('Unit not found', 404);
    }

    // Determine distribution
    const difficulties: DifficultyLevel[] = options?.distributeDifficulty
      ? ['EASY', 'MEDIUM', 'HARD', 'EXPERT']
      : [options?.difficulty || 'MEDIUM'];

    const types: QuestionType[] = options?.distributeTypes
      ? ['MULTIPLE_CHOICE', 'FREE_RESPONSE', 'CODE_ANALYSIS']
      : [options?.type || 'MULTIPLE_CHOICE'];

    for (let i = 0; i < count; i++) {
      try {
        const difficulty = difficulties[i % difficulties.length];
        const type = types[i % types.length];

        const result = await this.generateAndStoreQuestion({
          unitId,
          topicId: options?.topicId,
          type,
          difficulty,
          autoApprove: false,
        });

        results.push(result);

        // Small delay between generations
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate question ${i + 1}:`, error);
        errors.push({
          index: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  async getQuestionsByUnit(
    unitId: string,
    filters?: {
      difficulty?: DifficultyLevel;
      type?: QuestionType;
      topicId?: string;
      approved?: boolean;
      limit?: number;
    }
  ) {
    const where: any = {
      unitId,
    };

    if (filters?.difficulty) where.difficulty = filters.difficulty;
    if (filters?.type) where.type = filters.type;
    if (filters?.topicId) where.topicId = filters.topicId;
    if (filters?.approved !== undefined) where.approved = filters.approved;

    const questions = await prisma.question.findMany({
      where,
      include: {
        unit: true,
        topic: true,
      },
      take: filters?.limit || 50,
      orderBy: { createdAt: 'desc' },
    });

    return questions;
  }

  async getRandomQuestion(
    unitId: string,
    difficulty: DifficultyLevel,
    excludeIds: string[] = []
  ) {
    // Get count of available questions
    const count = await prisma.question.count({
      where: {
        unitId,
        difficulty,
        approved: true,
        id: { notIn: excludeIds },
      },
    });

    if (count === 0) {
      // No questions available, generate one
      const result = await this.generateAndStoreQuestion({
        unitId,
        difficulty,
        type: 'MULTIPLE_CHOICE',
        autoApprove: true,
      });
      return result.question;
    }

    // Get random question
    const skip = Math.floor(Math.random() * count);
    const question = await prisma.question.findFirst({
      where: {
        unitId,
        difficulty,
        approved: true,
        id: { notIn: excludeIds },
      },
      skip,
      include: {
        unit: true,
        topic: true,
      },
    });

    return question;
  }

  async submitAnswer(
    userId: string,
    questionId: string,
    userAnswer: string,
    timeSpent?: number
  ) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    const isCorrect = this.checkAnswer(userAnswer, question.correctAnswer, question.type);

    // Update question statistics
    await prisma.question.update({
      where: { id: questionId },
      data: {
        timesAttempted: { increment: 1 },
        timesCorrect: isCorrect ? { increment: 1 } : undefined,
        averageTime: timeSpent
          ? question.averageTime
            ? (question.averageTime + timeSpent) / 2
            : timeSpent
          : question.averageTime,
      },
    });

    // Store response
    const response = await prisma.questionResponse.create({
      data: {
        userId,
        questionId,
        userAnswer,
        isCorrect,
        timeSpent,
        difficultyAtTime: question.difficulty,
      },
    });

    return {
      ...response,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    };
  }

  private checkAnswer(userAnswer: string, correctAnswer: string, type: QuestionType): boolean {
    if (type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE' || type === 'CODE_ANALYSIS') {
      // Extract just the letter (A, B, C, D)
      const userLetter = userAnswer.trim().toUpperCase().charAt(0);
      const correctLetter = correctAnswer.trim().toUpperCase().charAt(0);
      return userLetter === correctLetter;
    }

    // For free response and code completion, use more sophisticated checking
    // This is a simplified version - you may want to implement more advanced comparison
    const normalizedUser = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedCorrect = correctAnswer.trim().toLowerCase().replace(/\s+/g, ' ');

    return normalizedUser === normalizedCorrect;
  }

  async approveQuestion(questionId: string, approved: boolean) {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { approved },
    });

    return question;
  }

  async updateQuestionQuality(questionId: string, qualityScore: number) {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { qualityScore: qualityScore / 20 }, // Convert 0-100 to 1-5
    });

    return question;
  }
}

export default new QuestionService();