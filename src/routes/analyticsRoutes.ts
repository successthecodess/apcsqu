import { Router } from 'express';
import { getAnalytics, downloadAnalyticsReport } from '../controllers/analyticsController.js';

const router = Router();

router.get('/', getAnalytics);
router.get('/download', downloadAnalyticsReport);

export default router;