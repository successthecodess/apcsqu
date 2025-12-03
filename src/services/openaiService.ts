import openai from '../config/openai.js';
import { QuestionType, DifficultyLevel } from '@prisma/client';
import { unitPrompts } from './prompts/unitPrompts.js';
import { getQuestionTemplate } from './prompts/questionTemplates';

interface GeneratedQuestion {
  questionText: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export class OpenAIService {
  private buildSystemPrompt(unitNumber: number, topicName?: string): string {
    const unitConfig = unitPrompts[unitNumber];
    if (!unitConfig) {
      throw new Error(`No prompt configuration for unit ${unitNumber}`);
    }

    let prompt = unitConfig.systemPrompt;

    if (topicName && unitConfig.topics[topicName]) {
      const topic = unitConfig.topics[topicName];
      prompt += `\n\nFocus specifically on: ${topic.description}`;
      prompt += `\n\nKey Learning Objectives:\n${topic.keyLearningObjectives.map((obj) => `- ${obj}`).join('\n')}`;
      prompt += `\n\nCommon Student Misconceptions to Address:\n${topic.commonMisconceptions.map((misc) => `- ${misc}`).join('\n')}`;
    }

    prompt += `\n\nExample Concepts for this unit:\n${unitConfig.exampleConcepts.map((concept) => `- ${concept}`).join('\n')}`;

    return prompt;
  }

  private buildUserPrompt(
    type: QuestionType,
    difficulty: DifficultyLevel,
    additionalContext?: string
  ): string {
    const template = getQuestionTemplate(type, difficulty);

    let prompt = `${template.instruction}\n\n`;
    prompt += `Requirements:\n${template.requirements.map((req) => `- ${req}`).join('\n')}\n\n`;
    
    if (additionalContext) {
      prompt += `Additional Context: ${additionalContext}\n\n`;
    }

    prompt += `${template.format}\n\n`;
    prompt += `CRITICAL: Return ONLY the JSON object, no other text before or after. Ensure all JSON is properly escaped.`;

    return prompt;
  }

  async generateQuestion(
    unitNumber: number,
    type: QuestionType,
    difficulty: DifficultyLevel,
    topicName?: string,
    additionalContext?: string
  ): Promise<GeneratedQuestion> {
    try {
      const systemPrompt = this.buildSystemPrompt(unitNumber, topicName);
      const userPrompt = this.buildUserPrompt(type, difficulty, additionalContext);

      console.log('Generating question with:', { unitNumber, type, difficulty, topicName });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const parsed = JSON.parse(content);

      // Validate response structure
      this.validateQuestionStructure(parsed, type);

      return {
        questionText: parsed.questionText,
        codeSnippet: parsed.codeSnippet,
        options: parsed.options,
        correctAnswer: parsed.correctAnswer,
        explanation: parsed.explanation,
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error(`Failed to generate question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateQuestionStructure(parsed: any, type: QuestionType): void {
    if (!parsed.questionText || typeof parsed.questionText !== 'string') {
      throw new Error('Invalid questionText');
    }

    if (!parsed.correctAnswer || typeof parsed.correctAnswer !== 'string') {
      throw new Error('Invalid correctAnswer');
    }

    if (!parsed.explanation || typeof parsed.explanation !== 'string') {
      throw new Error('Invalid explanation');
    }

    // Validate based on question type
    if (type === 'MULTIPLE_CHOICE' || type === 'CODE_ANALYSIS' || type === 'TRUE_FALSE') {
      if (!Array.isArray(parsed.options) || parsed.options.length < 2) {
        throw new Error('Invalid options array');
      }
    }

    // Validate code snippet for code-based questions
    if (type === 'CODE_COMPLETION' || type === 'CODE_ANALYSIS') {
      if (parsed.codeSnippet && typeof parsed.codeSnippet !== 'string') {
        throw new Error('Invalid codeSnippet');
      }
    }
  }

  async generateMultipleQuestions(
    unitNumber: number,
    type: QuestionType,
    difficulty: DifficultyLevel,
    count: number,
    topicName?: string
  ): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];
    
    // Generate questions one at a time to ensure variety
    for (let i = 0; i < count; i++) {
      try {
        const question = await this.generateQuestion(
          unitNumber,
          type,
          difficulty,
          topicName,
          `Generate a unique question. This is question ${i + 1} of ${count}.`
        );
        questions.push(question);
        
        // Small delay to avoid rate limiting
        if (i < count - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to generate question ${i + 1}:`, error);
        // Continue with remaining questions
      }
    }

    return questions;
  }

  async validateQuestionQuality(question: GeneratedQuestion): Promise<{
    isValid: boolean;
    issues: string[];
    score: number;
  }> {
    const issues: string[] = [];
    let score = 100;

    // Check question length
    if (question.questionText.length < 20) {
      issues.push('Question text is too short');
      score -= 20;
    }

    if (question.questionText.length > 1000) {
      issues.push('Question text is too long');
      score -= 10;
    }

    // Check explanation quality
    if (question.explanation.length < 30) {
      issues.push('Explanation is insufficient');
      score -= 15;
    }

    // Check for code quality if code snippet exists
    if (question.codeSnippet) {
      if (!question.codeSnippet.includes('public') && !question.codeSnippet.includes('class')) {
        // This is just a basic check; you might want more sophisticated validation
      }
    }

    // Check options for multiple choice
    if (question.options) {
      if (question.options.length !== 4 && question.options.length !== 2) {
        issues.push('Invalid number of options');
        score -= 20;
      }

      const hasCorrectAnswer = question.options.some((opt) =>
        opt.startsWith(question.correctAnswer)
      );
      if (!hasCorrectAnswer) {
        issues.push('Correct answer not found in options');
        score -= 30;
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, score),
    };
  }
}

export default new OpenAIService();