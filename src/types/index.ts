import { QuestionType, DifficultyLevel } from '@prisma/client';

export interface GenerateQuestionRequest {
  unitId: string;
  topicId?: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  count?: number;
}

export interface QuestionResponse {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
}

export interface ProgressUpdate {
  userId: string;
  questionId: string;
  isCorrect: boolean;
  timeSpent?: number;
}

export interface AdaptiveLearningParams {
  currentDifficulty: DifficultyLevel;
  correctStreak: number;
  totalAttempts: number;
  correctAttempts: number;
}