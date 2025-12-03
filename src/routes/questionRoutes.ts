import { Router } from 'express';
import { getQuestionById } from '../controllers/questionController.js';

const router = Router();

router.get('/:questionId', getQuestionById);

export default router;