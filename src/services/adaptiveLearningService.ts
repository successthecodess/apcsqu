import prisma from '../config/database.js';
import { DifficultyLevel, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

interface ProgressMetrics {
  currentDifficulty: DifficultyLevel;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalAttempts: number;
  correctAttempts: number;
  masteryLevel: number;
  nextReviewDate?: Date;
  easeFactor?: number;
}

interface PerformancePattern {
  weakTopics: string[];
  strongTopics: string[];
  commonMistakes: Record<string, number>;
  timePatterns: {
    averageTimePerQuestion: number;
    fastestCorrect: number;
    slowestCorrect: number;
  };
}

export class AdaptiveLearningService {
  // Difficulty progression rules - More balanced
  private readonly CORRECT_STREAK_TO_ADVANCE = 3;
  private readonly WRONG_STREAK_TO_DECREASE = 2;
  private readonly MASTERY_THRESHOLD_HIGH = 85;
  private readonly MASTERY_THRESHOLD_MEDIUM = 70;
  private readonly MASTERY_THRESHOLD_LOW = 55;

  // Spaced repetition constants (SM-2 Algorithm)
  private readonly MIN_EASE_FACTOR = 1.3;
  private readonly DEFAULT_EASE_FACTOR = 2.5;
  private readonly MAX_EASE_FACTOR = 3.0;
  private readonly MAX_INTERVAL_DAYS = 365;

  /**
   * Find progress using composite key
   */
  private async findProgress(userId: string, unitId: string, topicId?: string) {
    const topicIdValue = topicId === undefined ? null : topicId;
    
    return await prisma.progress.findFirst({
      where: {
        userId,
        unitId,
        topicId: topicIdValue,
      },
    });
  }

  /**
   * Determine next difficulty based on comprehensive performance metrics
   */
  getNextDifficulty(
    currentDifficulty: DifficultyLevel,
    consecutiveCorrect: number,
    consecutiveWrong: number,
    masteryLevel: number,
    totalAttempts: number,
    recentAccuracy: number
  ): DifficultyLevel {
    const difficulties: DifficultyLevel[] = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
    const currentIndex = difficulties.indexOf(currentDifficulty);

    if (totalAttempts < 3) {
      return currentDifficulty;
    }

    const shouldAdvance = 
      consecutiveCorrect >= this.CORRECT_STREAK_TO_ADVANCE &&
      masteryLevel >= this.MASTERY_THRESHOLD_MEDIUM &&
      recentAccuracy >= 75 &&
      totalAttempts >= 5;

    if (shouldAdvance && currentIndex < difficulties.length - 1) {
      console.log(`🎯 Advancing difficulty: ${currentDifficulty} → ${difficulties[currentIndex + 1]}`);
      return difficulties[currentIndex + 1];
    }

    const shouldDecrease = 
      consecutiveWrong >= this.WRONG_STREAK_TO_DECREASE ||
      (recentAccuracy < 50 && totalAttempts >= 10) ||
      (masteryLevel < this.MASTERY_THRESHOLD_LOW && totalAttempts >= 10) ||
      (currentIndex >= 2 && recentAccuracy < 60 && totalAttempts >= 8);

    if (shouldDecrease && currentIndex > 0) {
      console.log(`📉 Decreasing difficulty: ${currentDifficulty} → ${difficulties[currentIndex - 1]}`);
      return difficulties[currentIndex - 1];
    }

    if (currentIndex === 3 && recentAccuracy < 65 && totalAttempts >= 6) {
      console.log(`📉 Dropping from EXPERT due to recent struggles`);
      return difficulties[2];
    }

    if (currentIndex === 0 && recentAccuracy >= 90 && totalAttempts >= 4) {
      console.log(`🎯 Fast-tracking from EASY due to strong performance`);
      return difficulties[1];
    }

    return currentDifficulty;
  }

  /**
   * Calculate mastery level with exponential moving average
   */
  calculateMasteryLevel(
    currentMastery: number,
    correctAttempts: number,
    totalAttempts: number,
    isCorrect: boolean
  ): number {
    if (totalAttempts === 0) return 0;
    
    const overallAccuracy = (correctAttempts / totalAttempts) * 100;
    const alpha = 0.3;
    const recentImpact = isCorrect ? 100 : 0;
    const newMastery = (alpha * recentImpact) + ((1 - alpha) * currentMastery);
    const blendedMastery = (overallAccuracy * 0.6) + (newMastery * 0.4);
    
    return Math.min(100, Math.max(0, Math.round(blendedMastery)));
  }

  /**
   * Calculate recent accuracy (last 10 attempts)
   */
  private async calculateRecentAccuracy(userId: string, unitId: string): Promise<number> {
    const recentResponses = await prisma.questionResponse.findMany({
      where: {
        userId,
        question: { unitId },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (recentResponses.length === 0) return 0;

    const correctCount = recentResponses.filter(r => r.isCorrect).length;
    return Math.round((correctCount / recentResponses.length) * 100);
  }

  /**
   * Spaced Repetition: Calculate next review date using SM-2 algorithm
   * WITH SAFETY CAPS to prevent date overflow
   */
  calculateNextReview(
    currentInterval: number,
    easeFactor: number,
    quality: number
  ): { nextInterval: number; nextEaseFactor: number; nextReviewDate: Date } {
    let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(this.MIN_EASE_FACTOR, Math.min(newEaseFactor, this.MAX_EASE_FACTOR));

    let nextInterval: number;
    if (quality < 3) {
      nextInterval = 1;
    } else {
      if (currentInterval === 0) {
        nextInterval = 1;
      } else if (currentInterval === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(currentInterval * newEaseFactor);
      }
    }

    // CRITICAL: Cap interval to prevent overflow
    nextInterval = Math.min(nextInterval, this.MAX_INTERVAL_DAYS);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

    return {
      nextInterval,
      nextEaseFactor: newEaseFactor,
      nextReviewDate,
    };
  }

  /**
   * Convert answer correctness and time to SM-2 quality (0-5)
   */
  private calculateQuality(isCorrect: boolean, timeSpent?: number, averageTime?: number): number {
    if (!isCorrect) return 0;

    let quality = 4;

    if (timeSpent && averageTime) {
      const timeRatio = timeSpent / averageTime;
      if (timeRatio < 0.5) {
        quality = 5;
      } else if (timeRatio < 0.8) {
        quality = 4;
      } else if (timeRatio > 1.5) {
        quality = 3;
      }
    }

    return quality;
  }

  /**
   * Track performance patterns and identify weak areas
   */
  async analyzePerformancePatterns(userId: string, unitId: string): Promise<PerformancePattern> {
    const responses = await prisma.questionResponse.findMany({
      where: {
        userId,
        question: { unitId },
      },
      include: {
        question: {
          include: { topic: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const topicPerformance: Record<string, { correct: number; total: number }> = {};
    const mistakeTypes: Record<string, number> = {};
    const times: number[] = [];

    for (const response of responses) {
      const topicName = response.question.topic?.name || 'General';
      
      if (!topicPerformance[topicName]) {
        topicPerformance[topicName] = { correct: 0, total: 0 };
      }
      
      topicPerformance[topicName].total++;
      if (response.isCorrect) {
        topicPerformance[topicName].correct++;
      } else {
        const difficulty = response.question.difficulty;
        mistakeTypes[difficulty] = (mistakeTypes[difficulty] || 0) + 1;
      }

      if (response.timeSpent) {
        times.push(response.timeSpent);
      }
    }

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    for (const [topic, perf] of Object.entries(topicPerformance)) {
      const accuracy = (perf.correct / perf.total) * 100;
      if (accuracy < 60 && perf.total >= 3) {
        weakTopics.push(topic);
      } else if (accuracy >= 85 && perf.total >= 3) {
        strongTopics.push(topic);
      }
    }

    const avgTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0;
    const fastestCorrect = times.length > 0 ? Math.min(...times) : 0;
    const slowestCorrect = times.length > 0 ? Math.max(...times) : 0;

    return {
      weakTopics,
      strongTopics,
      commonMistakes: mistakeTypes,
      timePatterns: {
        averageTimePerQuestion: Math.round(avgTime),
        fastestCorrect: Math.round(fastestCorrect),
        slowestCorrect: Math.round(slowestCorrect),
      },
    };
  }

  /**
   * Update user progress after answering a question
   */
  async updateProgress(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    timeSpent?: number
  ) {
    console.log('📊 Updating progress:', { userId, questionId, isCorrect });

    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          unit: true,
          topic: true,
        },
      });

      if (!question) {
        console.error('❌ Question not found:', questionId);
        throw new AppError('Question not found', 404);
      }

      const unitId = question.unitId;
      const topicId = question.topicId || undefined; // Convert null to undefined

      console.log('📚 Question unit:', question.unit?.name, 'Topic:', question.topic?.name || 'None');

      let progress = await this.findProgress(userId, unitId, topicId);

      if (!progress) {
        console.log('Creating new progress record...');
        progress = await prisma.progress.create({
          data: {
            userId,
            unitId,
            topicId: topicId || null, // Convert undefined back to null for database
            currentDifficulty: 'EASY',
            totalAttempts: 0,
            correctAttempts: 0,
            consecutiveCorrect: 0,
            consecutiveWrong: 0,
            masteryLevel: 0,
            easeFactor: this.DEFAULT_EASE_FACTOR,
            interval: 0,
            totalTimeSpent: 0,
            averageTimePerQuestion: 0,
          },
        });
      }

      const newConsecutiveCorrect = isCorrect ? progress.consecutiveCorrect + 1 : 0;
      const newConsecutiveWrong = !isCorrect ? progress.consecutiveWrong + 1 : 0;
      const newTotalAttempts = progress.totalAttempts + 1;
      const newCorrectAttempts = progress.correctAttempts + (isCorrect ? 1 : 0);

      const newMasteryLevel = this.calculateMasteryLevel(
        progress.masteryLevel,
        newCorrectAttempts,
        newTotalAttempts,
        isCorrect
      );

      const recentAccuracy = await this.calculateRecentAccuracy(userId, unitId);

      console.log('📊 Performance Metrics:', {
        consecutiveCorrect: newConsecutiveCorrect,
        consecutiveWrong: newConsecutiveWrong,
        masteryLevel: newMasteryLevel,
        recentAccuracy,
        totalAttempts: newTotalAttempts,
      });

      const newDifficulty = this.getNextDifficulty(
        progress.currentDifficulty,
        newConsecutiveCorrect,
        newConsecutiveWrong,
        newMasteryLevel,
        newTotalAttempts,
        recentAccuracy
      );

      const quality = this.calculateQuality(isCorrect, timeSpent, progress.averageTimePerQuestion || undefined);
      const { nextInterval, nextEaseFactor, nextReviewDate } = this.calculateNextReview(
        progress.interval,
        progress.easeFactor,
        quality
      );

      const newTotalTimeSpent = progress.totalTimeSpent + (timeSpent || 0);
      const newAverageTime = newTotalAttempts > 0 
        ? newTotalTimeSpent / newTotalAttempts 
        : 0;

      const patterns = await this.analyzePerformancePatterns(userId, unitId);

      const updatedProgress = await prisma.progress.update({
        where: { id: progress.id },
        data: {
          currentDifficulty: newDifficulty,
          consecutiveCorrect: newConsecutiveCorrect,
          consecutiveWrong: newConsecutiveWrong,
          totalAttempts: newTotalAttempts,
          correctAttempts: newCorrectAttempts,
          masteryLevel: newMasteryLevel,
          lastPracticed: new Date(),
          totalTimeSpent: newTotalTimeSpent,
          averageTimePerQuestion: newAverageTime,
          easeFactor: nextEaseFactor,
          interval: nextInterval,
          nextReviewDate: nextReviewDate,
          strugglingTopics: patterns.weakTopics.length > 0 ? patterns.weakTopics : null,
          commonMistakes: Object.keys(patterns.commonMistakes).length > 0 ? patterns.commonMistakes : null,
        },
      });

      console.log('✅ Progress updated:', {
        mastery: updatedProgress.masteryLevel,
        difficulty: updatedProgress.currentDifficulty,
        streak: isCorrect ? updatedProgress.consecutiveCorrect : updatedProgress.consecutiveWrong,
      });

      return {
        currentDifficulty: updatedProgress.currentDifficulty,
        consecutiveCorrect: updatedProgress.consecutiveCorrect,
        consecutiveWrong: updatedProgress.consecutiveWrong,
        totalAttempts: updatedProgress.totalAttempts,
        correctAttempts: updatedProgress.correctAttempts,
        masteryLevel: updatedProgress.masteryLevel,
        nextReviewDate: updatedProgress.nextReviewDate || undefined,
        easeFactor: updatedProgress.easeFactor,
      };
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      throw error;
    }
  }

  async getProgress(userId: string, unitId: string, topicId?: string): Promise<ProgressMetrics | null> {
    const progress = await this.findProgress(userId, unitId, topicId);

    if (!progress) return null;

    return {
      currentDifficulty: progress.currentDifficulty,
      consecutiveCorrect: progress.consecutiveCorrect,
      consecutiveWrong: progress.consecutiveWrong,
      totalAttempts: progress.totalAttempts,
      correctAttempts: progress.correctAttempts,
      masteryLevel: progress.masteryLevel,
      nextReviewDate: progress.nextReviewDate || undefined,
      easeFactor: progress.easeFactor,
    };
  }

  async getRecommendedDifficulty(userId: string, unitId: string, topicId?: string): Promise<DifficultyLevel> {
    const progress = await this.getProgress(userId, unitId, topicId);
    
    if (!progress) {
      return 'EASY';
    }

    if (progress.nextReviewDate && new Date() >= progress.nextReviewDate) {
      console.log('📅 Spaced repetition: Review needed for this topic');
      const difficulties: DifficultyLevel[] = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
      const currentIndex = difficulties.indexOf(progress.currentDifficulty);
      return currentIndex > 0 ? difficulties[currentIndex - 1] : progress.currentDifficulty;
    }

    return progress.currentDifficulty;
  }

  async getLearningInsights(userId: string, unitId: string) {
    const progress = await this.findProgress(userId, unitId);
    const patterns = await this.analyzePerformancePatterns(userId, unitId);

    if (!progress) {
      return {
        status: 'new',
        message: 'Start practicing to see your insights!',
      };
    }

    const accuracy = progress.totalAttempts > 0 
      ? Math.round((progress.correctAttempts / progress.totalAttempts) * 100)
      : 0;

    const insights = {
      masteryLevel: progress.masteryLevel,
      currentDifficulty: progress.currentDifficulty,
      accuracy,
      totalAttempts: progress.totalAttempts,
      averageTimePerQuestion: Math.round(progress.averageTimePerQuestion || 0),
      nextReviewDate: progress.nextReviewDate,
      weakTopics: patterns.weakTopics,
      strongTopics: patterns.strongTopics,
      recommendations: this.generateRecommendations(progress, patterns),
    };

    return insights;
  }

  private generateRecommendations(progress: any, patterns: PerformancePattern): string[] {
    const recommendations: string[] = [];

    if (progress.masteryLevel < 50) {
      recommendations.push('Focus on fundamentals - review basic concepts');
    } else if (progress.masteryLevel < 75) {
      recommendations.push('Good progress! Practice more to solidify understanding');
    } else if (progress.masteryLevel >= 85) {
      recommendations.push('Excellent mastery! Try more challenging problems');
    }

    if (patterns.weakTopics.length > 0) {
      recommendations.push(`Review these topics: ${patterns.weakTopics.join(', ')}`);
    }

    if (patterns.timePatterns.averageTimePerQuestion > 180) {
      recommendations.push('Try to improve response time with timed practice');
    }

    if (progress.consecutiveWrong >= 2) {
      recommendations.push('Take a short break and review explanations carefully');
    }

    return recommendations;
  }

  async getUnitsNeedingReview(userId: string): Promise<string[]> {
    const now = new Date();
    const progressRecords = await prisma.progress.findMany({
      where: {
        userId,
        nextReviewDate: {
          lte: now,
        },
      },
      include: {
        unit: true,
      },
    });

    return progressRecords.map(p => p.unit.name);
  }
}

export default new AdaptiveLearningService();