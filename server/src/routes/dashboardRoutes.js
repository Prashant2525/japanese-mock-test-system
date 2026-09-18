import { Router } from 'express';
import { requireAuth, requireCompletedLevel } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getDashboard } from '../controllers/dashboardController.js';

const router = Router();
router.get('/', requireAuth, requireCompletedLevel, asyncHandler(getDashboard));

export default router;

