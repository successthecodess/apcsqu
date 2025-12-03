import prisma from '../config/database.js';
import questionService from './questionService.js';
import adaptiveLearningService from './adaptiveLearningService.js';
import { AppError } from '../middleware/errorHandler.js';

export class PracticeSessionService {
  private readonly QUESTIONS_PER_SESSION = 40;

  /**
   * Ensure user exists in database
   */
  private async ensureUserExists(userId: string, userEmail?: string, userName?: string) {
    console.log('Ensuring user exists:', userId);
    
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      const updates: any = {
        lastActive: new Date(),
      };

      if (userName && userName !== user.name) {
        updates.name = userName;
      }

      if (userEmail && userEmail !== user.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email: userEmail,
            id: { not: userId },
          },
        });

        if (!emailExists) {
          updates.email = userEmail;
        }
      }

      if (Object.keys(updates).length > 1) {
        user = await prisma.user.update({
          where: { id: userId },
          data: updates,
        });
        console.log('✅ User updated:', user.id);
      } else {
        console.log('✅ User found (no updates needed):', user.id);
      }
    } else {
      const email = userEmail || `${userId}-${Date.now()}@clerk.user`;
      
      user = await prisma.user.create({
        data: {
          id: userId,
          email: email,
          name: userName,
          password: 'clerk-managed',
        },
      });
      console.log('✅ User created:', user.id);
    }

    return user;
  }

  /**
   * Start a new practice session with configurable question count
   */
  async startSession(
    userId: string, 
    unitId: string, 
    topicId?: string, 
    userEmail?: string, 
    userName?: string,
    targetQuestions: number = 40
  ) {
    console.log('🎯 Starting practice session:', { userId, unitId, topicId, targetQuestions });

    try {
      await this.ensureUserExists(userId, userEmail, userName);

      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
      });

      if (!unit) {
        throw new AppError('Unit not found', 404);
      }

      console.log('✅ Unit found:', unit.name);

      const hasQuestions = await questionService.hasQuestions(unitId);
      
      if (!hasQuestions) {
        throw new AppError(
          `No approved questions available for ${unit.name}. Please contact your administrator to add questions.`,
          404
        );
      }

      const counts = await questionService.getQuestionCounts(unitId);
      console.log('📊 Question counts:', counts);

      const recommendedDifficulty = await adaptiveLearningService.getRecommendedDifficulty(
        userId,
        unitId,
        topicId
      );

      console.log('📊 Recommended difficulty:', recommendedDifficulty);

      const session = await prisma.studySession.create({
        data: {
          userId,
          unitId,
          topicId: topicId === undefined ? null : topicId,
          sessionType: 'PRACTICE',
          totalQuestions: 0,
          correctAnswers: 0,
          targetQuestions: targetQuestions,
        },
      });

      console.log('✅ Session created:', session.id);

      const question = await questionService.getRandomQuestion(unitId, recommendedDifficulty, []);

      if (!question) {
        const difficulties = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
        let foundQuestion = null;

        for (const diff of difficulties) {
          foundQuestion = await questionService.getRandomQuestion(unitId, diff as any, []);
          if (foundQuestion) {
            console.log(`✅ Found question at ${diff} difficulty`);
            break;
          }
        }

        if (!foundQuestion) {
          throw new AppError(
            `No questions available for ${unit.name}. Please contact your administrator to add questions.`,
            404
          );
        }

        return {
          session,
          question: foundQuestion,
          recommendedDifficulty,
          questionsRemaining: targetQuestions - 1,
          totalQuestions: targetQuestions,
          questionCounts: counts,
        };
      }

      console.log('✅ Question found:', question.id);

      return {
        session,
        question,
        recommendedDifficulty,
        questionsRemaining: targetQuestions - 1,
        totalQuestions: targetQuestions,
        questionCounts: counts,
      };
    } catch (error) {
      console.error('❌ Error in startSession:', error);
      throw error;
    }
  }

  /**
   * Get next question in session (no repeats)
   */
  async getNextQuestion(
    userId: string,
    sessionId: string,
    unitId: string,
    answeredQuestionIds: string[],
    topicId?: string
  ) {
    console.log('🎯 Getting next question:', { 
      userId, 
      sessionId, 
      unitId, 
      answeredCount: answeredQuestionIds.length,
    });

    try {
      const session = await prisma.studySession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      const targetQuestions = session.targetQuestions || this.QUESTIONS_PER_SESSION;

      if (session.totalQuestions >= targetQuestions) {
        console.log('✅ Session complete!');
        return null;
      }

      console.log(`Remaining: ${targetQuestions - session.totalQuestions}`);

      const recommendedDifficulty = await adaptiveLearningService.getRecommendedDifficulty(
        userId,
        unitId,
        topicId
      );

      console.log('📊 Recommended difficulty:', recommendedDifficulty);

      let question = await questionService.getRandomQuestion(
        unitId,
        recommendedDifficulty,
        answeredQuestionIds
      );

      if (!question) {
        console.log('⚠️ No question at recommended difficulty, trying others...');
        const difficulties = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
        
        for (const difficulty of difficulties) {
          if (difficulty === recommendedDifficulty) continue;
          
          question = await questionService.getRandomQuestion(
            unitId,
            difficulty as any,
            answeredQuestionIds
          );
          
          if (question) {
            console.log(`✅ Found question at ${difficulty} difficulty`);
            break;
          }
        }
      }

      if (!question) {
        console.log('⚠️ No more questions available in question bank');
        
        const totalQuestions = await questionService.getQuestionCounts(unitId);
        
        if (answeredQuestionIds.length >= totalQuestions.total) {
          throw new AppError(
            `You've completed all ${totalQuestions.total} available questions for this unit! Great job! 🎉`,
            404
          );
        } else {
          throw new AppError(
            'No more questions available at this time. Please try again later or contact your administrator.',
            404
          );
        }
      }

      console.log('✅ Question found:', question.id);
      return question;
    } catch (error) {
      console.error('❌ Error in getNextQuestion:', error);
      throw error;
    }
  }

  /**
   * Submit an answer for a question in a session
   */
  async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    userAnswer: string,
    timeSpent?: number
  ) {
    console.log('📝 Submitting answer:', { userId, sessionId, questionId, timeSpent });

    try {
      // Submit answer to question service
      const result = await questionService.submitAnswer(
        userId,
        questionId,
        userAnswer,
        timeSpent
      );

      console.log('✅ Answer result:', result.isCorrect ? '✅ Correct' : '❌ Incorrect');

      // Update session statistics
      const updateData: any = {
        totalQuestions: { increment: 1 },
      };

      if (result.isCorrect) {
        updateData.correctAnswers = { increment: 1 };
      }

      const session = await prisma.studySession.update({
        where: { id: sessionId },
        data: updateData,
      });

      console.log('✅ Session updated');

      // Update user progress for this question and get progress metrics
      const progress = await adaptiveLearningService.updateProgress(
        userId,
        questionId,
        result.isCorrect,
        timeSpent
      );

      console.log('✅ User progress updated');

      return {
        ...result,
        session,
        progress,
      };
    } catch (error) {
      console.error('❌ Error in submitAnswer:', error);
      throw error;
    }
  }

  /**
   * End a practice session and calculate final statistics
   */
  async endSession(sessionId: string) {
    console.log('🏁 Ending session:', sessionId);

    try {
      const session = await prisma.studySession.findUnique({
        where: { id: sessionId },
        include: {
          responses: {
            include: {
              question: {
                include: {
                  topic: true,
                },
              },
            },
          },
        },
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      // Calculate session duration
      const duration = Math.floor(
        (new Date().getTime() - new Date(session.startedAt).getTime()) / 1000
      );

      // Calculate average time per question
      const averageTime = session.totalQuestions > 0
        ? duration / session.totalQuestions
        : 0;

      // Calculate accuracy rate
      const accuracyRate = session.totalQuestions > 0
        ? (session.correctAnswers / session.totalQuestions) * 100
        : 0;

      // Update session with final statistics
      const updatedSession = await prisma.studySession.update({
        where: { id: sessionId },
        data: {
          endedAt: new Date(),
          totalDuration: duration,
          averageTime,
          accuracyRate,
        },
      });

      console.log('✅ Session ended successfully');

      // Prepare summary
      const summary = {
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        accuracyRate: Math.round(accuracyRate),
        totalDuration: duration,
        averageTime: Math.round(averageTime),
        responses: session.responses.map((r) => ({
          questionId: r.questionId,
          isCorrect: r.isCorrect,
          timeSpent: r.timeSpent || 0,
          topic: r.question.topic?.name || 'General',
        })),
      };

      return {
        session: updatedSession,
        summary,
      };
    } catch (error) {
      console.error('❌ Error in endSession:', error);
      throw error;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string) {
    const session = await prisma.studySession.findUnique({
      where: { id: sessionId },
      include: {
        responses: true,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    return {
      totalQuestions: session.totalQuestions,
      correctAnswers: session.correctAnswers,
      accuracy: session.totalQuestions > 0
        ? (session.correctAnswers / session.totalQuestions) * 100
        : 0,
      responsesCount: session.responses.length,
    };
  }
}

export default new PracticeSessionService();