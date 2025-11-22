import prisma from '../config/database.js';
import { DifficultyLevel, Prisma } from '@prisma/client';

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
  private readonly EASE_FACTOR_ADJUSTMENT = 0.15;

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
   * More balanced approach to difficulty adjustment
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

    // Don't change difficulty too early - need at least 3 attempts
    if (totalAttempts < 3) {
      return currentDifficulty;
    }

    // === INCREASE DIFFICULTY ===
    // Move up if doing consistently well
    const shouldAdvance = 
      consecutiveCorrect >= this.CORRECT_STREAK_TO_ADVANCE &&
      masteryLevel >= this.MASTERY_THRESHOLD_MEDIUM &&
      recentAccuracy >= 75 &&
      totalAttempts >= 5;

    if (shouldAdvance && currentIndex < difficulties.length - 1) {
      console.log(`🎯 Advancing difficulty: ${currentDifficulty} → ${difficulties[currentIndex + 1]}`);
      console.log(`   Streak: ${consecutiveCorrect}, Mastery: ${masteryLevel}%, Recent: ${recentAccuracy}%`);
      return difficulties[currentIndex + 1];
    }

    // === DECREASE DIFFICULTY ===
    // More forgiving decrease conditions
    const shouldDecrease = 
      // Immediate decrease: 2 wrong in a row
      consecutiveWrong >= this.WRONG_STREAK_TO_DECREASE ||
      
      // Recent performance is poor (last 10 questions < 50%)
      (recentAccuracy < 50 && totalAttempts >= 10) ||
      
      // Overall mastery is low after enough attempts
      (masteryLevel < this.MASTERY_THRESHOLD_LOW && totalAttempts >= 10) ||
      
      // Struggling at higher difficulties (more lenient)
      (currentIndex >= 2 && recentAccuracy < 60 && totalAttempts >= 8); // HARD/EXPERT

    if (shouldDecrease && currentIndex > 0) {
      console.log(`📉 Decreasing difficulty: ${currentDifficulty} → ${difficulties[currentIndex - 1]}`);
      console.log(`   Wrong streak: ${consecutiveWrong}, Mastery: ${masteryLevel}%, Recent: ${recentAccuracy}%`);
      return difficulties[currentIndex - 1];
    }

    // === SMART ADJUSTMENTS ===
    // If at EXPERT and struggling (even without consecutive wrong)
    if (currentIndex === 3 && recentAccuracy < 65 && totalAttempts >= 6) {
      console.log(`📉 Dropping from EXPERT due to recent struggles`);
      console.log(`   Recent accuracy: ${recentAccuracy}%`);
      return difficulties[2]; // Drop to HARD
    }

    // If at EASY and doing great, nudge them up faster
    if (currentIndex === 0 && recentAccuracy >= 90 && totalAttempts >= 4) {
      console.log(`🎯 Fast-tracking from EASY due to strong performance`);
      console.log(`   Recent accuracy: ${recentAccuracy}%`);
      return difficulties[1]; // Move to MEDIUM
    }

    return currentDifficulty;
  }

  /**
   * Calculate mastery level with exponential moving average
   * Weights recent performance more heavily
   */
  calculateMasteryLevel(
    currentMastery: number,
    correctAttempts: number,
    totalAttempts: number,
    isCorrect: boolean
  ): number {
    if (totalAttempts === 0) return 0;
    
    // Overall accuracy
    const overallAccuracy = (correctAttempts / totalAttempts) * 100;
    
    // Apply exponential moving average (weight recent performance)
    const alpha = 0.3; // Smoothing factor (higher = more weight on recent)
    const recentImpact = isCorrect ? 100 : 0;
    const newMastery = (alpha * recentImpact) + ((1 - alpha) * currentMastery);
    
    // Blend overall accuracy with EMA
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
   */
  calculateNextReview(
    currentInterval: number,
    easeFactor: number,
    quality: number // 0-5 scale (5=perfect, 0=complete failure)
  ): { nextInterval: number; nextEaseFactor: number; nextReviewDate: Date } {
    let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(this.MIN_EASE_FACTOR, newEaseFactor);

    let nextInterval: number;
    if (quality < 3) {
      // Failed recall - reset interval
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

    // Base quality for correct answer
    let quality = 4;

    // Adjust based on time taken
    if (timeSpent && averageTime) {
      const timeRatio = timeSpent / averageTime;
      if (timeRatio < 0.5) {
        quality = 5; // Very fast and correct
      } else if (timeRatio < 0.8) {
        quality = 4; // Good speed
      } else if (timeRatio > 1.5) {
        quality = 3; // Slow but correct
      }
    }

    return quality;
  }

  /**
   * Track performance patterns and identify weak areas
   */
  async analyzePerformancePatterns(userId: string, unitId: string): Promise<PerformancePattern> {
    // Get all responses for this unit
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
      take: 50, // Analyze last 50 attempts
    });

    // Analyze by topic
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
        // Track mistake types
        const difficulty = response.question.difficulty;
        mistakeTypes[difficulty] = (mistakeTypes[difficulty] || 0) + 1;
      }

      if (response.timeSpent) {
        times.push(response.timeSpent);
      }
    }

    // Identify weak and strong topics
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

    // Calculate time statistics
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
   * Update user progress with comprehensive metrics
   */
  async updateProgress(
    userId: string,
    unitId: string,
    isCorrect: boolean,
    timeSpent?: number,
    topicId?: string
  ): Promise<ProgressMetrics> {
    const topicIdValue = topicId === undefined ? null : topicId;

    // Find existing progress
    let progress = await this.findProgress(userId, unitId, topicId);

    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          userId,
          unitId,
          topicId: topicIdValue,
          currentDifficulty: 'EASY',
          totalAttempts: 0,
          correctAttempts: 0,
          consecutiveCorrect: 0,
          consecutiveWrong: 0,
          masteryLevel: 0,
          easeFactor: this.DEFAULT_EASE_FACTOR,
          interval: 0,
        },
      });
    }

    // Update streaks
    const newConsecutiveCorrect = isCorrect ? progress.consecutiveCorrect + 1 : 0;
    const newConsecutiveWrong = !isCorrect ? progress.consecutiveWrong + 1 : 0;
    const newTotalAttempts = progress.totalAttempts + 1;
    const newCorrectAttempts = progress.correctAttempts + (isCorrect ? 1 : 0);

    // Calculate new mastery level with EMA
    const newMasteryLevel = this.calculateMasteryLevel(
      progress.masteryLevel,
      newCorrectAttempts,
      newTotalAttempts,
      isCorrect
    );

    // Get recent accuracy
    const recentAccuracy = await this.calculateRecentAccuracy(userId, unitId);

    console.log('📊 Performance Metrics:', {
      consecutiveCorrect: newConsecutiveCorrect,
      consecutiveWrong: newConsecutiveWrong,
      masteryLevel: newMasteryLevel,
      recentAccuracy,
      totalAttempts: newTotalAttempts,
    });

    // Determine next difficulty
    const newDifficulty = this.getNextDifficulty(
      progress.currentDifficulty,
      newConsecutiveCorrect,
      newConsecutiveWrong,
      newMasteryLevel,
      newTotalAttempts,
      recentAccuracy
    );

    // Spaced repetition calculation
    const quality = this.calculateQuality(isCorrect, timeSpent, progress.averageTimePerQuestion || undefined);
    const { nextInterval, nextEaseFactor, nextReviewDate } = this.calculateNextReview(
      progress.interval,
      progress.easeFactor,
      quality
    );

    // Update time tracking
    const newTotalTimeSpent = progress.totalTimeSpent + (timeSpent || 0);
    const newAverageTime = newTotalAttempts > 0 
      ? newTotalTimeSpent / newTotalAttempts 
      : 0;

    // Analyze performance patterns
    const patterns = await this.analyzePerformancePatterns(userId, unitId);

    // Update progress with all new metrics
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
        nextReviewDate,
      strugglingTopics: patterns.weakTopics.length > 0 ? patterns.weakTopics : undefined,
