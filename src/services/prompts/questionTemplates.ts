import { QuestionType, DifficultyLevel } from '@prisma/client';

interface QuestionTemplate {
  instruction: string;
  format: string;
  requirements: string[];
}

export const getQuestionTemplate = (
  type: QuestionType,
  difficulty: DifficultyLevel
): QuestionTemplate => {
  const templates: Record<QuestionType, Record<DifficultyLevel, QuestionTemplate>> = {
    MULTIPLE_CHOICE: {
      EASY: {
        instruction: 'Create a straightforward multiple-choice question testing basic recall or simple application.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Question should be clear and unambiguous',
          'Test one concept at a time',
          'Options should be plausible',
          'Include one obviously incorrect distractor',
          'Correct answer should be definitively right',
          'Explanation should teach the concept',
        ],
      },
      MEDIUM: {
        instruction: 'Create a moderate multiple-choice question requiring understanding and application of concepts.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Require multi-step reasoning',
          'Include code snippet if appropriate',
          'Distractors should represent common errors',
          'Test deeper understanding, not just recall',
          'Explanation should address why distractors are wrong',
        ],
      },
      HARD: {
        instruction: 'Create a challenging multiple-choice question requiring synthesis and complex reasoning.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Combine multiple concepts',
          'Include non-trivial code analysis',
          'All distractors should be tempting',
          'Require careful reasoning to solve',
          'Test edge cases or subtle differences',
          'Explanation should be comprehensive',
        ],
      },
      EXPERT: {
        instruction: 'Create an AP exam-level multiple-choice question with sophisticated reasoning.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'AP exam quality and difficulty',
          'Complex code analysis required',
          'Distractors based on subtle misconceptions',
          'May involve multiple methods or classes',
          'Test advanced understanding',
          'Professional explanation with teaching points',
        ],
      },
    },
    FREE_RESPONSE: {
      EASY: {
        instruction: 'Create a simple free-response question requiring code writing or explanation.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "correctAnswer": "...", "explanation": "..."}',
        requirements: [
          'Clear, specific task',
          'Single method or short code',
          'Straightforward logic',
          'Provide complete solution',
          'Explain approach clearly',
        ],
      },
      MEDIUM: {
        instruction: 'Create a moderate free-response question requiring algorithmic thinking.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "correctAnswer": "...", "explanation": "..."}',
        requirements: [
          'Require complete method implementation',
          'Test problem-solving skills',
          'Include edge cases to consider',
          'Provide clean, correct solution',
          'Explain key decisions',
        ],
      },
      HARD: {
        instruction: 'Create a challenging free-response question similar to AP FRQ.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "correctAnswer": "...", "explanation": "..."}',
        requirements: [
          'Complex algorithm or class design',
          'Multiple parts or methods',
          'Require efficiency considerations',
          'Handle multiple edge cases',
          'Provide complete, elegant solution',
          'Explain design choices',
        ],
      },
      EXPERT: {
        instruction: 'Create an AP FRQ-style question with sophisticated requirements.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "correctAnswer": "...", "explanation": "..."}',
        requirements: [
          'AP exam FRQ quality',
          'Multiple methods or class interactions',
          'Consider inheritance, interfaces, etc.',
          'Professional code with comments',
          'Comprehensive explanation with rubric points',
        ],
      },
    },
    CODE_COMPLETION: {
      EASY: {
        instruction: 'Create a code completion question with a simple missing piece.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "codeSnippet": "...", "correctAnswer": "...", "explanation": "..."}',
        requirements: [
          'One clear missing piece',
          'Context makes answer obvious',
          'Test basic syntax or method call',
        ],
      },
      MEDIUM: {
        instruction: 'Create a code completion question requiring understanding.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "codeSnippet": "...", "correctAnswer": "...", "explanation": "..."}',
        requirements: [
          'Missing piece requires logic',
          'Multiple possible wrong answers',
          'Test algorithmic understanding',
        ],
      },
      HARD: {
        instruction: 'Create a challenging code completion question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "codeSnippet": "...", "correctAnswer": "...", "explanation": "..."}',
        requirements: [
          'Complex missing piece',
          'Require deep understanding',
          'Multiple concepts involved',
        ],
      },
      EXPERT: {
        instruction: 'Create an expert-level code completion question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "codeSnippet": "...", "correctAnswer": "...", "explanation": "..."}',
        requirements: [
          'AP exam difficulty',
          'Sophisticated reasoning required',
          'Multiple valid approaches possible',
        ],
      },
    },
    CODE_ANALYSIS: {
      EASY: {
        instruction: 'Create a simple code analysis question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "What is the output?", "codeSnippet": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Short code snippet',
          'Clear expected output',
          'Basic logic only',
        ],
      },
      MEDIUM: {
        instruction: 'Create a moderate code analysis question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "What is the output?", "codeSnippet": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Multiple statements to trace',
          'Some tricky logic',
          'Require careful tracing',
        ],
      },
      HARD: {
        instruction: 'Create a challenging code analysis question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "What is the output?", "codeSnippet": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Complex logic to trace',
          'Loops or recursion',
          'Non-obvious output',
        ],
      },
      EXPERT: {
        instruction: 'Create an expert code analysis question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "What is the output?", "codeSnippet": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Very complex logic',
          'Multiple methods or classes',
          'Requires expert-level tracing',
        ],
      },
    },
    TRUE_FALSE: {
      EASY: {
        instruction: 'Create a simple true/false question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "options": ["A) True", "B) False"], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Clear true or false statement',
          'Test basic concept',
          'No ambiguity',
        ],
      },
      MEDIUM: {
        instruction: 'Create a moderate true/false question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "options": ["A) True", "B) False"], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Require understanding to evaluate',
          'May include code',
          'Test common misconception',
        ],
      },
      HARD: {
        instruction: 'Create a challenging true/false question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "options": ["A) True", "B) False"], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Subtle or tricky statement',
          'Require deep understanding',
          'Test edge cases',
        ],
      },
      EXPERT: {
        instruction: 'Create an expert true/false question.',
        format: 'Return ONLY valid JSON with this exact structure: {"questionText": "...", "options": ["A) True", "B) False"], "correctAnswer": "A", "explanation": "..."}',
        requirements: [
          'Very subtle distinction',
          'Expert-level understanding needed',
          'Based on specification details',
        ],
      },
    },
  };

  return templates[type][difficulty];
};