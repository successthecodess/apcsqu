import prisma from '../config/database.js';
import { DifficultyLevel, QuestionType, Question } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

export class QuestionService {
  /**
   * Parse options from JsonValue to string array
   */
  private parseOptions(options: any): string[] {
    if (!options) return [];
    
    if (Array.isArray(options)) {
      return options as string[];
    }
    
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [options];
      }
    }
    
    return [];
  }

  /**
   * Normalize answer for comparison - handles formatting differences
   */
  private normalizeAnswer(answer: string): string {
    let normalized = answer
      .trim()
      .toLowerCase()
      // Remove option prefixes like "A)", "B)", "a.", "1)", etc.
      .replace(/^[a-z]\)\s*/i, '')
      .replace(/^[a-z]\.\s*/i, '')
      .replace(/^[0-9]\)\s*/i, '')
      .replace(/^[0-9]\.\s*/i, '')
      .replace(/`/g, '') // Remove backticks
      .replace(/\s+/g, ' ') // Normalize whitespace to single space
      .replace(/[.,;:!?'"]/g, '') // Remove punctuation
      .replace(/\n/g, ' ') // Replace newlines with space
      .replace(/\r/g, ''); // Remove carriage returns

    return normalized.trim();
  }

  /**
   * Check if answer is correct - ENHANCED VERSION WITH DEBUG LOGGING
   */
  private checkAnswer(userAnswer: string, correctAnswer: string, options: string[], type: QuestionType): boolean {
    console.log('\n=== ANSWER CHECK START ===');
    console.log('Raw Input:');
    console.log('  User Answer:', JSON.stringify(userAnswer));
    console.log('  Correct Answer:', JSON.stringify(correctAnswer));
    console.log('  Options:', JSON.stringify(options));
    console.log('  Type:', type);

    // Normalize both answers
    const normalizedUserAnswer = this.normalizeAnswer(userAnswer);
    const normalizedCorrectAnswer = this.normalizeAnswer(correctAnswer);
    
    console.log('\nNormalized:');
    console.log('  User:', JSON.stringify(normalizedUserAnswer));
    console.log('  Correct:', JSON.stringify(normalizedCorrectAnswer));

    // Direct match after normalization
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      console.log('✅ MATCH: Direct normalized match');
      console.log('=== ANSWER CHECK END ===\n');
      return true;
    }

    // For multiple choice, try to match by finding the correct option
    if (type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE' || type === 'CODE_ANALYSIS') {
      console.log('\nOption Matching:');
      
      // Normalize all options
      const normalizedOptions = options.map(opt => ({
        original: opt,
        normalized: this.normalizeAnswer(opt)
      }));

      console.log('  Normalized Options:');
      normalizedOptions.forEach((opt, idx) => {
        console.log(`    [${idx}] "${opt.original}" -> "${opt.normalized}"`);
      });

      // Find which option the user selected
      const userSelectedOption = normalizedOptions.find(opt => 
        opt.normalized === normalizedUserAnswer || opt.original === userAnswer
      );

      // Find which option is correct
      // First try: exact match
      let correctOption = normalizedOptions.find(opt => 
        opt.normalized === normalizedCorrectAnswer || opt.original === correctAnswer
      );

      // Second try: if correct answer is just a letter like "A", find option starting with it
      if (!correctOption && /^[A-D]$/i.test(correctAnswer)) {
        console.log(`  Correct answer is just letter "${correctAnswer}", finding matching option...`);
        const letterPattern = new RegExp(`^${correctAnswer}[)\\.]?\\s*`, 'i');
        correctOption = normalizedOptions.find(opt => letterPattern.test(opt.original));
      }

      console.log('\nMatching Results:');
      console.log('  User Selected:', userSelectedOption ? JSON.stringify(userSelectedOption.original) : 'NOT FOUND');
      console.log('  Correct Option:', correctOption ? JSON.stringify(correctOption.original) : 'NOT FOUND');

      if (userSelectedOption && correctOption) {
        const isMatch = userSelectedOption.original === correctOption.original;
        console.log(`${isMatch ? '✅' : '❌'} RESULT: ${isMatch ? 'CORRECT' : 'WRONG'}`);
        console.log('=== ANSWER CHECK END ===\n');
        return isMatch;
      }
    }

    console.log('❌ RESULT: No match found');
    console.log('=== ANSWER CHECK END ===\n');
    return false;
  }

  /**
   * Get questions by unit with filters
   */
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

  /**
   * Get a random question (excluding specified IDs to prevent repeats)
   */
  async getRandomQuestion(
    unitId: string,
    difficulty: DifficultyLevel,
    excludeIds: string[] = []
  ): Promise<Question | null> {
    console.log('🎲 Getting random question:', { 
      unitId, 
      difficulty, 
      excludeCount: excludeIds.length 
    });

    try {
      const availableQuestions = await prisma.question.findMany({
        where: {
          unitId,
          difficulty,
          approved: true,
          id: {
            notIn: excludeIds,
          },
        },
        include: {
          unit: true,
          topic: true,
        },
      });

      if (availableQuestions.length === 0) {
        console.log(`⚠️ No ${difficulty} questions available (${excludeIds.length} excluded)`);
        return null;
      }

      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const selectedQuestion = availableQuestions[randomIndex];

      console.log(`✅ Found ${difficulty} question:`, selectedQuestion.id);

      return selectedQuestion;
    } catch (error) {
      console.error('❌ Error getting random question:', error);
      throw error;
    }
  }

  /**
   * Check if a unit has any approved questions
   */
  async hasQuestions(unitId: string): Promise<boolean> {
    const count = await prisma.question.count({
      where: {
        unitId,
        approved: true,
      },
    });

    return count > 0;
  }

  /**
   * Get question count by difficulty for a unit
   */
  async getQuestionCounts(unitId: string): Promise<{
    total: number;
    byDifficulty: Record<DifficultyLevel, number>;
  }> {
    const questions = await prisma.question.findMany({
      where: {
        unitId,
        approved: true,
      },
      select: {
        difficulty: true,
      },
    });

    const byDifficulty: Record<DifficultyLevel, number> = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
      EXPERT: 0,
    };

    questions.forEach((q) => {
      byDifficulty[q.difficulty]++;
    });

    return {
      total: questions.length,
      byDifficulty,
    };
  }

  /**
   * Submit an answer and check if it's correct
   */
  async submitAnswer(
    userId: string,
    questionId: string,
    userAnswer: string,
    timeSpent?: number
  ): Promise<{
    id: string;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    userAnswer: string;
  }> {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Parse options from JSON
    const options = this.parseOptions(question.options);

    console.log('\n📝 SUBMIT ANSWER');
    console.log('Question ID:', questionId);
    console.log('Question Type:', question.type);

    // Check answer using improved normalization
    const isCorrect = this.checkAnswer(
      userAnswer, 
      question.correctAnswer, 
      options, 
      question.type
    );

    console.log(`\n🎯 FINAL RESULT: ${isCorrect ? '✅ CORRECT' : '❌ WRONG'}`);
    console.log('========================================\n');

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
      id: response.id,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      userAnswer,
    };
  }

  /**
   * Approve or reject a question
   */
  async approveQuestion(questionId: string, approved: boolean) {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { approved },
    });

    return question;
  }

  /**
   * Update question quality score
   */
  async updateQuestionQuality(questionId: string, qualityScore: number) {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { qualityScore: qualityScore / 20 },
    });

    return question;
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: string) {
    return await prisma.question.delete({
      where: { id: questionId },
    });
  }
}

export default new QuestionService();