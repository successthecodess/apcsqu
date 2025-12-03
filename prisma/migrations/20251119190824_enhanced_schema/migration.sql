/*
  Warnings:

  - You are about to drop the column `analytics` on the `exam_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `exam_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `exam_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `frqPercentage` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `mcqPercentage` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `correctStreak` on the `progress` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `exam_attempts` table without a default value. This is not possible if the table is not empty.
  - Made the column `responses` on table `exam_attempts` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficultyAtTime` to the `question_responses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `topics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('PRACTICE', 'EXAM', 'REVIEW', 'TIMED_DRILL', 'ADAPTIVE');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('PRACTICE', 'DIAGNOSTIC', 'UNIT_TEST', 'FINAL_PRACTICE', 'MOCK_AP');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('STREAK', 'MASTERY', 'EXAM', 'PRACTICE', 'SPEED', 'ACCURACY', 'DEDICATION');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'CODE_COMPLETION';
ALTER TYPE "QuestionType" ADD VALUE 'CODE_ANALYSIS';
ALTER TYPE "QuestionType" ADD VALUE 'TRUE_FALSE';

-- AlterTable
ALTER TABLE "exam_attempts" DROP COLUMN "analytics",
DROP COLUMN "completedAt",
DROP COLUMN "score",
ADD COLUMN     "confidenceData" JSONB,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "difficultyBreakdown" JSONB,
ADD COLUMN     "frqScore" DOUBLE PRECISION,
ADD COLUMN     "mcqScore" DOUBLE PRECISION,
ADD COLUMN     "percentageScore" DOUBLE PRECISION,
ADD COLUMN     "rawScore" DOUBLE PRECISION,
ADD COLUMN     "recommendations" JSONB,
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "status" "ExamStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN     "strengths" TEXT[],
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "timeByQuestion" JSONB,
ADD COLUMN     "timeSpent" INTEGER,
ADD COLUMN     "topicBreakdown" JSONB,
ADD COLUMN     "unitBreakdown" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weaknesses" TEXT[],
ALTER COLUMN "responses" SET NOT NULL;

-- AlterTable
ALTER TABLE "exam_questions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "points" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "section" TEXT;

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "frqPercentage",
DROP COLUMN "mcqPercentage",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "difficultyDistribution" JSONB,
ADD COLUMN     "examType" "ExamType" NOT NULL DEFAULT 'PRACTICE',
ADD COLUMN     "frqCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mcqCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passingScore" DOUBLE PRECISION,
ADD COLUMN     "scoreRanges" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '1.0';

-- AlterTable
ALTER TABLE "progress" DROP COLUMN "correctStreak",
ADD COLUMN     "averageTimePerQuestion" DOUBLE PRECISION,
ADD COLUMN     "commonMistakes" JSONB,
ADD COLUMN     "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "consecutiveCorrect" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "consecutiveWrong" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "masteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "nextReviewDate" TIMESTAMP(3),
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "strugglingTopics" JSONB,
ADD COLUMN     "totalTimeSpent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "question_responses" ADD COLUMN     "attemptNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "difficultyAtTime" "DifficultyLevel" NOT NULL,
ADD COLUMN     "examAttemptId" TEXT,
ADD COLUMN     "flaggedForReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hintsUsedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "partialCredit" DOUBLE PRECISION,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "usedHints" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userConfidence" INTEGER;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "apLearningObjective" TEXT,
ADD COLUMN     "apSkillCategory" TEXT,
ADD COLUMN     "averageTime" DOUBLE PRECISION,
ADD COLUMN     "bloomsLevel" TEXT,
ADD COLUMN     "codeSnippet" TEXT,
ADD COLUMN     "estimatedTime" INTEGER,
ADD COLUMN     "hints" JSONB,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "qualityScore" DOUBLE PRECISION,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "timesAttempted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timesCorrect" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "learningObjectives" TEXT[],
ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prerequisites" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "units" ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "premiumUntil" TIMESTAMP(3),
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT,
    "topicId" TEXT,
    "sessionType" "SessionType" NOT NULL DEFAULT 'PRACTICE',
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "averageTime" DOUBLE PRECISION,
    "accuracyRate" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalDuration" INTEGER,
    "targetQuestions" INTEGER,
    "targetAccuracy" DOUBLE PRECISION,
    "goalAchieved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "questionsAttempted" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "studyTime" INTEGER NOT NULL DEFAULT 0,
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,
    "averageAccuracy" DOUBLE PRECISION,
    "averageTime" DOUBLE PRECISION,
    "studyStreak" INTEGER NOT NULL DEFAULT 0,
    "perfectDays" INTEGER NOT NULL DEFAULT 0,
    "unitsStudied" TEXT[],
    "topicsStudied" TEXT[],
    "dailyGoalMet" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekEnd" DATE NOT NULL,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
    "averageAccuracy" DOUBLE PRECISION,
    "accuracyTrend" TEXT,
    "mostImprovedUnit" TEXT,
    "needsAttentionUnit" TEXT,
    "activeDays" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "peakStudyDay" TEXT,
    "unitsCovered" TEXT[],
    "topicsMastered" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "icon" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "criteria" JSONB NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),
    "isDisplayed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reviews" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL,
    "qualityScore" INTEGER,
    "feedback" TEXT,
    "suggestedEdits" JSONB,
    "hasErrors" BOOLEAN NOT NULL DEFAULT false,
    "needsRevision" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_sessions_userId_startedAt_idx" ON "study_sessions"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "study_sessions_sessionType_idx" ON "study_sessions"("sessionType");

-- CreateIndex
CREATE INDEX "daily_analytics_userId_date_idx" ON "daily_analytics"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_analytics_userId_date_key" ON "daily_analytics"("userId", "date");

-- CreateIndex
CREATE INDEX "weekly_analytics_userId_weekStart_idx" ON "weekly_analytics"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_analytics_userId_weekStart_key" ON "weekly_analytics"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE INDEX "user_achievements_userId_isUnlocked_idx" ON "user_achievements"("userId", "isUnlocked");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "content_reviews_questionId_status_idx" ON "content_reviews"("questionId", "status");

-- CreateIndex
CREATE INDEX "exam_attempts_userId_status_idx" ON "exam_attempts"("userId", "status");

-- CreateIndex
CREATE INDEX "exam_attempts_examId_predictedAPScore_idx" ON "exam_attempts"("examId", "predictedAPScore");

-- CreateIndex
CREATE INDEX "exam_questions_examId_idx" ON "exam_questions"("examId");

-- CreateIndex
CREATE INDEX "exams_examType_isPublished_idx" ON "exams"("examType", "isPublished");

-- CreateIndex
CREATE INDEX "exams_isPremium_idx" ON "exams"("isPremium");

-- CreateIndex
CREATE INDEX "progress_userId_masteryLevel_idx" ON "progress"("userId", "masteryLevel");

-- CreateIndex
CREATE INDEX "progress_nextReviewDate_idx" ON "progress"("nextReviewDate");

-- CreateIndex
CREATE INDEX "question_responses_userId_isCorrect_idx" ON "question_responses"("userId", "isCorrect");

-- CreateIndex
CREATE INDEX "question_responses_sessionId_idx" ON "question_responses"("sessionId");

-- CreateIndex
CREATE INDEX "questions_topicId_difficulty_idx" ON "questions"("topicId", "difficulty");

-- CreateIndex
CREATE INDEX "questions_approved_isActive_idx" ON "questions"("approved", "isActive");

-- CreateIndex
CREATE INDEX "questions_aiGenerated_idx" ON "questions"("aiGenerated");

-- CreateIndex
CREATE INDEX "topics_unitId_idx" ON "topics"("unitId");

-- CreateIndex
CREATE INDEX "topics_isActive_idx" ON "topics"("isActive");

-- CreateIndex
CREATE INDEX "units_unitNumber_idx" ON "units"("unitNumber");

-- CreateIndex
CREATE INDEX "units_isActive_idx" ON "units"("isActive");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "study_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