commonMistakes: Object.keys(patterns.commonMistakes).length > 0 ? patterns.commonMistakes : undefined,
      },
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
  }

  /**
   * Get current progress for a user and unit
   */
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

  /**
   * Get recommended difficulty with spaced repetition consideration
   */
  async getRecommendedDifficulty(userId: string, unitId: string, topicId?: string): Promise<DifficultyLevel> {
    const progress = await this.getProgress(userId, unitId, topicId);
    
    if (!progress) {
      return 'EASY'; // Start with easy for new users
    }

    // Check if topic needs review based on spaced repetition
    if (progress.nextReviewDate && new Date() >= progress.nextReviewDate) {
      console.log('📅 Spaced repetition: Review needed for this topic');
      // Start review at one difficulty level lower
      const difficulties: DifficultyLevel[] = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
      const currentIndex = difficulties.indexOf(progress.currentDifficulty);
      return currentIndex > 0 ? difficulties[currentIndex - 1] : progress.currentDifficulty;
    }

    return progress.currentDifficulty;
  }

  /**
   * Get comprehensive learning insights
   */
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

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(progress: any, patterns: PerformancePattern): string[] {
    const recommendations: string[] = [];

    // Mastery-based recommendations
    if (progress.masteryLevel < 50) {
      recommendations.push('Focus on fundamentals - review basic concepts');
    } else if (progress.masteryLevel < 75) {
      recommendations.push('Good progress! Practice more to solidify understanding');
    } else if (progress.masteryLevel >= 85) {
      recommendations.push('Excellent mastery! Try more challenging problems');
    }

    // Weak topics
    if (patterns.weakTopics.length > 0) {
      recommendations.push(`Review these topics: ${patterns.weakTopics.join(', ')}`);
    }

    // Time-based recommendations
    if (patterns.timePatterns.averageTimePerQuestion > 180) {
      recommendations.push('Try to improve response time with timed practice');
    }

    // Consistency
    if (progress.consecutiveWrong >= 2) {
      recommendations.push('Take a short break and review explanations carefully');
    }

    return recommendations;
  }

  /**
   * Get units that need review (spaced repetition)
   */
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