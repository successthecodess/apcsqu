import express from 'express';
import * as questionController from '../controllers/questionController.js';

const router = express.Router();

// Question generation
router.post('/generate', questionController.generateQuestion);
router.post('/generate/bulk', questionController.generateBulkQuestions);

// Question retrieval
router.get('/', questionController.getQuestions);
router.get('/random', questionController.getRandomQuestion);

// Question interaction
router.post('/submit', questionController.submitAnswer);

// Admin routes
router.patch('/:questionId/approve', questionController.approveQuestion);
router.patch('/:questionId/quality', questionController.updateQuality);

export default router;