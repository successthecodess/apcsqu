import { Router } from 'express';
import {
  getAdminStats,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  bulkUploadQuestions,
} from '../controllers/adminController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Stats
router.get('/stats', getAdminStats);

// Questions CRUD
router.get('/questions', getAllQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:questionId', updateQuestion);
router.delete('/questions/:questionId', deleteQuestion);
router.patch('/questions/:questionId/approve', approveQuestion);

// Bulk upload (with multer middleware)
router.post('/questions/bulk-upload', upload.single('file'), bulkUploadQuestions);

export default router;