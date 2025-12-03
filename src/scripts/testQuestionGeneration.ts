import dotenv from 'dotenv';
dotenv.config();

import prisma from '../config/database.js';
import questionService from '../services/questionService.js';
import { QuestionType, DifficultyLevel } from '@prisma/client';

async function testGeneration() {
  try {
    console.log('🧪 Testing Question Generation System\n');
    console.log('====================================\n');

    // Get first unit
    const unit = await prisma.unit.findFirst({
      where: { unitNumber: 1 },
    });

    if (!unit) {
      console.error('❌ No units found. Please run: npm run prisma:migrate && npx prisma db seed');
      process.exit(1);
    }

    console.log(`📚 Testing with Unit ${unit.unitNumber}: ${unit.name}\n`);

    // Test 1: Generate EASY multiple choice
    console.log('Test 1: Generating EASY Multiple Choice Question...');
    console.log('---------------------------------------------------');
    const easy = await questionService.generateAndStoreQuestion({
      unitId: unit.id,
      type: 'MULTIPLE_CHOICE' as QuestionType,
      difficulty: 'EASY' as DifficultyLevel,
      autoApprove: true,
    });
    
    console.log('✅ Question Generated!');
    console.log(`   ID: ${easy.question.id}`);
    console.log(`   Question: ${easy.question.questionText.substring(0, 150)}...`);
    console.log(`   Type: ${easy.question.type}`);
    console.log(`   Difficulty: ${easy.question.difficulty}`);
    console.log(`   Quality Score: ${easy.validation.score}/100`);
    console.log(`   Approved: ${easy.question.approved}`);
    if (easy.question.options) {
      console.log(`   Options: ${(easy.question.options as string[]).length} choices`);
    }
    console.log('');

    // Test 2: Generate MEDIUM free response
    console.log('Test 2: Generating MEDIUM Free Response Question...');
    console.log('----------------------------------------------------');
    const medium = await questionService.generateAndStoreQuestion({
      unitId: unit.id,
      type: 'FREE_RESPONSE' as QuestionType,
      difficulty: 'MEDIUM' as DifficultyLevel,
      autoApprove: true,
    });
    
    console.log('✅ Question Generated!');
    console.log(`   ID: ${medium.question.id}`);
    console.log(`   Question: ${medium.question.questionText.substring(0, 150)}...`);
    console.log(`   Type: ${medium.question.type}`);
    console.log(`   Difficulty: ${medium.question.difficulty}`);
    console.log(`   Quality Score: ${medium.validation.score}/100`);
    console.log(`   Approved: ${medium.question.approved}`);
    console.log('');

    // Test 3: Generate HARD code analysis
    console.log('Test 3: Generating HARD Code Analysis Question...');
    console.log('---------------------------------------------------');
    const hard = await questionService.generateAndStoreQuestion({
      unitId: unit.id,
      type: 'CODE_ANALYSIS' as QuestionType,
      difficulty: 'HARD' as DifficultyLevel,
      autoApprove: true,
    });
    
    console.log('✅ Question Generated!');
    console.log(`   ID: ${hard.question.id}`);
    console.log(`   Question: ${hard.question.questionText.substring(0, 150)}...`);
    console.log(`   Type: ${hard.question.type}`);
    console.log(`   Difficulty: ${hard.question.difficulty}`);
    console.log(`   Quality Score: ${hard.validation.score}/100`);
    console.log(`   Approved: ${hard.question.approved}`);
    if (hard.question.codeSnippet) {
      console.log(`   Has Code Snippet: Yes`);
    }
    console.log('');

    // Summary
    console.log('====================================');
    console.log('🎉 All Tests Passed Successfully!');
    console.log('====================================');
    console.log(`Total Questions Generated: 3`);
    console.log(`Average Quality Score: ${((easy.validation.score + medium.validation.score + hard.validation.score) / 3).toFixed(1)}/100`);
    console.log('');
    console.log('💡 You can view these questions in Prisma Studio:');
    console.log('   npm run prisma:studio');

  } catch (error) {
    console.error('\n❌ Test Failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testGeneration();