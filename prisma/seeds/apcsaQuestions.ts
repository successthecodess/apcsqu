import { PrismaClient, DifficultyLevel, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

interface QuestionData {
  unitNumber: number;
  topicName?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
}

// Unit 1: Primitive Types
const unit1Questions: QuestionData[] = [
  {
    unitNumber: 1,
    topicName: 'Variables and Data Types',
    questionText: `What is the output of the following code?

\`\`\`java
int x = 5;
int y = 2;
System.out.println(x / y);
\`\`\``,
    options: ['2.5', '2', '3', 'Compilation error'],
    correctAnswer: '2',
    explanation: `Integer division in Java truncates the decimal part. When you divide 5 by 2 using integer division, you get 2 (not 2.5). The remainder is discarded. If you wanted 2.5, at least one operand would need to be a \`double\` or \`float\`.`,
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
  },
  {
    unitNumber: 1,
    topicName: 'Variables and Data Types',
    questionText: `Which of the following is a valid variable declaration in Java?`,
    options: [
      '`int 2myVar = 10;`',
      '`int my-Var = 10;`',
      '`int myVar = 10;`',
      '`int my Var = 10;`',
    ],
    correctAnswer: '`int myVar = 10;`',
    explanation: `In Java, variable names must:
- Start with a letter, underscore (_), or dollar sign ($)
- Cannot start with a number
- Cannot contain spaces or hyphens
- Use camelCase convention

Option C is correct because \`myVar\` follows all these rules. The other options violate naming conventions.`,
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
  },
  {
    unitNumber: 1,
    topicName: 'Arithmetic Operations',
    questionText: `What is the value of \`result\` after executing this code?

\`\`\`java
int a = 7;
int b = 3;
int result = a % b;
\`\`\``,
    options: ['2', '1', '3', '4'],
    correctAnswer: '1',
    explanation: `The modulo operator (%) returns the remainder of integer division. When 7 is divided by 3, the quotient is 2 with a remainder of 1. Therefore, \`7 % 3 = 1\`.

This operator is useful for:
- Checking if a number is even/odd (n % 2)
- Cycling through values (index % arrayLength)
- Finding remainders in various algorithms`,
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
  },
  {
    unitNumber: 1,
    topicName: 'Type Casting',
    questionText: `What is the output?

\`\`\`java
double x = 9.8;
int y = (int) x;
System.out.println(y);
\`\`\``,
    options: ['10', '9', '9.8', 'Compilation error'],
    correctAnswer: '9',
    explanation: `Casting a \`double\` to an \`int\` truncates (cuts off) the decimal part without rounding. So 9.8 becomes 9.

Important notes:
- This is narrowing conversion (requires explicit cast)
- No rounding occurs - always truncates toward zero
- 9.8 → 9, and -9.8 → -9
- If you need rounding, use \`Math.round()\``,
    difficulty: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
  },
  {
    unitNumber: 1,
    topicName: 'Operator Precedence',
    questionText: `What does this code print?

\`\`\`java
int result = 10 + 5 * 2;
System.out.println(result);
\`\`\``,
    options: ['30', '20', '15', '25'],
    correctAnswer: '20',
    explanation: `Java follows the standard order of operations (PEMDAS). Multiplication has higher precedence than addition.

Evaluation steps:
1. First: 5 * 2 = 10
2. Then: 10 + 10 = 20

To change the order, use parentheses: \`(10 + 5) * 2 = 30\`

Operator precedence (high to low):
- Parentheses ()
- Multiplication/Division/Modulo (*, /, %)
- Addition/Subtraction (+, -)`,
    difficulty: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
  },
];

// Unit 2: Using Objects
const unit2Questions: QuestionData[] = [
  {
    unitNumber: 2,
    topicName: 'String Methods',
    questionText: `What is the output?

\`\`\`java
String str = "Hello";
System.out.println(str.substring(1, 4));
\`\`\``,
    options: ['ell', 'Hell', 'ello', 'Hel'],
    correctAnswer: 'ell',
    explanation: `The \`substring(beginIndex, endIndex)\` method returns a substring from beginIndex (inclusive) to endIndex (exclusive).

Indices for "Hello":
- H is at index 0
- e is at index 1
- l is at index 2
- l is at index 3
- o is at index 4

\`substring(1, 4)\` returns indices 1, 2, 3 → "ell"

Remember: The end index is NOT included in the result.`,
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
  },
  {
    unitNumber: 2,
    topicName: 'String Comparison',
    questionText: `What is the result of this comparison?

\`\`\`java
String s1 = "hello";
String s2 = "hello";
System.out.println(s1 == s2);
\`\`\``,
    options: ['true', 'false', 'Compilation error', 'Runtime error'],
    correctAnswer: 'true',
    explanation: `This prints \`true\` due to **string interning**. String literals with the same value point to the same object in memory.

However, this is **NOT** the recommended way to compare strings. Use \`.equals()\` instead:

\`\`\`java
String s1 = new String("hello");
String s2 = new String("hello");
System.out.println(s1 == s2);        // false (different objects)
System.out.println(s1.equals(s2));   // true (same content)
\`\`\`

**Best practice:** Always use \`.equals()\` to compare string content.`,
    difficulty: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
  },
  {
    unitNumber: 2,
    topicName: 'Object Creation',
    questionText: `Given the following class:

\`\`\`java
public class Point {
    private int x;
    private int y;
    
    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
\`\`\`

Which statement correctly creates a Point object?`,
    options: [
      '`Point p = Point(5, 10);`',
      '`Point p = new Point(5, 10);`',
      '`Point p = Point.new(5, 10);`',
      '`new Point p(5, 10);`',
    ],
    correctAnswer: '`Point p = new Point(5, 10);`',
    explanation: `To create an object in Java, you must use the \`new\` keyword followed by the constructor call.

Syntax: \`ClassName variableName = new ClassName(arguments);\`

The \`new\` keyword:
- Allocates memory for the object
- Calls the constructor
- Returns a reference to the object

Common mistake: Forgetting the \`new\` keyword (like in option A).`,
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
  },
];

async function seedQuestions() {
  console.log('🌱 Seeding AP CSA questions...');

  try {
    // Get all units
    const units = await prisma.unit.findMany({
      include: { topics: true },
    });

    const allQuestions = [...unit1Questions, ...unit2Questions];

    for (const q of allQuestions) {
      // Find the unit
      const unit = units.find((u) => u.unitNumber === q.unitNumber);
      if (!unit) {
        console.log(`⚠️  Unit ${q.unitNumber} not found, skipping question`);
        continue;
      }

      // Find or create topic
      let topic = null;
      if (q.topicName) {
        topic = unit.topics.find((t) => t.name === q.topicName);
        if (!topic) {
          topic = await prisma.topic.create({
            data: {
              name: q.topicName,
              unitId: unit.id,
            },
          });
        }
      }

      // Check if question already exists to avoid duplicates
      const existingQuestion = await prisma.question.findFirst({
        where: {
          questionText: q.questionText,
          unitId: unit.id,
        },
      });

      if (existingQuestion) {
        console.log(`⏭️  Question already exists for Unit ${q.unitNumber}, skipping`);
        continue;
      }

      // Create question with 'approved' (not 'isApproved')
      await prisma.question.create({
        data: {
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          type: q.type,
          unitId: unit.id,
          topicId: topic?.id,
          approved: true, // ✅ Changed from isApproved to approved
          aiGenerated: false, // Mark as manually created
        },
      });

      console.log(`✅ Created ${q.difficulty} question for Unit ${q.unitNumber}`);
    }

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seedQuestions()
  .catch((e) => {
    console.error(e);
   // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });